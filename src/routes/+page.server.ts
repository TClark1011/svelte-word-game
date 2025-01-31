import type { PageServerLoad } from './$types';
import wordCount from '$lib/word-count.json';
import { randomInt } from '$lib/utils';

export const load: PageServerLoad = () => {
	const randomWordIndex = randomInt(0, wordCount - 1);

	return {
		wordIndex: randomWordIndex
	};
};
