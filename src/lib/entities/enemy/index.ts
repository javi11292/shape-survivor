import { ENEMY_MASK, PLAYER_MASK, PROJECTILE_MASK } from "$lib/constants";
import { PhysicsMotionType, Vector3 } from "$lib/engine";
import { createBody } from "$lib/engine/body";
import { createRenderable } from "$lib/engine/renderable";
import { isEntity } from "$lib/utils";
import type { Scene } from "@babylonjs/core";
import { isPlayer } from "../player";
import { createUnit } from "../unit";
import { getMesh, getShape } from "./utils";

const SPEED = 5;
const HP = 1;
const DAMAGE = 1;

type Params = {
	scene: Scene;
	position: Vector3;
	target: Vector3;
};

const enemyType = Symbol();

export const isEnemy = isEntity<ReturnType<typeof createUnit>>(enemyType);

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
		hp: HP,
		mesh: getMesh().createInstance("enemy"),
		getBody: (mesh) =>
			createBody({
				scene,
				mesh,
				type: PhysicsMotionType.DYNAMIC,
				onCollision: ({ collidedAgainst, point }) => {
					const entity = collidedAgainst.transformNode.metadata;

					if (!isPlayer(entity)) {
						return;
					}

					entity.hit(DAMAGE, point as Vector3, true);
				},
			}),
	});

	unit.mesh.metadata.type = enemyType;
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
	};
};
