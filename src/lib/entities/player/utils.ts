import { HavokPlugin, KeyboardEventTypes, PhysicsEventType, Scene, Vector3 } from "$lib/engine";
import type { createBody } from "$lib/engine/body";
import { isExperience } from "../experience";
import type { createUnit } from "../unit";

export enum KEYS {
	"up" = "W",
	"down" = "S",
	"left" = "A",
	"right" = "D",
}

const keys = new Set<string>(Object.values(KEYS));

const getAngle = (pointA: Vector3, pointB: Vector3) =>
	Math.atan2(pointB.x - pointA.x, pointB.z - pointA.z);

export const addEvents = ({
	scene,
	auraBody,
	unit,
	input,
}: {
	scene: Scene;
	auraBody: ReturnType<typeof createBody>;
	unit: ReturnType<typeof createUnit>;
	input: Set<KEYS>;
}) => {
	const plugin = scene.getPhysicsEngine()?.getPhysicsPlugin() as HavokPlugin;

	plugin.onTriggerCollisionObservable.add(({ type, collider, collidedAgainst }) => {
		const trigger = collider === auraBody ? collidedAgainst : collider;

		if (
			type !== PhysicsEventType.TRIGGER_ENTERED ||
			(collider !== auraBody && collidedAgainst !== auraBody)
		) {
			return;
		}

		const entity = trigger.transformNode.metadata;

		if (!isExperience(entity)) {
			return;
		}

		entity.absorb(unit.mesh.position);
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
