import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import type { ICreateDriverApplication, IPublicApplication } from "./driver.interface";
import { DriverApplicationStatus, Role } from "../../../generated/prisma/enums";

const createDriverApplication = async (payload: ICreateDriverApplication) => {
	const { password, ...applicationData } = payload;
	const hashedPassword = await bcrypt.hash(password, 8);

	const isExistAsUser = await prisma.user.findUnique({
		where: {
			email: applicationData.email,
			isDeleted: false,
		},
	});

	if (isExistAsUser) {
		throw new Error("Existed user can't apply as driver");
	}

	const isApplicationExist = await prisma.driverApplication.findFirst({
		where: {
			OR: [
				{
					email: applicationData.email,
					isDeleted: false,
				},
				{
					isDeleted: false,
					licenseNumber: applicationData.licenseNumber,
				},
			],
		},
	});

	if (isApplicationExist) {
		throw new Error(
			"Application already submitted with this email or license number",
		);
	}

	const application = prisma.driverApplication.create({
		data: {
			...applicationData,
			password: hashedPassword,
		},
		omit: {
			password: true,
		},
	});

	return application;
};

const getAllDriverApplications = async () => {
	const applications = await prisma.driverApplication.findMany({
		where: {
			isDeleted: false,
		},
		omit: {
			password: true,
		},
	});

	if (!applications || applications.length === 0) {
		throw new Error("No driver application found");
	}
	return applications;
};

const getSingleDriverApplication = async (id: string) => {
	const application = await prisma.driverApplication.findUnique({
		where: {
			id,
			isDeleted: false,
		},
		omit: {
			password: true,
		},
	});

	if (!application) {
		throw new Error("Driver application not found");
	}

	return application;
};

const getApplicationForPublic = async (payload: IPublicApplication) => {
	const { id, email } = payload;

	const application = await prisma.driverApplication.findFirst({
		where: {
			email,
			id,
			isDeleted: false,
		},
		omit: {
			password: true,
		},
	});

	if (!application) {
		throw new Error("Driver application not found");
	}

	return application;
};

const approvedDriverApplication = async (id: string) => {
	const result = await prisma.$transaction(async (tx) => {
		const application = await tx.driverApplication.findUnique({
			where: {
				id,
				isDeleted: false,
			},
		});

		if (!application) {
			throw new Error("Driver application not found");
		}

		if (application.status !== DriverApplicationStatus.PENDING) {
			throw new Error("Driver application already processed");
		}

		const user = await tx.user.create({
			data: {
				name: application.name,
				email: application.email,
				password: application.password,
				role: Role.DRIVER,
			},
		});

		const driver = await tx.driver.create({
			data: {
				userId: user.id,
				phone: application.phone,
				licenseNumber: application.licenseNumber,
				licenseExpiry: application.licenseExpiry,
			},
		});

		await tx.driverApplication.update({
			where: {
				id,
			},
			data: {
				status: DriverApplicationStatus.APPROVED,
			},
		});

		return {
			user,
			driver,
		};
	});

	return result;
};

const rejectDriverApplication = async (id: string) => {
	const application = await prisma.driverApplication.findUnique({
		where: {
			id,
			isDeleted: false,
		},
	});

	if (!application) {
		throw new Error("Driver application not found");
	}

	if (application.status !== DriverApplicationStatus.PENDING) {
		throw new Error("Driver application already processed");
	}

	const rejectedApplication = await prisma.driverApplication.update({
		where: {
			id,
		},
		data: {
			isDeleted: true,
			status: DriverApplicationStatus.REJECTED,
			deletedAt: new Date(),
		},
		omit: {
			password: true,
		},
	});

	return rejectedApplication;
};

const getAllDriver = async () => {
	const drivers = await prisma.user.findMany({
		where: {
			role: Role.DRIVER,
			isDeleted: false,
		},
		include: {
			driver: true,
		},
		omit: {
			password: true,
			googleId: true,
		},
	});

	if (!drivers || drivers.length === 0) {
		throw new Error("No driver found");
	}

	return drivers;
};

const getSingleDriver = async (id: string) => {
	const singleDriver = await prisma.user.findUnique({
		where: {
			id,
			isDeleted: false,
		},
		include: {
			driver: true,
		},
		omit: {
			password: true,
			googleId: true,
		},
	});

	if (!singleDriver) {
		throw new Error("Driver not found");
	}

	return singleDriver;
};

export const DriverService = {
	createDriverApplication,
	getAllDriverApplications,
	getSingleDriverApplication,
	getApplicationForPublic,
	approvedDriverApplication,
	rejectDriverApplication,
	getAllDriver,
	getSingleDriver,
};
