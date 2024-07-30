import { memo } from "$lib/core/utils";
import { Color3, CreateDisc, PhysicsShapeConvexHull, Sound, StandardMaterial } from "$lib/engine";
import { assets } from "$lib/engine/assets";
import { createMeshSource } from "$lib/engine/mesh";
import type { Mesh, Scene } from "@babylonjs/core";

export const getSound = memo((scene: Scene) => new Sound("experience sound", assets.suck, scene));

export const getMesh = createMeshSource(() => {
	const mesh = CreateDisc("experience source", { radius: 0.25 });
	const material = new StandardMaterial("experience material");

	material.diffuseColor = new Color3(0.4, 0.4, 1);
	mesh.material = material;
	mesh.renderingGroupId = 1;
	mesh.rotation.x = Math.PI / 2;

	return mesh;
});

export const getShape = memo((mesh: Mesh, scene: Scene) => new PhysicsShapeConvexHull(mesh, scene));
