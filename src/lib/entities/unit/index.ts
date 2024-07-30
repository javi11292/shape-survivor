import { upgrades } from "$lib/constants/upgrades";
import { assets } from "$lib/engine/assets";
import { createBody } from "$lib/engine/body";
import type { Scene } from "@babylonjs/core";
import { createExperience } from "../experience";
import { SHAPE, getShape, showDamage } from "./utils";

const EXPERIENCE = 1;

type Params = [
	{
		scene: Scene;
		state: { hp: number; upgrades?: { armor: number } };
	},
	Omit<Parameters<typeof createBody>[0], "scene">,
];

export { SHAPE };

export const createUnit = ({ scene, state }: Params[0], bodyParams: Params[1]) => {
	const body = createBody({ scene, ...bodyParams });
	const node = body.transformNode;

	const unit = {
		body,
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
	body.shape = getShape(scene);

	const observer = scene.onAfterPhysicsObservable.add(() => {
		node.position.y = 0;
	});

	node.onDisposeObservable.add(() => scene.onAfterPhysicsObservable.remove(observer));

	return unit;
};
