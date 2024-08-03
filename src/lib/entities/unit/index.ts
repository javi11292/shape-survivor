import { upgrades } from "$lib/constants/upgrades";
import { assets } from "$lib/engine/assets";
import { createBody } from "$lib/engine/body";
import type { Mesh, PhysicsShape, Scene, Vector3 } from "@babylonjs/core";
import { createExperience } from "../experience";
import { getMesh, showDamage } from "./utils";

const EXPERIENCE = 1;
const BOSS_EXPERIENCE = 5;

export enum TYPE {
	"player",
	"enemy",
	"boss",
}

type Params = [
	{
		scene: Scene;
		state: { hp: number; upgrades?: { armor: number | undefined } };
		shape: Vector3[];
		type: TYPE;
		getShape: (mesh: Mesh, scene: Scene) => PhysicsShape;
	},
	Omit<Parameters<typeof createBody>[0], "scene">,
];

export const createUnit = (
	{ scene, state, shape, type, getShape }: Params[0],
	bodyParams: Params[1],
) => {
	const body = createBody({ scene, ...bodyParams });
	const node = body.transformNode;

	if (type === TYPE.boss) {
		body.setMassProperties({ ...body.getMassProperties(), mass: 10 });
	}

	const unit = {
		body,
		mesh: getMesh(shape),
		hit: (damage: number) => {
			assets.hit.play();
			const finalDamage = damage * upgrades.armor.amount(state.upgrades?.armor || 0);

			state.hp -= finalDamage;

			if (state.hp <= 0) {
				state.hp = 0;
				node.dispose();

				if (type !== TYPE.player) {
					createExperience({
						scene,
						position: node.position.clone(),
						amount: type === TYPE.boss ? BOSS_EXPERIENCE : EXPERIENCE,
						upgrade: type === TYPE.boss,
					});
				}
			}

			showDamage({
				point: node.position,
				damage: Math.ceil(finalDamage),
				scene,
				fromEnemy: type === TYPE.player,
			});
		},
	};

	node.metadata = unit;
	body.shape = getShape(unit.mesh, scene);

	return unit;
};
