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
import {
	EVOLVED_LIFE_TIME,
	HEIGHT,
	KEYFRAMES,
	LIFE_TIME,
	addGlow,
	getBodyMesh,
	getMesh,
	getShape,
} from "./utils";

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
	rotation,
	playSound,
	parent,
}: Omit<Params, "position"> & { rotation: Vector3; playSound: boolean; parent: TransformNode }) => {
	const evolved = player.evolved.has("laser");
	const laser = new TransformNode("laser");
	const mesh = getMesh().createInstance("laser");

	laser.rotation = rotation;
	laser.parent = parent;

	mesh.parent = laser;
	mesh.position = POSITION;
	mesh.scaling.z = 0;

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
		onAnimationEnd: () => !evolved && laser.dispose(),
		callback: (value) => (mesh.scaling.z = value),
	});

	const render = createRender({
		scene,
		render: () => parent.markAsDirty(),
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

			body.shape = getShape(getBodyMesh(), scene);
			body.shape.filterMembershipMask = PROJECTILE_MASK;
			body.shape.filterCollideMask = ENEMY_MASK;
			body.shape.isTrigger = true;

			node.parent = mesh;

			timer.dispose();
			mesh.onDisposeObservable.add(() => node.dispose());
		},
	});

	mesh.onDisposeObservable.add(() => {
		timer.dispose();
		animation.dispose();
		render.dispose();
		sound?.dispose();
	});
};

export const createLaser = ({ scene, position }: Params) => {
	const evolved = player.evolved.has("laser");

	const projectiles = WEAPON.projectiles.amount(player.weapons.laser);
	addGlow(scene);

	const parent = new TransformNode("laser");
	parent.position = position;

	const evolvedAnimation = !evolved
		? undefined
		: createAnimation({
				scene,
				keyframes: [
					{ frame: LIFE_TIME, value: 0 },
					{ frame: EVOLVED_LIFE_TIME, value: Math.PI },
				],
				onAnimationEnd: () => parent.dispose(),
				callback: (value) => (parent.rotation.y = value),
			});

	for (let i = 0; i < projectiles; i++) {
		addLaser({
			scene,
			rotation: (ROTATIONS[i] || ROTATIONS[3]).clone(),
			playSound: i === 0,
			parent,
		});
	}

	parent.onDisposeObservable.add(() => evolvedAnimation?.dispose());
};
