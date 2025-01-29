export const randomItem = <T>(arr: T[]): T => {
	if (arr.length === 0) {
		throw new Error('Array is empty');
	}

	return arr[Math.floor(Math.random() * arr.length)];
};

export const basicNumberArray = (length: number) => Array.from({ length }, (_, i) => i);

export const dedupe = <T>(arr: T[]): T[] => Array.from(new Set(arr));
