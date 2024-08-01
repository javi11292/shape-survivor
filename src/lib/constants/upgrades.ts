type Upgrade = {
	name: string;
	label?: string;
	amount: (value?: number) => number;
	format: (value: number) => string;
};

type Weapon = {
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
		amount: percentageAmount(0.2),
		format: percentageFormat,
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
		amount: percentageAmount(0.5),
		format: fixedFormat,
	},
} as const satisfies Record<string, Upgrade>;

export const weapons = {
	projectile: {
		name: "Lanzapapas",
		description: "Lanza patatas al enemigo",
		stats: {
			damage: {
				label: "Daño",
				amount: (value = 0) => 10 * percentageAmount(0.2)(value - 1),
				format: fixedFormat,
			},
			knockback: {
				label: "Empuje",
				amount: (value = 0) => (value - 1) * 0.2,
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
				amount: (value = 0) => 20 * percentageAmount(0.4)(value - 1),
				format: fixedFormat,
			},
			projectiles: {
				label: "Disparos",
				amount: (value = 0) => value,
				format: fixedFormat,
			},
		},
	},
} as const satisfies Record<string, Weapon>;
