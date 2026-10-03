import { prisma } from "../../lib/prisma";
import { ICreateAmbulance } from "./ambulance.interface";

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
	return ambulances;
};

const getSingleAmbulance = async (ambulance_id: string) => {
	const ambulance = await prisma.ambulance.findUnique({
		where: {
			id: ambulance_id,
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

export const AmbulanceService = {
	createAmbulance,
	getAllAmbulance,
	getSingleAmbulance,
};
