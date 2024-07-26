import { memo } from "$lib/core/utils";
import { CreatePolygon, ExtrudePolygon, PhysicsShapeConvexHull, Sound, Vector3 } from "$lib/engine";
import { createMeshSource } from "$lib/engine/mesh";
import type { Mesh, Scene } from "@babylonjs/core";
import earcut from "earcut";
import sound from "./shot.mp3";

const SHAPE = [
	new Vector3(0.05, 0, 0),
	new Vector3(0.05, 0, 0.5),
	new Vector3(-0.05, 0, 0.5),
	new Vector3(-0.05, 0, 0),
];

export const getSound = memo((scene: Scene) => new Sound("projectile sound", sound, scene));

export const getMesh = createMeshSource(() =>
	CreatePolygon("projectile source", { shape: SHAPE }, undefined, earcut),
);

export const getBodyMesh = createMeshSource(() =>
	ExtrudePolygon("projectile body source", { shape: SHAPE, depth: 1 }, undefined, earcut),
);

export const getShape = memo((mesh: Mesh, scene: Scene) => new PhysicsShapeConvexHull(mesh, scene));
