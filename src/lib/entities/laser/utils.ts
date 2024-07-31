import { memo } from "$lib/core/utils";
import { Animation, CreateCapsule, PhysicsShapeConvexHull, Vector3 } from "$lib/engine";
import { createMeshSource } from "$lib/engine/mesh";
import type { Mesh, Scene } from "@babylonjs/core";

export const HEIGHT = 30;
export const LIFE_TIME = 0.5;

export const getMesh = createMeshSource(() =>
	CreateCapsule("laser source", { orientation: Vector3.Right(), height: HEIGHT, radius: 1 }),
);

export const getShape = memo((mesh: Mesh, scene: Scene) => new PhysicsShapeConvexHull(mesh, scene));

export const getAnimation = memo(() => {
	const animation = new Animation("laser", "scaling.z", 1, Animation.ANIMATIONTYPE_FLOAT);

	const keyframes = [];

	keyframes.push({
		frame: 0,
		value: 0.1,
	});

	keyframes.push({
		frame: LIFE_TIME * 0.6,
		value: 0.1,
	});

	keyframes.push({
		frame: LIFE_TIME * 0.8,
		value: 0.3,
	});

	keyframes.push({
		frame: LIFE_TIME,
		value: 1,
	});

	animation.setKeys(keyframes);

	return animation;
});
