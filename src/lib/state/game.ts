import { State } from "$lib/core/utils";

const getInitialState = () => ({
	mounted: true,
	running: true,
	wasted: false,
	levelup: false,
	dispose: undefined as undefined | (() => void),
});

export const game = State.create(getInitialState(), getInitialState);
