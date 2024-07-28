import { AMOUNT_PER_LEVEL } from "$lib/constants";
import { upgrades } from "$lib/constants/upgrades";
import { State } from "$lib/core/utils";

type Key = keyof typeof upgrades;

const initialUpgrades = (Object.keys(upgrades) as Key[]).reduce(
	(acc, key) => {
		acc[key] = 0;
		return acc;
	},
	{} as Record<Key, number>,
);

const getInitialState = () => ({
	hp: 10,
	maxHp: 10,
	experience: 0,
	level: 1,
	toNextLevel: AMOUNT_PER_LEVEL,
	upgrades: { ...initialUpgrades },
});

export const player = new State(getInitialState(), getInitialState);
