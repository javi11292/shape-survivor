import { State } from "$lib/core/utils";

const getInitialState = () => ({
	difficulty: 0,
	mounted: true,
	running: true,
	wasted: false,
	levelup: false,
	dispose: undefined as undefined | (() => void),
});

const gameState = new State(getInitialState());

export const resetGame = () => Object.assign(gameState.state, getInitialState());

export const game = gameState.state;
