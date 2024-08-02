import { HP } from ".";

type UpgradeInfo = {
	name: string;
	label?: string;
	amount: (value?: number) => number;
	format: (value: number) => string;
};

type WeaponInfo = {
	name: string;
	description: string;
	stats: Record<
		string,
		{ amount: (value?: number) => number; format: (value: number) => string; label: string }
	>;
};

const ARMOR = 10;

const percentageAmount =
	(amount: number) =>
	(value = 0) =>
		1 + value * amount;

const percentageFormat = (value: number) => `${Math.round(value * 100)}%`;
const fixedFormat = (value: number) => (+value.toFixed(1)).toString();

export const upgrades = {
	damage: {
		name: "Daño",
		amount: percentageAmount(0.2),
		format: percentageFormat,
	},
	hp: {
		name: "Vida",
		amount: (value = 0) => HP * percentageAmount(0.4)(value),
		format: fixedFormat,
	},
	attackSpeed: {
		name: "Velocidad de ataque",
		amount: percentageAmount(0.2),
		format: percentageFormat,
	},
	movementSpeed: {
		name: "Velocidad de movimiento",
		amount: percentageAmount(0.15),
		format: percentageFormat,
	},
	armor: {
		name: "Armadura",
		label: "Reducción de daño",
		amount: (value = 0) => ARMOR / (ARMOR + value),
		format: (value) => `${Math.round((1 - value) * 100)}%`,
	},
	range: {
		name: "Rango de recogida",
		amount: percentageAmount(0.4),
		format: percentageFormat,
	},
	regen: {
		name: "Regeneración de vida",
		amount: (value = 0) => value * 0.2,
		format: fixedFormat,
	},
	projectiles: {
		name: "Proyectiles",
		label: "Nº de proyectiles",
		amount: (value = 0) => {
			if (value === 5) {
				return 4;
			}

			return percentageAmount(0.5)(value);
		},
		format: fixedFormat,
	},
} as const satisfies Record<string, UpgradeInfo>;

export const weapons = {
	projectile: {
		name: "Lanzapapas",
		description: "Lanza patatas al enemigo",
		stats: {
			damage: {
				label: "Daño",
				amount: (value = 0) => 10 * percentageAmount(0.25)(value - 1),
				format: fixedFormat,
			},
			knockback: {
				label: "Empuje",
				amount: (value = 0) => (value - 1) * 0.375,
				format: fixedFormat,
			},
		},
	},
	laser: {
		name: "Laser destructor",
		description: "Dispara un rayo laser que atraviesa a los enemigos",
		stats: {
			damage: {
				label: "Daño",
				amount: (value = 0) => 20 * percentageAmount(0.5)(value - 1),
				format: fixedFormat,
			},
			projectiles: {
				label: "Disparos",
				amount: (value = 0) => {
					if (value < 2) {
						return value;
					}

					if (value > 3) {
						return value - 1;
					}

					return 2;
				},
				format: fixedFormat,
			},
		},
	},
} as const satisfies Record<string, WeaponInfo>;

export type Upgrade = keyof typeof upgrades;
export type Weapon = keyof typeof weapons;
