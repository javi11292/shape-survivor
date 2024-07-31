import { ENEMY_MASK, PROJECTILE_MASK } from "$lib/constants";
import { upgrades } from "$lib/constants/upgrades";
import { PhysicsMotionType, TransformNode, Vector3 } from "$lib/engine";
import { createAnimation } from "$lib/engine/animation";
import { assets } from "$lib/engine/assets";
import { createBody } from "$lib/engine/body";
import { createRender } from "$lib/engine/render";
import { createTimer } from "$lib/engine/timer";
import { player } from "$lib/state/player";
import type { Scene } from "@babylonjs/core";
import { isEnemy } from "../enemy";
import { HEIGHT, KEYFRAMES, LIFE_TIME, getMesh, getShape } from "./utils";

const DAMAGE = 20;
const POSITION = new Vector3(HEIGHT / 2 + 1.5, 0, 0);

type Params = {
	scene: Scene;
	position: Vector3;
};

export const createLaser = ({ scene, position }: Params) => {
	const laser = new TransformNode("laser");
	const mesh = getMesh().createInstance("laser");

	mesh.position = POSITION;
	mesh.scaling.z = 0;

	laser.addChild(mesh);
	laser.position = position;

	const sound = createTimer({
		scene,
		timeout: LIFE_TIME - 100,
		callback: () => {
			assets.laser.play();
			sound.dispose();
		},
	});

	const animation = createAnimation({
		scene,
		keyframes: KEYFRAMES,
		callback: (value) => (mesh.scaling.z = value),
	});

	const render = createRender({
		scene,
		render: () => laser.markAsDirty(),
	});

	const timer = createTimer({
		scene,
		timeout: LIFE_TIME,
		callback: () => {
			const body = createBody({
				scene,
				name: "laser",
				type: PhysicsMotionType.ANIMATED,
				onTrigger: (trigger) => {
					const { metadata } = trigger.transformNode;

					if (!isEnemy(metadata)) {
						return;
					}

					const damage = DAMAGE * upgrades.damage.amount(player.upgrades.damage);
					metadata.hit(damage);
					player.damageDone += damage;
				},
			});

			const node = body.transformNode;
			node.position = mesh.absolutePosition;

			body.shape = getShape(mesh.sourceMesh, scene);
			body.shape.filterMembershipMask = PROJECTILE_MASK;
			body.shape.filterCollideMask = ENEMY_MASK;
			body.shape.isTrigger = true;

			scene.onAfterPhysicsObservable.addOnce(() => {
				laser.dispose();
			});

			laser.onDisposeObservable.add(() => {
				node.dispose();
			});
		},
	});

	laser.onDisposeObservable.add(() => {
		timer.dispose();
		render.dispose();
		sound.dispose();
		animation.dispose();
	});
};
