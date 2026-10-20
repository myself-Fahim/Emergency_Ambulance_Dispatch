/** biome-ignore-all lint/style/useConst: <explanation> */
import bcrypt from "bcryptjs";
import type { JwtPayload, SignOptions } from "jsonwebtoken";
import crypto from "crypto"
import ejs from "ejs"
import {
	AuthProvider,
	Role,
	UserStatus,
} from "../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import {
	type googleLoginPayload,
	type ILoginUserPayload,
	type IRegisterCustomerPayload,
	IRequestUser,
} from "./auth.interface";
import { googleClient } from "../../lib/googleClient";
import { redisCLient } from "../../lib/redis";
import path from "path";
import { transporter } from "../../lib/nodemailer";

const registerCustomer = async (payload: IRegisterCustomerPayload) => {
	const { name, password } = payload;
	const email = payload.email.trim().toLowerCase();

	const isUserExists = await prisma.user.findUnique({
		where: { email },
	});

	if (isUserExists) {
		throw new Error("User with this email already exists");
	}

	const isAppliedAsDriver = await prisma.driverApplication.findFirst({
		where: {
			email,
			isDeleted: false,
		},
	});

	if (isAppliedAsDriver) {
		throw new Error("Already applied as driver can't register");
	}


	const hashedPassword = await bcrypt.hash(password, 8)
	const redisUserPayload = {
		name,
		email,
		hashedPassword
	}


	const key = `redis-verification-otp:${email}`
	const otp = crypto.randomInt(100000, 1000000)
	await redisCLient.set(key, otp, {
		expiration: {
			type: "EX",
			value: 5 * 60
		}
	})

	const payloadKey = `redis-verification-payload:${email}`
	await redisCLient.set(payloadKey, JSON.stringify(redisUserPayload), {
		expiration: {
			type: "EX",
			value: 5 * 60
		}
	})


	const templatePath = path.join(process.cwd(), "/src/app/templates/verification-email.ejs")
	const html = await ejs.renderFile(templatePath, {
		otp,
		userName: name,
		expirationTime: 5
	})

	await transporter.sendMail({
		from: config.smtp_user,
		to: email,
		subject: "Email Verification",
		html
	})

	// const hashedPassword = await bcrypt.hash(password, 8);

	// const createdUser = await prisma.user.create({
	// 	data: {
	// 		name,
	// 		email,
	// 		password: hashedPassword,
	// 		customer: {
	// 			create: {},
	// 		},
	// 	},
	// 	include: {
	// 		customer: true,
	// 	},
	// 	omit: { password: true },
	// });

	// const { ...user } = createdUser;
	// const jwtPayload = {
	// 	userId: user.id,
	// 	name: user.name,
	// 	email: user.email,
	// 	role: user.role,
	// };

	// const accessToken = jwtUtils.createToken(
	// 	jwtPayload,
	// 	config.jwt_access_secret,
	// 	config.jwt_access_expires_in as SignOptions,
	// );

	// const refreshToken = jwtUtils.createToken(
	// 	jwtPayload,
	// 	config.jwt_refresh_secret,
	// 	config.jwt_refresh_expires_in as SignOptions,
	// );

	// return {
	// 	user,
	// 	accessToken,
	// 	refreshToken,
	// };
};

const loginUser = async (payload: ILoginUserPayload) => {
	const { password } = payload;
	const email = payload.email.trim().toLowerCase();

	const user = await prisma.user.findUnique({
		where: { email },
	});

	if (!user) {
		throw new Error("User not found");
	}

	if (user.status === UserStatus.BLOCKED) {
		throw new Error("User is blocked");
	}

	if (user.isDeleted || user.status === UserStatus.DELETED) {
		throw new Error("User is deleted");
	}

	if (user.authProvider === AuthProvider.GOOGLE) {
		throw new Error("Can't login with credentials,try again with google login");
	}

	const isPasswordMatched = await bcrypt.compare(
		password,
		user.password as string,
	);

	if (!isPasswordMatched) {
		throw new Error("Invalid credentials");
	}

	const jwtPayload = {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		accessToken,
		refreshToken,
	};
};

const refreshToken = async (token: string) => {
	const verifiedRefreshToken = jwtUtils.verifyToken(
		token,
		config.jwt_refresh_secret,
	);

	if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
		throw new Error(
			config.node_env === "development"
				? verifiedRefreshToken.error
				: "Invalid refresh token",
		);
	}

	const data = verifiedRefreshToken.data as JwtPayload;

	const user = await prisma.user.findUnique({
		where: { id: data.userId },
	});

	if (!user || user.isDeleted || user.status !== UserStatus.ACTIVE) {
		throw new Error("User is inactive or not found");
	}

	const jwtPayload = {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		accessToken,
		refreshToken,
	};
};

