import { ENEMY_MASK, PLAYER_MASK, PROJECTILE_MASK, WALL_MASK } from "$lib/constants";
import { PhysicsMotionType, Vector3 } from "$lib/engine";
import { createRender } from "$lib/engine/render";
import { createTimer } from "$lib/engine/timer";
import { game } from "$lib/state/game";
import { player } from "$lib/state/player";
import { isEntity } from "$lib/utils";
import type { Scene } from "@babylonjs/core";
import { isPlayer } from "../player";
import { createUnit } from "../unit";
import { getMesh, getShape, SHAPE } from "./utils";

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
	const damage = DAMAGE + DAMAGE * game.difficulty * 0.5;

	const unit = createUnit(
		{
			scene,
			state: { hp: HP + HP * game.difficulty * 0.2 },
			shape: SHAPE,
			getShape,
		},
		{
			name: "enemy",
			type: PhysicsMotionType.DYNAMIC,
			onCollision: (trigger) => {
				const { metadata } = trigger.transformNode;

				if (!isPlayer(metadata)) {
					return;
				}

				if (!attackEnabled) {
					return;
				}

				attackEnabled = false;
				timer.start();
				metadata.hit(damage, true);
				player.damageTaken += damage;
			},
		},
	);

	const mesh = getMesh().createInstance("enemy");
	const node = unit.body.transformNode;

	node.addChild(mesh);
	node.metadata.type = enemyType;
	node.position = position;
	unit.body.shape!.filterMembershipMask = ENEMY_MASK;
	unit.body.shape!.filterCollideMask = PROJECTILE_MASK | PLAYER_MASK | ENEMY_MASK | WALL_MASK;

	node.onDisposeObservable.add(() => {
		render.dispose();
		timer.dispose();
		player.defeatedEnemies++;
	});

	const render = createRender({
		scene,
		render: (delta) => {
			node.lookAt(target);

			unit.body.setLinearVelocity(
				Vector3.Lerp(
					unit.body.getLinearVelocity(),
					node.getDirection(new Vector3(0, 0, SPEED)),
					1 / delta,
				),
			);
		},
	});

	const timer = createTimer({
		repeat: false,
		autostart: false,
		scene,
		timeout: ATTACK_SPEED,
		callback: () => {
			attackEnabled = true;
		},
	});
};
