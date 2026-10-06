import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import type { ICreateDriverApplication } from "./driver.interface";
import { Role } from "../../../generated/prisma/enums";

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

export const DriverService = {
	createDriverApplication,
	getAllDriverApplications,
	getSingleDriverApplication,
};
