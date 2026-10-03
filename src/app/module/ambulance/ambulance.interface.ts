import { AmbulanceType } from "../../../generated/prisma/enums";

export interface ICreateAmbulance {
	name: string;
	email: string;
	phone: string;
	address?: string;

	ambulance: {
		registrationNumber: string;
		type: AmbulanceType;
	};
}
