import { ENEMY_MASK, PROJECTILE_MASK } from "$lib/constants";
import { upgrades, weapons } from "$lib/constants/upgrades";
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

const POSITION = new Vector3(HEIGHT / 2 + 1.5, 0, 0);
const ROTATION = new Vector3(0, Math.PI / 2, 0);
const WEAPON = weapons.laser.stats;
const ROTATIONS = [
	ROTATION.scale(0),
	ROTATION.scale(2),
	ROTATION.scale(3),
	ROTATION.scale(1),
] as const;

type Params = {
	scene: Scene;
	position: Vector3;
};

const addLaser = ({
	scene,
	position,
	rotation,
	playSound,
}: Params & { rotation: Vector3; playSound: boolean }) => {
	const laser = new TransformNode("laser");
	const mesh = getMesh().createInstance("laser");

	mesh.position = POSITION;
	mesh.scaling.z = 0;

	laser.addChild(mesh);
	laser.rotation = rotation;
	laser.position = position;

	const sound = !playSound
		? undefined
		: createTimer({
				scene,
				timeout: LIFE_TIME - 100,
				callback: () => {
					assets.laser.play();
					sound?.dispose();
				},
			});

	const animation = createAnimation({
		scene,
		keyframes: KEYFRAMES,
		onAnimationEnd: () => laser.dispose(),
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

					const damage =
						WEAPON.damage.amount(player.weapons.laser) *
						upgrades.damage.amount(player.upgrades.damage);
					metadata.hit(damage);
					player.damageDone.laser += damage;
				},
			});

			const node = body.transformNode;
			node.position = mesh.absolutePosition;
			node.rotationQuaternion = mesh.absoluteRotationQuaternion;

			body.shape = getShape(mesh.sourceMesh, scene);
			body.shape.filterMembershipMask = PROJECTILE_MASK;
			body.shape.filterCollideMask = ENEMY_MASK;
			body.shape.isTrigger = true;

			scene.onAfterPhysicsObservable.addOnce(() => {
				node.dispose();
			});
		},
	});

	laser.onDisposeObservable.add(() => {
		timer.dispose();
		render.dispose();
		animation.dispose();
		sound?.dispose();
	});
};

export const createLaser = ({ scene, position }: Params) => {
	const projectiles = WEAPON.projectiles.amount(player.weapons.laser);

	for (let i = 0; i < projectiles; i++) {
		addLaser({ scene, position, rotation: ROTATIONS[i] || ROTATIONS[3], playSound: i === 0 });
	}
};
