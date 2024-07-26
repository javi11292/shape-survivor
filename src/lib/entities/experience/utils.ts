import { memo } from "$lib/core/utils";
import {
	Color3,
	CreateCylinder,
	CreateDisc,
	PhysicsShapeConvexHull,
	StandardMaterial,
} from "$lib/engine";
import { createMeshSource } from "$lib/engine/mesh";
import type { Mesh, Scene } from "@babylonjs/core";

export const getMesh = createMeshSource(() => {
	const mesh = CreateDisc("experience source", { radius: 0.25 });
	const material = new StandardMaterial("experience material");

	material.diffuseColor = new Color3(0.4, 0.4, 1);
	mesh.material = material;
	mesh.renderingGroupId = 1;

	return mesh;
});

export const getBodyMesh = createMeshSource(() =>
	CreateCylinder("experience body source", { height: 1, diameter: 0.5 }),
);

export const getShape = memo((mesh: Mesh, scene: Scene) => new PhysicsShapeConvexHull(mesh, scene));
