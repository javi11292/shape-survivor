import { ENEMY_MASK, PLAYER_MASK, PROJECTILE_MASK } from "$lib/constants";
import { PhysicsMotionType, Vector3 } from "$lib/engine";
import { createBody } from "$lib/engine/body";
import { createRenderable } from "$lib/engine/renderable";
import type { Scene } from "@babylonjs/core";
import { createUnit } from "../unit";
import { getMesh, getShape } from "./utils";

const SPEED = 5;

type Params = {
	scene: Scene;
	position: Vector3;
	target: Vector3;
};

export const enemyType = Symbol();

export const createEnemy = ({ scene, position, target }: Params) => {
	const entity = createRenderable({
		scene,
		render: () => {
			unit.mesh.lookAt(target);
			unit.body.setLinearVelocity(unit.mesh.getDirection(new Vector3(0, 0, SPEED)));
		},
	});

	const unit = createUnit({
		scene,
		mesh: getMesh().createInstance("enemy"),
		getBody: (mesh) => createBody({ scene, mesh, type: PhysicsMotionType.DYNAMIC }),
	});

	unit.mesh.position = position;
	unit.mesh.lookAt(target);
	unit.body.shape = getShape(unit.mesh.sourceMesh, scene);
	unit.body.shape.filterMembershipMask = ENEMY_MASK;
	unit.body.shape.filterCollideMask = PROJECTILE_MASK | PLAYER_MASK | ENEMY_MASK;

	const unitDispose = unit.dispose;

	unit.dispose = () => {
		unitDispose();
		entity.dispose();
	};

	return {
		hit: unit.hit,
		dispose: unit.dispose,
		type: enemyType,
	};
};
