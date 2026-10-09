export interface ICreateDriverApplication {
	name: string;
	email: string;
	password: string;
	phone: string;
	licenseNumber: string;
	licenseExpiry?: Date;
}

export interface IDriverApplicationParams {
	id: string;
}

export interface IPublicApplication {
	id:string,
	email : string
}
