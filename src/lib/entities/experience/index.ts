import { AMOUNT_PER_LEVEL, ITEM_MASK, PLAYER_AURA_MASK } from "$lib/constants";
import { PhysicsMotionType, Vector3 } from "$lib/engine";
import { assets } from "$lib/engine/assets";
import { createBody } from "$lib/engine/body";
import { createRenderable } from "$lib/engine/renderable";
import { game } from "$lib/state/game";
import { player } from "$lib/state/player";
import type { Scene } from "@babylonjs/core";
import { getBodyMesh, getMesh, getShape } from "./utils";

const SPEED = 0.02;

type Params = {
	scene: Scene;
	position: Vector3;
	amount: number;
};

export const createExperience = ({ scene, position, amount }: Params) => {
	const sound = assets.suck;

	const experience = {
		absorb: (nextTarget: Vector3) => {
			target = nextTarget;
		},

		dispose: () => {
			renderable.dispose();
			mesh.dispose();
		},
	};

	const mesh = getBodyMesh().createInstance("experience body");
	const body = createBody({ mesh, type: PhysicsMotionType.STATIC, scene });

	const renderable = createRenderable({
		scene,
		render: (delta) => {
			if (!target) {
				return;
			}

			if (Vector3.DistanceSquared(mesh.position, target) <= 1) {
				sound.play();
				experience.dispose();
				player.state.experience += amount;

				if (player.state.experience >= player.state.toNextLevel) {
					player.state.level++;
					player.state.experience -= player.state.toNextLevel;
					player.state.toNextLevel = player.state.level * AMOUNT_PER_LEVEL;
					game.state.levelup = true;
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

	mesh.addChild(childMesh);
	mesh.position = position;
	mesh.metadata = experience;

	body.shape = getShape(mesh.sourceMesh, scene);
	body.shape.filterMembershipMask = ITEM_MASK;
	body.shape.filterCollideMask = PLAYER_AURA_MASK;

	return experience;
};
