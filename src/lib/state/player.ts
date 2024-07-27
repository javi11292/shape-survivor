import { AMOUNT_PER_LEVEL } from "$lib/constants";
import { upgrades } from "$lib/constants/upgrades";
import { State } from "$lib/core/utils";

const initialState = {
	hp: 10,
	maxHp: 10,
	experience: 0,
	level: 1,
	toNextLevel: AMOUNT_PER_LEVEL,
	upgrades: {} as Record<(typeof upgrades)[number]["key"], number | undefined>,
};

export const player = new State({ ...initialState }, () => ({ ...initialState }));
