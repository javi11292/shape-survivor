type Enhancement = {
	key: string;
	name: string;
	description: string;
};

export const upgrades: Enhancement[] = [
	{
		key: "damage",
		name: "Daño",
		description: "Aumenta el daño un 20%",
	},
	{
		key: "hp",
		name: "Vida",
		description: "Aumenta la vida un 20%",
	},
	{
		key: "attackSpeed",
		name: "Velocidad de ataque",
		description: "Aumenta la velocidad de ataque un 20%",
	},
	{
		key: "speed",
		name: "Velocidad de movimiento",
		description: "Aumenta la velocidad de movimiento un 20%",
	},
];
