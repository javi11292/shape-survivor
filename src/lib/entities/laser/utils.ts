import { memo } from "$lib/core/utils";
import { CreateCapsule, GlowLayer, PhysicsShapeConvexHull, Vector3 } from "$lib/engine";
import { createMeshSource } from "$lib/engine/mesh";
import type { Mesh, Scene } from "@babylonjs/core";

export const HEIGHT = 30;
export const LIFE_TIME = 500;
export const KEYFRAMES = [
	{
		frame: 0,
		value: 0.1,
	},
	{
		frame: LIFE_TIME * 0.6,
		value: 0.1,
	},
	{
		frame: LIFE_TIME * 0.8,
		value: 0.3,
	},
	{
		frame: LIFE_TIME * 0.9,
		value: 1,
	},
	{
		frame: LIFE_TIME,
		value: 1,
	},
];

export const getMesh = createMeshSource(() =>
	CreateCapsule("laser source", {
		orientation: Vector3.Right(),
		height: HEIGHT,
		radius: 0.25,
	}),
);

export const getBodyMesh = createMeshSource(() =>
	CreateCapsule("laser body", {
		orientation: Vector3.Right(),
		height: HEIGHT,
		radius: 1,
	}),
);

export const getShape = memo((mesh: Mesh, scene: Scene) => new PhysicsShapeConvexHull(mesh, scene));

export const addGlow = memo((scene: Scene) => {
	const gl = new GlowLayer("laser", scene);
	gl.intensity = 0.5;
	gl.addIncludedOnlyMesh(getMesh());
});
