import { HP_PER_LEVEL, XP_PER_LEVEL } from "$lib/constants";
import { upgrades, weapons } from "$lib/constants/upgrades";
import { State } from "$lib/core/utils";

const getInitialState = () => ({
	hp: HP_PER_LEVEL,
	maxHp: HP_PER_LEVEL,
	experience: 0,
	level: 1,
	toNextLevel: XP_PER_LEVEL,
	defeatedEnemies: 0,
	damageDone: 0,
	damageTaken: 0,
	time: 0,
	upgrades: {} as Record<keyof typeof upgrades, number | undefined>,
	weapons: { projectile: 1 } as Record<keyof typeof weapons, number | undefined>,
});

const playerState = new State(getInitialState());

export const resetPlayer = () => Object.assign(playerState.state, getInitialState());

export const player = playerState.state;
