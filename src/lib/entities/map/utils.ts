import { ExtrudePolygon, PhysicsShapeConvexHull, Vector3 } from "$lib/engine";
import type { Mesh, Scene } from "@babylonjs/core";
import earcut from "earcut";

const DISTANCE = 0.9;

const SHAPE = [
	new Vector3(1, 0, 1),
	new Vector3(1, 0, -1),
	new Vector3(-1, 0, -1),
	new Vector3(-1, 0, 1),
];

const HOLES: [Vector3[]] = [
	[
		new Vector3(DISTANCE, 0, DISTANCE),
		new Vector3(DISTANCE, 0, -DISTANCE),
		new Vector3(-DISTANCE, 0, -DISTANCE),
		new Vector3(-DISTANCE, 0, DISTANCE),
	],
];

const SCALING = new Vector3(5, 1, 5);

export const getMesh = () => {
	const mesh = ExtrudePolygon(
		"map",
		{
			shape: SHAPE,
			holes: HOLES,
			depth: 1,
		},
		undefined,
		earcut,
	);

	mesh.scaling = SCALING;

	return mesh;
};

export const getShape = (mesh: Mesh, scene: Scene) => new PhysicsShapeConvexHull(mesh, scene);
