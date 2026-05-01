// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: User; // 根据实际情况设置类型
			token?: string;
			refreshToken?: string;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
	interface Window {
		AMapLoader: any;
		_AMapSecurityConfig: any;
	}
}

interface User {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	photo: string;
	role: string;
}

interface Hospital {
	id: string;
	institutionCode: string;
	name: string;
	typeCode: string | null;
	typeName: string | null;
	levelCode: string | null;
	levelName: string | null;
	hospitalGradeCode: string | null;
	address: string | null;
	regionCode: string | null;
	city: string | null;
	district: string | null;
	lat: number | null;
	lng: number | null;
	socialCreditCode: string | null;
	nature: string | null;
	electronicInsuranceEnabled: boolean | null;
	zipCode: string | null;
	introduction: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export {};
