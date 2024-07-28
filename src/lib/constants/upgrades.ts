type Enhancement = {
	key: string;
	name: string;
	description?: string;
	label?: string;
	amount: (value: number) => number;
	format: (value: number) => string;
};

const ARMOR = 10;

const percentageAmount = (value: number) => 1 + value * 0.2;
const percentageFormat = (value: number) => `${Math.floor(value * 100)}%`;

export const upgrades = [
	{
		key: "damage",
		name: "Daño",
		amount: percentageAmount,
		format: percentageFormat,
	},
	{
		key: "hp",
		name: "Vida",
		amount: percentageAmount,
		format: percentageFormat,
	},
	{
		key: "attackSpeed",
		name: "Velocidad de ataque",
		amount: percentageAmount,
		format: percentageFormat,
	},
	{
		key: "speed",
		name: "Velocidad de movimiento",
		amount: percentageAmount,
		format: percentageFormat,
	},
	{
		key: "armor",
		name: "Armadura",
		label: "Reducción de daño",
		amount: (value: number) => ARMOR / (ARMOR + value),
		format: (value: number) => `${Math.floor((1 - value) * 100)}%`,
	},
	{
		key: "range",
		name: "Rango de recogida",
		amount: percentageAmount,
		format: percentageFormat,
	},
	{
		key: "regen",
		name: "Regeneración de vida",
		amount: (value: number) => value * 2,
		format: (value: number) => value.toString(),
	},
] as const satisfies Enhancement[];
