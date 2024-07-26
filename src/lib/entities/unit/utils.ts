import { ExtrudePolygon, Matrix, Vector3 } from "$lib/engine";
import { createMeshSource } from "$lib/engine/mesh";
import type { Scene } from "@babylonjs/core";
import earcut from "earcut";

export const SHAPE = [new Vector3(0, 0, 1), new Vector3(-1, 0, -1), new Vector3(1, 0, -1)];

export const getMesh = createMeshSource(() =>
	ExtrudePolygon("unit body source", { shape: SHAPE, depth: 1 }, undefined, earcut),
);

export const getVectorProjection = ({ scene, point }: { scene: Scene; point: Vector3 }) => {
	if (!scene.activeCamera) {
		return;
	}

	return Vector3.Project(
		point,
		Matrix.Identity(),
		scene.getTransformMatrix(),
		scene.activeCamera.viewport.toGlobal(window.innerWidth, window.innerHeight),
	);
};
