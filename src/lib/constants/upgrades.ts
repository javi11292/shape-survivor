type Upgrade = {
	name: string;
	description?: string;
	label?: string;
	amount: (value: number) => number;
	format: (value: number) => string;
};

const ARMOR = 10;

const percentageAmount = (value: number) => 1 + value * 0.2;
const percentageFormat = (value: number) => `${Math.round(value * 100)}%`;

export const upgrades = {
	damage: {
		name: "Daño",
		amount: percentageAmount,
		format: percentageFormat,
	},
	hp: {
		name: "Vida",
		amount: percentageAmount,
		format: percentageFormat,
	},
	attackSpeed: {
		name: "Velocidad de ataque",
		amount: percentageAmount,
		format: percentageFormat,
	},
	movementSpeed: {
		name: "Velocidad de movimiento",
		amount: percentageAmount,
		format: percentageFormat,
	},
	armor: {
		name: "Armadura",
		label: "Reducción de daño",
		amount: (value: number) => ARMOR / (ARMOR + value),
		format: (value: number) => `${Math.round((1 - value) * 100)}%`,
	},
	range: {
		name: "Rango de recogida",
		amount: (value: number) => 1 + value * 0.4,
		format: percentageFormat,
	},
	regen: {
		name: "Regeneración de vida",
		amount: (value: number) => value * 0.2,
		format: (value: number) => (+value.toFixed(1)).toString(),
	},
	projectiles: {
		name: "Proyectiles",
		label: "Nº de proyectiles",
		amount: (value: number) => 1 + value * 0.5,
		format: (value: number) => (+value.toFixed(1)).toString(),
	},
} as const satisfies Record<string, Upgrade>;
