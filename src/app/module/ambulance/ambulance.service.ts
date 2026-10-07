import { AmbulanceStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import type { ICreateAmbulance, IUpdateAmbulance } from "./ambulance.interface";

const createAmbulance = async (payload: ICreateAmbulance) => {
	const { name, email, phone, ambulance } = payload;

	const provider = await prisma.ambulanceProvider.create({
		data: {
			name,
			email,
			phone,
			ambulance: {
				create: {
					registrationNumber: ambulance.registrationNumber,
					type: ambulance.type,
				},
			},
		},
		include: {
			ambulance: true,
		},
	});

	return provider;
};

const getAllAmbulance = async () => {
	const ambulances = await prisma.ambulance.findMany({
		where: {
			isDeleted: false,
		},

		include: {
			provider: true,
		},
	});

	if (!ambulances) {
		throw new Error("No ambulance found");
	}

	return ambulances;
};

const getSingleAmbulance = async (ambulance_id: string) => {
	const ambulance = await prisma.ambulance.findUnique({
		where: {
			id: ambulance_id,
			isDeleted: false,
		},
		include: {
			provider: true,
		},
	});

	if (!ambulance) {
		throw new Error("Ambulance not found");
	}

	if (ambulance?.isDeleted) {
		throw new Error("Ambulance is deleted");
	}

	return ambulance;
};

const updateAmbulance = async (
	payload: IUpdateAmbulance,
	ambulance_id: string,
) => {
	if (!payload) {
		throw new Error("Invalid data provided");
	}
	const { type, status } = payload;
	const ambulance = await prisma.ambulance.findUnique({
		where: {
			id: ambulance_id,
			isDeleted: false,
		},
	});

	if (!ambulance) {
		throw new Error("Ambulance not found");
	}

	if (status && ambulance.status === AmbulanceStatus.BUSY) {
		throw new Error("Can't change the status when ambulance is busy");
	}

	const result = await prisma.ambulance.update({
		where: {
			id: ambulance_id,
		},
		data: {
			type,
			status,
		},
	});

	return result;
};

const deleteAmbulance = async (id: string) => {
	const ambulance = await prisma.ambulance.findUnique({
		where: {
			id,
			isDeleted: false,
		},
	});

	if (!ambulance) {
		throw new Error("Ambulance not found");
	}

	const result = await prisma.ambulance.update({
		where: {
			id,
		},
		data: {
			isDeleted: true,
			deletedAt: new Date(),
		},
	});

	return result;
};

export const AmbulanceService = {
	createAmbulance,
	getAllAmbulance,
	getSingleAmbulance,
	updateAmbulance,
	deleteAmbulance,
};
