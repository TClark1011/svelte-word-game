import { getContext, setContext } from 'svelte';

export const composeContextHelpers = <Data>(key: string) => ({
	get: () => getContext<Data>(key),
	set: (data: Data) => setContext(key, data)
});
