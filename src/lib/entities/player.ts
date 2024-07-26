import { ITEM_MASK, PLAYER_AURA_MASK, PLAYER_MASK } from "$lib/constants";
import {
	CreateCylinder,
	CreatePolygon,
	KeyboardEventTypes,
	PhysicsBody,
	PhysicsEventType,
	PhysicsMotionType,
	PhysicsShapeConvexHull,
	UniversalCamera,
	Vector3,
} from "$lib/engine";
import { createBody } from "$lib/engine/body";
import { createRenderable } from "$lib/engine/renderable";
import type { HavokPlugin, Scene } from "@babylonjs/core";
import earcut from "earcut";
import { createProjectile } from "./projectile";
import { SHAPE, createUnit } from "./unit";

enum KEYS {
	"up" = "W",
	"down" = "S",
	"left" = "A",
	"right" = "D",
}

const keys = new Set<string>(Object.values(KEYS));

const SPEED = 0.01;
const SQRT_SPEED = Math.sqrt(Math.pow(SPEED, 2) / 2);
const PROJECTILE_POSITION = new Vector3(0, 0, 1);
const SHOT_SPEED = 1000;
const AURA_RADIUS = 5;

const getAngle = (pointA: Vector3, pointB: Vector3) =>
	Math.atan2(pointB.x - pointA.x, pointB.z - pointA.z);

type Params = {
	scene: Scene;
};

export const createPlayer = ({ scene }: Params) => {
	createRenderable({
		scene,
		render: (delta) => {
			lastProjectile += delta;

			if (lastProjectile >= SHOT_SPEED) {
				createProjectile({
					scene,
					position: unit.mesh.position.add(unit.mesh.getDirection(PROJECTILE_POSITION)),
					rotation: unit.mesh.rotation.clone(),
				});

				lastProjectile -= SHOT_SPEED;
			}

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

				const speed = (position.x && position.z ? SQRT_SPEED : SPEED) * delta;

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
		getBody: (mesh) => createBody({ scene, mesh, type: PhysicsMotionType.ANIMATED }),
	});

	const camera = new UniversalCamera("camera", new Vector3(0, 50, 0));
	const auraMesh = CreateCylinder("aura", { height: 1, diameter: AURA_RADIUS * 2 });
	const auraBody = new PhysicsBody(auraMesh, PhysicsMotionType.ANIMATED, false, scene);

	const addEvents = () => {
		const plugin = scene.getPhysicsEngine()?.getPhysicsPlugin() as HavokPlugin;

		plugin.onTriggerCollisionObservable.add(({ type, collider, collidedAgainst }) => {
			const trigger = collider === auraBody ? collidedAgainst : collider;

			if (
				type !== PhysicsEventType.TRIGGER_ENTERED ||
				(collider !== auraBody && collidedAgainst !== auraBody)
			) {
				return;
			}

			trigger.transformNode.metadata.absorb(unit.mesh.position);
		});

		scene.onPointerObservable.add(({ pickInfo }) => {
			const origin = pickInfo?.ray?.origin;

			if (!origin) {
				return;
			}

			unit.mesh.rotation = unit.mesh.rotation.clone();
			unit.mesh.rotation.y = getAngle(unit.mesh.position, origin);
		});

		scene.onKeyboardObservable.add(({ type, event }) => {
			switch (type) {
				case KeyboardEventTypes.KEYDOWN: {
					const key = event.key.toUpperCase();

					if (keys.has(key)) {
						input.add(key as KEYS);
					}

					break;
				}

				case KeyboardEventTypes.KEYUP: {
					const key = event.key.toUpperCase();

					if (keys.has(key)) {
						input.delete(key as KEYS);
					}

					break;
				}
			}
		});
	};

	let lastProjectile = 0;
	let input = new Set<KEYS>();

	camera.target = new Vector3();
	camera.rotation.y = 0;

	unit.body.shape = new PhysicsShapeConvexHull(unit.mesh.sourceMesh, scene);
	unit.body.shape.filterMembershipMask = PLAYER_MASK;

	auraMesh.isVisible = false;
	auraBody.disablePreStep = false;
	auraBody.shape = new PhysicsShapeConvexHull(auraMesh, scene);
	auraBody.shape.filterMembershipMask = PLAYER_AURA_MASK;
	auraBody.shape.filterCollideMask = ITEM_MASK;
	auraBody.shape.isTrigger = true;

	unit.mesh.addChild(auraMesh);
	addEvents();

	return {
		get position() {
			return unit.mesh.position;
		},
	};
};
