import { ITEM_MASK, PLAYER_AURA_MASK, XP_PER_LEVEL } from "$lib/constants";
import { PhysicsMotionType, Vector3 } from "$lib/engine";
import { assets } from "$lib/engine/assets";
import { createBody } from "$lib/engine/body";
import { createRender } from "$lib/engine/render";
import { game } from "$lib/state/game";
import { player } from "$lib/state/player";
import { isEntity } from "$lib/utils";
import type { Scene } from "@babylonjs/core";
import { getMesh, getShape } from "./utils";

const SPEED = 0.02;

type Params = {
	scene: Scene;
	position: Vector3;
	amount: number;
};

const experienceType = Symbol("experience");

export const isExperience = isEntity<ReturnType<typeof createExperience>>(experienceType);

export const createExperience = ({ scene, position, amount }: Params) => {
	let target: Vector3 | undefined;

	const experience = {
		absorb: (nextTarget: Vector3) => {
			target = nextTarget;
		},
	};

	const body = createBody({ name: "experience", type: PhysicsMotionType.ANIMATED, scene });

	const mesh = getMesh().createInstance("experience");
	const node = body.transformNode;

	body.shape = getShape(mesh.sourceMesh, scene);
	body.shape.filterMembershipMask = ITEM_MASK;
	body.shape.filterCollideMask = PLAYER_AURA_MASK;

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
				player.experience += amount;

				if (player.experience >= player.toNextLevel) {
					player.level++;
					player.experience -= player.toNextLevel;
					player.toNextLevel = player.level * XP_PER_LEVEL;
					game.levelup = true;
				}

				return;
			}

			node.lookAt(target);
			node.position.addInPlace(node.getDirection(new Vector3(0, 0, SPEED * delta)));
		},
	});

	return experience;
};
