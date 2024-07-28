import { AMOUNT_PER_LEVEL } from "$lib/constants";
import { upgrades } from "$lib/constants/upgrades";
import { State } from "$lib/core/utils";

const initialUpgrades = {} as Record<(typeof upgrades)[number]["key"], number | undefined>;

const getInitialState = () => ({
	hp: 10,
	maxHp: 10,
	experience: 0,
	level: 1,
	toNextLevel: AMOUNT_PER_LEVEL,
	upgrades: { ...initialUpgrades },
});

export const player = new State(getInitialState(), getInitialState);
