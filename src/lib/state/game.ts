import { State } from "$lib/core/utils";

const initialState = {
	mounted: true,
	running: true,
	wasted: false,
};

export const game = new State<typeof initialState & { dispose?: () => void }>(
	{ ...initialState },
	() => ({ ...initialState }),
);
