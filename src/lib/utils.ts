export const randomInt = (min: number, max: number) =>
	Math.floor(Math.random() * (max - min + 1)) + min;

export const randomItem = <T>(arr: T[]): T => {
	if (arr.length === 0) {
		throw new Error('Array is empty');
	}

	return arr[randomInt(0, arr.length - 1)];
};

export const randomItemConditional = <T>(
	arr: T[],
	condition: (item: T) => boolean,
	maxAttempts = arr.length
): T => {
	const firstRandomIndex = randomInt(0, arr.length - 1);

	for (let attempts = 0; attempts < maxAttempts; attempts++) {
		// If the first random selection doesn't work, we just increment
		// up from there, wrapping around the array if necessary. The
		// alternative would be to keep selecting new random indexes,
		// however it would be possible for a previously used index to
		// be selected (effectively guaranteed once you have tried more
		// than half the array).
		const wrappedOffset = (firstRandomIndex + attempts) % arr.length;
		const item = arr[wrappedOffset];
		if (condition(item)) {
			return item;
		}
	}

	if (maxAttempts === arr.length) {
		throw new Error('No item in array satisfied condition');
	}

	throw new Error(
		`Unable to find item in array that satisfies condition within ${maxAttempts} attempts`
	);
};

export const basicNumberArray = (length: number) => Array.from({ length }, (_, i) => i);

export const dedupe = <T>(arr: T[]): T[] => Array.from(new Set(arr));
