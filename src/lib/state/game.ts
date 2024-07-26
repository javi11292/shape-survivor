import { State } from "$lib/core/utils";

const initialState = {
	mounted: true,
	running: true,
};

export const game = new State<typeof initialState & { dispose?: () => void }>(
	{ ...initialState },
	() => ({ ...initialState }),
);
