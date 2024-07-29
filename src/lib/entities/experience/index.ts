import { ITEM_MASK, PLAYER_AURA_MASK, XP_PER_LEVEL } from "$lib/constants";
import { PhysicsMotionType, Vector3 } from "$lib/engine";
import { assets } from "$lib/engine/assets";
import { createBody } from "$lib/engine/body";
import { createRenderable } from "$lib/engine/renderable";
import { game } from "$lib/state/game";
import { player } from "$lib/state/player";
import { isEntity } from "$lib/utils";
import type { Scene } from "@babylonjs/core";
import { getBodyMesh, getMesh, getShape } from "./utils";

const SPEED = 0.02;

type Params = {
	scene: Scene;
	position: Vector3;
	amount: number;
};

const experienceType = Symbol("experience");

export const isExperience = isEntity<ReturnType<typeof createExperience>>(experienceType);

export const createExperience = ({ scene, position, amount }: Params) => {
	const mesh = getBodyMesh().createInstance("experience body");
	const body = createBody({ mesh, type: PhysicsMotionType.STATIC, scene });

	const renderable = createRenderable({
		scene,
		render: (delta) => {
			if (!target) {
				return;
			}

			if (Vector3.DistanceSquared(mesh.position, target) <= 1) {
				assets.suck.play();
				mesh.dispose();
				player.experience += amount;

				if (player.experience >= player.toNextLevel) {
					player.level++;
					player.experience -= player.toNextLevel;
					player.toNextLevel = player.level * XP_PER_LEVEL;
					game.levelup = true;
				}

				return;
			}

			mesh.lookAt(target);
			mesh.position.addInPlace(mesh.getDirection(new Vector3(0, 0, SPEED * delta)));
		},
	});

	let target: Vector3 | undefined;

	const childMesh = getMesh().createInstance("experience");
	childMesh.rotation.x = Math.PI / 2;

	const experience = {
		absorb: (nextTarget: Vector3) => {
			target = nextTarget;
		},
	};

	mesh.addChild(childMesh);
	mesh.position = position;
	mesh.metadata = experience;
	mesh.metadata.type = experienceType;

	body.shape = getShape(mesh.sourceMesh, scene);
	body.shape.filterMembershipMask = ITEM_MASK;
	body.shape.filterCollideMask = PLAYER_AURA_MASK;

	mesh.onDisposeObservable.add(() => renderable.dispose());

	return experience;
};
