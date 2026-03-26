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

export {};
