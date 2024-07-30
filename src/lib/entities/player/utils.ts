import {
	CreatePolygon,
	HavokPlugin,
	KeyboardEventTypes,
	PhysicsEventType,
	PhysicsShapeConvexHull,
	Scene,
	TransformNode,
} from "$lib/engine";
import type { createBody } from "$lib/engine/body";
import type { Mesh } from "@babylonjs/core";
import earcut from "earcut";
import { isExperience } from "../experience";
import { SHAPE } from "../unit";

export enum KEYS {
	"up" = "W",
	"down" = "S",
	"left" = "A",
	"right" = "D",
}

const keys = new Set<string>(Object.values(KEYS));

export const getShape = (mesh: Mesh, scene: Scene) => new PhysicsShapeConvexHull(mesh, scene);

export const getMesh = () =>
	CreatePolygon(
		"player",
		{
			shape: SHAPE,
		},
		undefined,
		earcut,
	);

export const addEvents = ({
	scene,
	auraBody,
	node,
	input,
}: {
	scene: Scene;
	auraBody: ReturnType<typeof createBody>;
	node: TransformNode;
	input: Set<KEYS>;
}) => {
	const plugin = scene.getPhysicsEngine()?.getPhysicsPlugin() as HavokPlugin;

	plugin.onTriggerCollisionObservable.add(({ type, collider, collidedAgainst }) => {
		if (
			type !== PhysicsEventType.TRIGGER_ENTERED ||
			(collider !== auraBody && collidedAgainst !== auraBody)
		) {
			return;
		}

		const trigger = collider === auraBody ? collidedAgainst : collider;

		const entity = trigger.transformNode.metadata;

		if (!isExperience(entity)) {
			return;
		}

		entity.absorb(node.position);
	});

	scene.onPointerObservable.add(({ pickInfo }) => {
		const origin = pickInfo?.ray?.origin;

		if (!origin) {
			return;
		}

		node.lookAt(origin);
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
