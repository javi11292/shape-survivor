import { PhysicsMotionType, Vector3 } from "$lib/engine";
import { assets } from "$lib/engine/assets";
import { createBody } from "$lib/engine/body";
import { createRender } from "$lib/engine/render";
import { game } from "$lib/state/game";
import { player } from "$lib/state/player";
import { isEntity } from "$lib/utils";
import type { Scene } from "@babylonjs/core";
import {
	getExperienceBodyMesh,
	getExperienceMesh,
	getExperienceShape,
	getUpgradeBodyMesh,
	getUpgradeMesh,
	getUpgradeShape,
} from "./utils";

const SPEED = 0.03;

type Params = {
	scene: Scene;
	position: Vector3;
	amount: number;
	upgrade?: boolean;
};

const experienceType = Symbol("experience");

export const isExperience = isEntity<ReturnType<typeof createExperience>>(experienceType);

export const createExperience = ({ scene, position, amount, upgrade }: Params) => {
	let target: Vector3 | undefined;

	const experience = {
		absorb: (nextTarget: Vector3) => {
			target = nextTarget;
		},
	};

	const body = createBody({ name: "experience", type: PhysicsMotionType.ANIMATED, scene });

	const mesh = upgrade
		? getUpgradeMesh().createInstance("upgrade")
		: getExperienceMesh().createInstance("experience");

	const node = body.transformNode;

	body.shape = upgrade
		? getUpgradeShape(getUpgradeBodyMesh(), scene)
		: getExperienceShape(getExperienceBodyMesh(), scene);

	node.addChild(mesh);
	node.position = position;
	node.metadata = experience;
	node.metadata.type = experienceType;

	node.onDisposeObservable.add(() => render.dispose());

	const render = createRender({
		scene,
		render: (delta) => {
			if (!target) {
				return;
			}

			if (Vector3.DistanceSquared(node.position, target) <= 1) {
				assets.suck.play();
				node.dispose();

				if (upgrade) {
					game.upgrade = true;
				}

				player.experience += amount;

				return;
			}

			node.lookAt(target);
			node.position.addInPlace(node.getDirection(new Vector3(0, 0, SPEED * delta)));
		},
	});

	return experience;
};
