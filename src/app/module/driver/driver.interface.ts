export interface ICreateDriverApplication {
	name: string;
	email: string;
	password: string;
	phone: string;
	licenseNumber: string;
	licenseExpiry?: Date;
}
export interface IVerifyDriverApplication {
	otp: string;
	email: string;
}
export interface IBackUpOTP {
	email: string;
}

export interface IDriverApplicationParams {
	id: string;
}

export interface IPublicApplication {
	id: string;
	email: string;
}
