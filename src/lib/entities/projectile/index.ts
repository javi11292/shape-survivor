import { ENEMY_MASK, PROJECTILE_MASK } from "$lib/constants";
import { upgrades } from "$lib/constants/upgrades";
import { Axis, PhysicsMotionType, Quaternion, Vector3 } from "$lib/engine";
import { assets } from "$lib/engine/assets";
import { createBody } from "$lib/engine/body";
import { createTimer } from "$lib/engine/timer";
import { player } from "$lib/state/player";
import type { Scene } from "@babylonjs/core";
import { isEnemy } from "../enemy";
import { getBodyMesh, getMesh, getShape } from "./utils";

const SPEED = 50;
const LIFE_TIME = 750;
const DAMAGE = 10;

type Params = {
	scene: Scene;
	position: Vector3;
	target: Vector3;
	amount: number;
};

const addProjectile = ({ scene, position, target }: Omit<Params, "amount">) => {
	const mesh = getBodyMesh().createInstance("projectile body");
	mesh.addChild(getMesh().createInstance("projectile"));
	mesh.position = position;
	mesh.lookAt(target);
	mesh.rotation.y += Math.PI;

	const body = createBody({
		scene,
		mesh,
		type: PhysicsMotionType.ANIMATED,
		onCollision: ({ collidedAgainst }) => {
			const entity = collidedAgainst.transformNode.metadata;

			if (!isEnemy(entity)) {
				return;
			}

			mesh.dispose();
			entity.hit(DAMAGE * upgrades.damage.amount(player.upgrades.damage));
		},
	});

	body.setLinearVelocity(mesh.getDirection(new Vector3(0, 0, SPEED)));
	body.shape = getShape(mesh.sourceMesh, scene);
	body.shape.filterMembershipMask = PROJECTILE_MASK;
	body.shape.filterCollideMask = ENEMY_MASK;

	const timer = createTimer({ scene, timeout: LIFE_TIME, callback: () => mesh.dispose() });

	mesh.onDisposeObservable.add(() => timer.dispose());
};

export const createProjectile = ({ scene, position, target, amount }: Params) => {
	assets.shot.play();
	const randomAmount = Math.random() < 0.5 ? Math.floor(amount) : Math.ceil(amount);
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
