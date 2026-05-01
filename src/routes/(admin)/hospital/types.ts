/**
 * Represents a hospital with various properties.
 */
export interface Hospital {
	id: number;
	city: string;
	name: string;
	institutionCode: string;
	district: string;
	typeName: string;
	levelName: string;
	address: string;
	zipCode: string;
	introduction: string;
	lng: number;
	lat: number;
}
