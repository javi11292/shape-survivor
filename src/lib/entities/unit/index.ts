import { upgrades } from "$lib/constants/upgrades";
import { assets } from "$lib/engine/assets";
import { createBody } from "$lib/engine/body";
import type { Mesh, PhysicsShape, Scene, Vector3 } from "@babylonjs/core";
import { createExperience } from "../experience";
import { getMesh, showDamage } from "./utils";

const EXPERIENCE = 1;

type Params = [
	{
		scene: Scene;
		state: { hp: number; upgrades?: { armor: number | undefined } };
		shape: Vector3[];
		getShape: (mesh: Mesh, scene: Scene) => PhysicsShape;
	},
	Omit<Parameters<typeof createBody>[0], "scene">,
];

export const createUnit = ({ scene, state, shape, getShape }: Params[0], bodyParams: Params[1]) => {
	const body = createBody({ scene, ...bodyParams });
	const node = body.transformNode;

	const unit = {
		body,
		mesh: getMesh(shape),
		hit: (damage: number, fromEnemy?: boolean) => {
			assets.hit.play();
			const finalDamage = damage * upgrades.armor.amount(state.upgrades?.armor || 0);

			state.hp -= finalDamage;

			if (state.hp <= 0) {
				state.hp = 0;
				node.dispose();

				if (!fromEnemy) {
					createExperience({ scene, position: node.position.clone(), amount: EXPERIENCE });
				}
			}

			showDamage({ point: node.position, damage: Math.ceil(finalDamage), scene, fromEnemy });
		},
	};

	node.metadata = unit;
	body.shape = getShape(unit.mesh, scene);

	return unit;
};
