import { ENEMY_MASK, PROJECTILE_MASK } from "$lib/constants";
import { PhysicsMotionType, Vector3 } from "$lib/engine";
import { createBody } from "$lib/engine/body";
import { createTimer } from "$lib/engine/timer";
import type { Scene } from "@babylonjs/core";
import type { createEnemy } from "../enemy";
import { getBodyMesh, getMesh, getShape, getSound } from "./utils";

const SPEED = 50;
const LIFE_TIME = 750;
const DAMAGE = 1;

type Params = {
	scene: Scene;
	position: Vector3;
	rotation: Vector3;
};

export const createProjectile = ({ scene, position, rotation }: Params) => {
	const sound = getSound(scene);
	sound.play();

	const mesh = getBodyMesh().createInstance("projectile body");
	mesh.addChild(getMesh().createInstance("projectile"));
	mesh.rotation = rotation;
	mesh.position = position;

	const body = createBody({
		scene,
		mesh,
		type: PhysicsMotionType.ANIMATED,
		onCollision: ({ collidedAgainst, point }) => {
			const enemy: ReturnType<typeof createEnemy> = collidedAgainst.transformNode.metadata;

			dispose();
			enemy.hit(DAMAGE, point as Vector3);
		},
	});

	const dispose = () => {
		mesh.dispose();
		timer.dispose();
	};

	body.setLinearVelocity(mesh.getDirection(new Vector3(0, 0, SPEED)));
	body.shape = getShape(mesh.sourceMesh, scene);
	body.shape.filterMembershipMask = PROJECTILE_MASK;
	body.shape.filterCollideMask = ENEMY_MASK;

	const timer = createTimer({ scene, timeout: LIFE_TIME, callback: dispose });
};
