import { ENEMY_MASK, PLAYER_MASK, PROJECTILE_MASK } from "$lib/constants";
import { PhysicsMotionType, Vector3 } from "$lib/engine";
import { createBody } from "$lib/engine/body";
import { createRenderable } from "$lib/engine/renderable";
import { createTimer } from "$lib/engine/timer";
import { game } from "$lib/state/game";
import { isEntity } from "$lib/utils";
import type { Scene } from "@babylonjs/core";
import { isPlayer } from "../player";
import { createUnit } from "../unit";
import { getMesh, getShape } from "./utils";

const SPEED = 5;
const HP = 10;
const DAMAGE = 1;
const ATTACK_SPEED = 1000;

type Params = {
	scene: Scene;
	position: Vector3;
	target: Vector3;
};

const enemyType = Symbol("enemy");

export const isEnemy = isEntity<ReturnType<typeof createUnit>>(enemyType);

export const createEnemy = ({ scene, position, target }: Params) => {
	let attackEnabled = true;

	const renderable = createRenderable({
		scene,
		render: () => {
			unit.mesh.lookAt(target);
			unit.body.setLinearVelocity(unit.mesh.getDirection(new Vector3(0, 0, SPEED)));
		},
	});

	const timer = createTimer({
		repeat: false,
		scene,
		timeout: ATTACK_SPEED,
		callback: () => {
			attackEnabled = true;
		},
	});

	const damage = DAMAGE + DAMAGE * game.difficulty * 0.5;

	const unit = createUnit({
		scene,
		state: { hp: HP + HP * game.difficulty * 0.2 },
		mesh: getMesh().createInstance("enemy"),
		getBody: (mesh) =>
			createBody({
				scene,
				mesh,
				type: PhysicsMotionType.DYNAMIC,
				onCollision: ({ collidedAgainst }) => {
					const entity = collidedAgainst.transformNode.metadata;

					if (!isPlayer(entity)) {
						return;
					}

					if (!attackEnabled) {
						return;
					}

					attackEnabled = false;
					timer.start();
					entity.hit(damage, true);
				},
			}),
	});

	unit.mesh.metadata.type = enemyType;
	unit.mesh.position = position;
	unit.mesh.lookAt(target);
	unit.body.shape = getShape(unit.mesh.sourceMesh, scene);
	unit.body.shape.filterMembershipMask = ENEMY_MASK;
	unit.body.shape.filterCollideMask = PROJECTILE_MASK | PLAYER_MASK | ENEMY_MASK;

	unit.mesh.onDisposeObservable.add(() => {
		renderable.dispose();
		timer.dispose();
	});
};
