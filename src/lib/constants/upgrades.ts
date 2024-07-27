type Enhancement = {
	key: string;
	name: string;
	description: string;
	amount: (value: number) => number;
	format: (value: number) => string;
};

const percentageAmount = (value: number) => 1 + value * 0.2;
const percentageFormat = (value: number) => `${Math.floor(value * 100)}%`;

export const upgrades = [
	{
		key: "damage",
		name: "Daño",
		description: "Aumenta el daño un 20%",
		amount: percentageAmount,
		format: percentageFormat,
	},
	{
		key: "hp",
		name: "Vida",
		description: "Aumenta la vida un 20%",
		amount: percentageAmount,
		format: percentageFormat,
	},
	{
		key: "attackSpeed",
		name: "Velocidad de ataque",
		description: "Aumenta la velocidad de ataque un 20%",
		amount: percentageAmount,
		format: percentageFormat,
	},
	{
		key: "speed",
		name: "Velocidad de movimiento",
		description: "Aumenta la velocidad de movimiento un 20%",
		amount: percentageAmount,
		format: percentageFormat,
	},
	{
		key: "armor",
		name: "Armadura",
		description: "Aumenta la armadura un 20%",
		amount: percentageAmount,
		format: percentageFormat,
	},
	{
		key: "range",
		name: "Rango de recogida",
		description: "Aumenta el radio de recogida un 20%",
		amount: percentageAmount,
		format: percentageFormat,
	},
	{
		key: "regen",
		name: "Regeneración",
		description: "Aumenta la regeneración de vida en 2 puntos",
		amount: (value: number) => 0 + value * 2,
		format: (value: number) => value.toString(),
	},
] as const satisfies Enhancement[];
