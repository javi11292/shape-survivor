import { MAP_SIZE } from "$lib/constants";
import { ExtrudePolygon, PhysicsShapeConvexHull, Vector3 } from "$lib/engine";
import type { Mesh, Scene } from "@babylonjs/core";
import earcut from "earcut";

export const WALL_WIDTH = 2;

const SHAPE = [
	new Vector3(0, 0, 0),
	new Vector3(0, 0, MAP_SIZE + WALL_WIDTH * 2),
	new Vector3(WALL_WIDTH, 0, MAP_SIZE + WALL_WIDTH * 2),
	new Vector3(WALL_WIDTH, 0, 0),
];

export const getWallMesh = () => {
	const mesh = ExtrudePolygon(
		"wall source",
		{
			shape: SHAPE,
			depth: 1,
		},
		undefined,
		earcut,
	);

	mesh.isVisible = false;

	return mesh;
};

export const getShape = (mesh: Mesh, scene: Scene) => new PhysicsShapeConvexHull(mesh, scene);
