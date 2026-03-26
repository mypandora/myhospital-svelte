/**
 * Represents a geographical location with coordinates and type.
 */
export interface LngLat {
	coordinates: number[];
	type: string;
}

/**
 * Represents a hospital with various properties.
 */
export interface Hospital {
	id: number;
	city: string;
	name: string;
	code: string;
	district: string;
	type: string;
	lvl: string;
	address: string;
	zipCode: string;
	introduction: string;
	lngLat?: LngLat;
}
