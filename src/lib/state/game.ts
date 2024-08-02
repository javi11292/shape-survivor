import { State } from "$lib/core/utils";
import { HavokPlugin } from "@babylonjs/core";

const getInitialState = () => ({
	difficulty: 0,
	mounted: true,
	running: true,
	wasted: false,
	levelup: false,
	havok: undefined as unknown as HavokPlugin,
	dispose: undefined as undefined | (() => void),
});

const gameState = new State(getInitialState());

export const resetGame = () => Object.assign(gameState.state, getInitialState());

export const game = gameState.state;
