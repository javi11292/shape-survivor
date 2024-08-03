import { ENEMY_MASK, PROJECTILE_MASK, WALL_MASK } from "$lib/constants";
import { upgrades, weapons } from "$lib/constants/upgrades";
import { Axis, PhysicsMotionType, ProximityCastResult, Quaternion, Vector3 } from "$lib/engine";
import { assets } from "$lib/engine/assets";
import { createBody } from "$lib/engine/body";
import { createTimer } from "$lib/engine/timer";
import { game } from "$lib/state/game";
import { player } from "$lib/state/player";
import type { PhysicsBody, Scene } from "@babylonjs/core";
import { isEnemy } from "../enemy";
import { isWall } from "../map";
import { getBodyMesh, getMesh, getShape } from "./utils";

const SPEED = 50;
const LIFE_TIME = 750;
const EVOLVED_LIFE_TIME = 2000;
const IMPULSE_POSITION = Vector3.Zero();
const IMPULSE_FORCE = new Vector3(0, 0, 100);
const WEAPON = weapons.projectile.stats;

type Params = {
	scene: Scene;
	position: Vector3;
	target: Vector3;
	amount: number;
};

const targetClosestEnemy = (
	body: ReturnType<typeof createBody>,
	evolved: boolean,
	ignoreBody: PhysicsBody,
) => {
	if (!evolved) {
		return false;
	}

	const result = new ProximityCastResult();
	const node = body.transformNode;

	game.havok.pointProximity(
		{
			position: node.position,
			maxDistance: 40,
			shouldHitTriggers: true,
			collisionFilter: { membership: PROJECTILE_MASK, collideWith: ENEMY_MASK },
			ignoreBody: ignoreBody.isDisposed ? undefined : ignoreBody,
		},
		result,
	);

	if (result.body) {
		node.lookAt(
			result.body.transformNode.position.add(
				result.body.getLinearVelocity().scale(result.hitDistance / SPEED),
			),
		);
		node.computeWorldMatrix(true);
		body.setLinearVelocity(node.getDirection(new Vector3(0, 0, SPEED)));
		return true;
	}

	return false;
};

const addProjectile = ({ scene, position, target }: Omit<Params, "amount">) => {
	let rebound = false;
	const evolved = player.evolved.has("projectile");

	const body = createBody({
		scene,
		name: "projectile",
		type: PhysicsMotionType.ANIMATED,
		onTrigger: (trigger) => {
			const { metadata } = trigger.transformNode;

			if (isWall(metadata)) {
				node.dispose();

				return;
			}

			if (!isEnemy(metadata)) {
				return;
			}

			if (!rebound) {
				metadata.body.applyImpulse(
					node
						.getDirection(IMPULSE_FORCE)
						.scale(WEAPON.knockback.amount(player.weapons.projectile)),
					IMPULSE_POSITION,
				);
			}

			const damage =
				WEAPON.damage.amount(player.weapons.projectile) *
				upgrades.damage.amount(player.upgrades.damage);

			metadata.hit(damage);
			player.damageDone.projectile += damage;

			if (!targetClosestEnemy(body, evolved, trigger)) {
				node.dispose();
			} else {
				rebound = true;
			}
		},
	});

	const node = body.transformNode;
	const mesh = getMesh().createInstance("projectile");

	node.addChild(mesh);
	node.position = position;
	node.lookAt(target);
	node.rotate(Axis.Y, Math.PI);
	node.computeWorldMatrix();

	body.setLinearVelocity(node.getDirection(new Vector3(0, 0, SPEED)));
	body.shape = getShape(getBodyMesh(), scene);
	body.shape.filterMembershipMask = PROJECTILE_MASK;
	body.shape.filterCollideMask = ENEMY_MASK | WALL_MASK;
	body.shape.isTrigger = true;

	const timer = createTimer({
		scene,
		timeout: evolved ? EVOLVED_LIFE_TIME : LIFE_TIME,
		callback: () => node.dispose(),
	});

	node.onDisposeObservable.add(() => timer.dispose());
};

export const createProjectile = ({ scene, position, target, amount }: Params) => {
	assets.shot.play();
	const floor = Math.floor(amount);
	const randomAmount = floor + (Math.random() < amount - floor ? 1 : 0);
	const center = (randomAmount - 1) / 2;

	for (let i = 0; i < randomAmount; i++) {
		const rotation = Quaternion.RotationAxis(Axis.Y, ((i - center) * Math.PI) / 50);

		addProjectile({
			scene,
			position: position.rotateByQuaternionAroundPointToRef(rotation, target, Vector3.Zero()),
			target,
		});
	}
};
