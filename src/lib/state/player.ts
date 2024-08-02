import { HP, XP_PER_LEVEL } from "$lib/constants";
import { upgrades, weapons, type Upgrade, type Weapon } from "$lib/constants/upgrades";
import { State } from "$lib/core/utils";

const getDamageDone = () =>
	Object.keys(weapons).reduce(
		(acc, weapon) => {
			acc[weapon as Weapon] = 0;

			return acc;
		},
		{} as Record<Weapon, number>,
	);

const getInitialState = () => ({
	hp: HP,
	maxHp: HP,
	experience: 0,
	level: 1,
	toNextLevel: XP_PER_LEVEL,
	defeatedEnemies: 0,
	damageDone: getDamageDone(),
	damageTaken: 0,
	time: 0,
	upgrades: {} as Record<Upgrade, number | undefined>,
	weapons: { projectile: 1 } as Record<Weapon, number | undefined>,
	eligibleUpgrades: new Set(Object.keys(upgrades)),
	eligibleWeapons: new Set(Object.keys(weapons)),
});

const playerState = new State(getInitialState());

export const resetPlayer = () => Object.assign(playerState.state, getInitialState());

export const player = playerState.state;
