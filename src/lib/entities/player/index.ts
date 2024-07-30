import { ITEM_MASK, PLAYER_AURA_MASK, PLAYER_MASK, WALL_MASK } from "$lib/constants";
import { upgrades } from "$lib/constants/upgrades";
import { effect } from "$lib/core/utils";
import {
	CreateCylinder,
	PhysicsMotionType,
	PhysicsShapeConvexHull,
	UniversalCamera,
	Vector3,
} from "$lib/engine";
import { createBody } from "$lib/engine/body";
import { createRender } from "$lib/engine/render";
import { createTimer } from "$lib/engine/timer";
import { game } from "$lib/state/game";
import { player } from "$lib/state/player";
import { isEntity } from "$lib/utils";
import type { Scene } from "@babylonjs/core";
import { createProjectile } from "../projectile";
import { createUnit } from "../unit";
import { KEYS, addEvents, getMesh, getShape } from "./utils";

const SPEED = 10;
const SQRT_SPEED = Math.sqrt(Math.pow(SPEED, 2) / 2);
const PROJECTILE_POSITION = new Vector3(0, 0, 1);
const SHOT_SPEED = 1000;
const AURA_RADIUS = 2.5;
const CAMERA_POSITION = 30;

type Params = {
	scene: Scene;
};

const playerType = Symbol("player");

export const isPlayer = isEntity<ReturnType<typeof createUnit>>(playerType);

export const createPlayer = ({ scene }: Params) => {
	const unit = createUnit(
		{
			scene,
			state: player,
			getShape,
		},
		{
			name: "player",
			type: PhysicsMotionType.DYNAMIC,
		},
	);

	const camera = new UniversalCamera("camera", new Vector3(0, 1, 0));
	const input = new Set<KEYS>();
	const mesh = getMesh();
	const node = unit.body.transformNode;
	const auraMesh = CreateCylinder("aura", { height: 1, diameter: AURA_RADIUS * 2 });
	const auraBody = createBody({ name: "aura", type: PhysicsMotionType.ANIMATED, scene });
	const entityBody = createBody({ name: "entity", type: PhysicsMotionType.ANIMATED, scene });

	camera.rotation.x = Math.PI / 2;
	camera.mode = UniversalCamera.ORTHOGRAPHIC_CAMERA;

	node.addChild(mesh);
	node.metadata.type = playerType;

	entityBody.transformNode.metadata = unit.body.transformNode.metadata;
	entityBody.shape = getShape(unit.mesh, scene);
	entityBody.shape.filterMembershipMask = PLAYER_MASK;
	unit.body.shape!.filterCollideMask = WALL_MASK;

	const timer = createTimer({
		scene,
		timeout: SHOT_SPEED,
		callback: () =>
			createProjectile({
				scene,
				position: node.position.add(node.getDirection(PROJECTILE_POSITION)),
				target: node.position,
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

	addEvents({ scene, node, auraBody, input });

	const render = createRender({
		scene,
		render: () => {
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
				upgrades.movementSpeed.amount(player.upgrades.movementSpeed);

			unit.body.setLinearVelocity(position.scale(speed));
			camera.position.x = node.position.x;
			camera.position.z = node.position.z;

			const nodePosition = node.position.clone();
			const nodeRotation = node.rotationQuaternion!.clone();

			auraBody.transformNode.position = nodePosition;
			entityBody.transformNode.position = nodePosition;
			auraBody.transformNode.rotationQuaternion = nodeRotation;
			entityBody.transformNode.rotationQuaternion = nodeRotation;
		},
	});

	const resizeCamera = () => {
		const aspectRatio = window.innerWidth / window.innerHeight;

		camera.orthoRight = CAMERA_POSITION;
		camera.orthoLeft = -CAMERA_POSITION;
		camera.orthoTop = CAMERA_POSITION / aspectRatio;
		camera.orthoBottom = -CAMERA_POSITION / aspectRatio;
	};

	resizeCamera();

	window.addEventListener("resize", resizeCamera);

	node.onDisposeObservable.add(() => {
		window.removeEventListener("resize", resizeCamera);
		render.dispose();
		timer.dispose();
		regenTimer.dispose();
		disposeTimeout();
		disposeRange();
		game.wasted = true;
		auraBody.transformNode.dispose();
		entityBody.transformNode.dispose();
	});

	return {
		get position() {
			return node.position;
		},
	};
};
