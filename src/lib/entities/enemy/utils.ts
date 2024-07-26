import { memo } from "$lib/core/utils";
import { CreatePolygon, PhysicsShapeConvexHull, Scene, Vector3 } from "$lib/engine";
import { createMeshSource } from "$lib/engine/mesh";
import type { Mesh } from "@babylonjs/core";
import earcut from "earcut";
import { SHAPE } from "../unit";

const DISTANCE = 0.1;
const SQRT = Math.sqrt(Math.pow(DISTANCE, 2) / 2);

const HOLES: [Vector3[]] = [
	[
		new Vector3(0, 0, 1 - DISTANCE),
		new Vector3(DISTANCE - 1, 0, SQRT - 1),
		new Vector3(1 - DISTANCE, 0, SQRT - 1),
	],
];

export const getMesh = createMeshSource(() =>
	CreatePolygon(
		"enemy source",
		{
			shape: SHAPE,
			holes: HOLES,
		},
		undefined,
		earcut,
	),
);

export const getShape = memo((mesh: Mesh, scene: Scene) => new PhysicsShapeConvexHull(mesh, scene));
