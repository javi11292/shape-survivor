import { ITEM_MASK, PLAYER_AURA_MASK, PLAYER_MASK } from "$lib/constants";
import { upgrades } from "$lib/constants/upgrades";
import { effect } from "$lib/core/utils";
import {
	CreateCylinder,
	CreatePolygon,
	PhysicsMotionType,
	PhysicsShapeConvexHull,
	UniversalCamera,
	Vector3,
} from "$lib/engine";
import { createBody } from "$lib/engine/body";
import { createRenderable } from "$lib/engine/renderable";
import { createTimer } from "$lib/engine/timer";
import { game } from "$lib/state/game";
import { player } from "$lib/state/player";
import { isEntity } from "$lib/utils";
import type { Scene } from "@babylonjs/core";
import earcut from "earcut";
import { createProjectile } from "../projectile";
import { SHAPE, createUnit } from "../unit";
import { KEYS, addEvents } from "./utils";

const SPEED = 0.01;
const SQRT_SPEED = Math.sqrt(Math.pow(SPEED, 2) / 2);
const PROJECTILE_POSITION = new Vector3(0, 0, 1);
const SHOT_SPEED = 1000;
const AURA_RADIUS = 2.5;

type Params = {
	scene: Scene;
};

const playerType = Symbol("player");

export const isPlayer = isEntity<ReturnType<typeof createUnit>>(playerType);

export const createPlayer = ({ scene }: Params) => {
	const renderable = createRenderable({
		scene,
		render: (delta) => {
			if (input.size > 0) {
				const position = new Vector3();

				input.forEach((key) => {
					switch (key) {
						case KEYS.right:
							position.x = 1;
							break;
						case KEYS.left:
							position.x = -1;
							break;
						case KEYS.up:
							position.z = 1;
							break;
						case KEYS.down:
							position.z = -1;
							break;
					}
				});

				const speed =
					(position.x && position.z ? SQRT_SPEED : SPEED) *
					upgrades.movementSpeed.amount(player.upgrades.movementSpeed) *
					delta;

				unit.mesh.position.addInPlace(position.scale(speed));
				camera.position.x = unit.mesh.position.x;
				camera.position.z = unit.mesh.position.z;
			}
		},
	});

	const unit = createUnit({
		scene,
		mesh: CreatePolygon(
			"player",
			{
				shape: SHAPE,
			},
			undefined,
			earcut,
		),
		state: player,
		getBody: (mesh) => createBody({ scene, mesh, type: PhysicsMotionType.ANIMATED }),
	});

	const timer = createTimer({
		scene,
		timeout: SHOT_SPEED,
		callback: () =>
			createProjectile({
				scene,
				position: unit.mesh.position.add(unit.mesh.getDirection(PROJECTILE_POSITION)),
				target: unit.mesh.position,
				amount: upgrades.projectiles.amount(player.upgrades.projectiles),
			}),
	});

	const regenTimer = createTimer({
		scene,
		timeout: 1000,
		callback: () => {
			player.hp = Math.min(player.hp + upgrades.regen.amount(player.upgrades.regen), player.maxHp);
		},
	});

	const camera = new UniversalCamera("camera", new Vector3(0, 50, 0));
	const auraMesh = CreateCylinder("aura", { height: 1, diameter: AURA_RADIUS * 2 });
	const auraBody = createBody({ mesh: auraMesh, type: PhysicsMotionType.ANIMATED, scene });

	const input = new Set<KEYS>();

	camera.target = new Vector3();
	camera.rotation.y = 0;

	unit.mesh.metadata.type = playerType;
	unit.body.shape = new PhysicsShapeConvexHull(unit.mesh.sourceMesh, scene);
	unit.body.shape.filterMembershipMask = PLAYER_MASK;

	auraMesh.isVisible = false;
	auraBody.disablePreStep = false;

	const disposeTimeout = effect(() => {
		timer.timeout = SHOT_SPEED / upgrades.attackSpeed.amount(player.upgrades.attackSpeed);
	});

	const disposeRange = effect(() => {
		auraMesh.scaling = new Vector3(1, 1, 1).scale(upgrades.range.amount(player.upgrades.range));

		const shape = new PhysicsShapeConvexHull(auraMesh, scene);

		auraBody.shape = shape;
		auraBody.shape.filterMembershipMask = PLAYER_AURA_MASK;
		auraBody.shape.filterCollideMask = ITEM_MASK;
		auraBody.shape.isTrigger = true;

		return () => shape.dispose();
	});

	unit.mesh.addChild(auraMesh);
	addEvents({ scene, unit, auraBody, input });

	unit.mesh.onDisposeObservable.add(() => {
		renderable.dispose();
		timer.dispose();
		regenTimer.dispose();
		disposeTimeout();
		disposeRange();
		game.wasted = true;
	});

	return {
		get position() {
			return unit.mesh.position;
		},
	};
};
