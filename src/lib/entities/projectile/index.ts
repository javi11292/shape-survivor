import { ENEMY_MASK, PROJECTILE_MASK } from "$lib/constants";
import { upgrades, weapons } from "$lib/constants/upgrades";
import { Axis, PhysicsMotionType, Quaternion, Vector3 } from "$lib/engine";
import { assets } from "$lib/engine/assets";
import { createBody } from "$lib/engine/body";
import { createTimer } from "$lib/engine/timer";
import { player } from "$lib/state/player";
import type { Scene } from "@babylonjs/core";
import { isEnemy } from "../enemy";
import { isWall } from "../map";
import { getBodyMesh, getMesh, getShape } from "./utils";

const SPEED = 50;
const LIFE_TIME = 750;
const IMPULSE_POSITION = Vector3.Zero();
const IMPULSE_FORCE = new Vector3(0, 0, -100);

const weapon = weapons.projectile.stats;

type Params = {
	scene: Scene;
	position: Vector3;
	target: Vector3;
	amount: number;
};

const addProjectile = ({ scene, position, target }: Omit<Params, "amount">) => {
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

			metadata.body.applyImpulse(
				node.getDirection(IMPULSE_FORCE).scale(weapon.knockback.amount(player.weapons.projectile)),
				IMPULSE_POSITION,
			);

			const damage =
				weapon.damage.amount(player.weapons.projectile) *
				upgrades.damage.amount(player.upgrades.damage);

			metadata.hit(damage);
			player.damageDone += damage;
			node.dispose();
		},
	});

	const node = body.transformNode;
	const mesh = getMesh().createInstance("projectile");

	node.addChild(mesh);
	node.position = position;
	node.lookAt(target);
	node.computeWorldMatrix();

	body.setLinearVelocity(node.getDirection(new Vector3(0, 0, -SPEED)));
	body.shape = getShape(getBodyMesh(), scene);
	body.shape.filterMembershipMask = PROJECTILE_MASK;
	body.shape.filterCollideMask = ENEMY_MASK;
	body.shape.isTrigger = true;

	const timer = createTimer({ scene, timeout: LIFE_TIME, callback: () => node.dispose() });

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
