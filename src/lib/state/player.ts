import { HP_PER_LEVEL, XP_PER_LEVEL } from "$lib/constants";
import { upgrades } from "$lib/constants/upgrades";
import { State } from "$lib/core/utils";

type Key = keyof typeof upgrades;

const initialUpgrades = Object.keys(upgrades).reduce(
	(acc, key) => {
		acc[key as Key] = 0;
		return acc;
	},
	{} as Record<Key, number>,
);

const getInitialState = () => ({
	hp: HP_PER_LEVEL,
	maxHp: HP_PER_LEVEL,
	experience: 0,
	level: 1,
	toNextLevel: XP_PER_LEVEL,
	defeatedEnemies: 0,
	damageDone: 0,
	damageTaken: 0,
	startTime: Date.now(),
	upgrades: { ...initialUpgrades },
});

const playerState = new State(getInitialState());

export const resetPlayer = () => Object.assign(playerState.state, getInitialState());

export const player = playerState.state;