const googleLogin = async (payload: googleLoginPayload) => {
	let googleLoginTokenPayload = null;

	try {
		const ticket = await googleClient.verifyIdToken({
			idToken: payload.idToken,
			audience: config.google_client_id,
		});
		googleLoginTokenPayload = ticket.getPayload();
	} catch (error) {
		console.log("Google login error", error);
		throw new Error("Google login failed");
	}

	if (!googleLoginTokenPayload) {
		throw new Error("Invalid token");
	}
	if (!googleLoginTokenPayload.name) {
		throw new Error("Google account name not found");
	}
	if (!googleLoginTokenPayload.email) {
		throw new Error("Google account email not found");
	}

	const isUserGoogleAuthExist = await prisma.user.findUnique({
		where: {
			email: googleLoginTokenPayload?.email,
			googleId: googleLoginTokenPayload?.sub,
		},
	});

	let user = isUserGoogleAuthExist;

	if (!isUserGoogleAuthExist) {
		const isUserCredentialExist = await prisma.user.findUnique({
			where: {
				email: googleLoginTokenPayload?.email,
				authProvider: AuthProvider.CREDENTIAL,
			},
		});

		if (isUserCredentialExist) {
			if (
				isUserCredentialExist.isDeleted ||
				isUserCredentialExist.status === UserStatus.DELETED
			) {
				throw new Error("User is deleted");
			}
			if (isUserCredentialExist.status === UserStatus.BLOCKED) {
				throw new Error("User is blocked");
			}

			user = await prisma.user.update({
				where: {
					id: isUserCredentialExist.id,
				},
				data: {
					emailVerified: true,
					googleId: googleLoginTokenPayload?.sub,
				},
			});
		} else {
			user = await prisma.user.create({
				data: {
					name: googleLoginTokenPayload?.name,
					email: googleLoginTokenPayload?.email,
					authProvider: AuthProvider.GOOGLE,
					googleId: googleLoginTokenPayload?.sub,
					emailVerified: true,
					role: Role.CUSTOMER,
					customer: {
						create: {},
					},
				},
			});
		}
	}

	if (!user) {
		throw new Error("User not found");
	}

	if (user.isDeleted || user.status === UserStatus.DELETED) {
		throw new Error("User is deleted");
	}
	if (user.status === UserStatus.BLOCKED) {
		throw new Error("User is blocked");
	}

	const jwtPayload = {
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		accessToken,
		refreshToken,
	};
};


const forgetPassword = async (payload: any) => {

	const { email } = payload
	const isUserExists = await prisma.user.findUnique({
		where: {
			email,
			isDeleted: false
		}
	})

	if (!isUserExists) {
		throw new Error('User not found')
	}

	if (isUserExists.authProvider === AuthProvider.GOOGLE) {
		throw new Error("User is registered with google!")
	}

	if (isUserExists.status === UserStatus.BLOCKED) {
		throw new Error("User is blocked")
	}

	const key = `redis-forgot-otp:${email}`
	const otp = crypto.randomInt(100000, 1000000)

	await redisCLient.set(key, otp, {
		expiration: {
			type: "EX",
			value: 5 * 60
		}
	})

	const templatePath = path.join(process.cwd(), "/src/app/templates/forgot-password.ejs")
	const html = await ejs.renderFile(templatePath, {
		otp,
		userName: isUserExists.name,
		expirationTime: 5
	})

	await transporter.sendMail({
		from: config.smtp_user,
		to: isUserExists.email,
		subject: "Forget Password",
		html
	})


}


const resetPassword = async (payload: any) => {

	const { email, newPassword, otp } = payload

	const isUserExists = await prisma.user.findUnique({
		where: {
			email,
			isDeleted: false
		}
	})

	if (!isUserExists) {
		throw new Error('User not found')
	}


	if (isUserExists.status === UserStatus.BLOCKED) {
		throw new Error("User is blocked")
	}

	const key = `redis-forgot-otp:${email}`
	const getRedisOtp = await redisCLient.get(key)

	if (!getRedisOtp) {
		throw new Error("Invalid OTP")
	}

	if (getRedisOtp !== otp) {
		throw new Error("OTP doesen't matched")
	}

	const hashNewPassword = await bcrypt.hash(newPassword, 8)

	await prisma.user.update({
		where: {
			email: isUserExists.email
		},
		data: {
			password: hashNewPassword
		},
	})

	await redisCLient.del(key)

	const templatePath = path.join(process.cwd(), "/src/app/templates/changed-password.ejs")

	const html = await ejs.renderFile(templatePath, {
		userName: isUserExists.name,
	})

	await transporter.sendMail({
		from: config.smtp_user,
		to: isUserExists.email,
		subject: "Reset Password",
		html
	})


}

const getMyProfile = async (user_id: string) => {
	const userProfile = await prisma.user.findUnique({
		where: {
			id: user_id,
		},

		select: {
			role: true,
		},
	});

	if (!userProfile) {
		throw new Error("User not found");
	}

	const include =
		userProfile.role === Role.DRIVER
			? { driver: true }
			: userProfile.role === Role.CUSTOMER
				? { customer: true }
				: { customer: false, driver: false };

	const user = await prisma.user.findUnique({
		where: {
			id: user_id,
		},

		omit: {
			password: true,
			googleId: true,
		},
		include,
	});

	return user;
};

export const AuthService = {
	registerCustomer,
	loginUser,
	refreshToken,
	googleLogin,
	getMyProfile,
	forgetPassword,
	resetPassword
};
