import { getContext, hasContext, setContext } from 'svelte';

export const composeContextHelpers = <Data>(key: string) => ({
	get: () => getContext<Data | undefined>(key), // returns undefined if the context has not been set
	getEssential: () => {
		// Throws an error if the context has not been set
		if (!hasContext(key)) {
			throw new Error(`Tried to access essential context "${key}" but it has not been set.`);
		}
		return getContext<Data>(key);
	},
	set: (data: Data) => setContext(key, data),
	has: () => hasContext(key)
});
