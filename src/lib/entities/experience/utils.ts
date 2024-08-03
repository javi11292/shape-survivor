import { ITEM_MASK, PLAYER_AURA_MASK, PLAYER_MASK, UPGRADE_MASK } from "$lib/constants";
import { memo } from "$lib/core/utils";
import {
	Color3,
	CreateCylinder,
	CreateDisc,
	PhysicsShapeConvexHull,
	Sound,
	StandardMaterial,
} from "$lib/engine";
import { assets } from "$lib/engine/assets";
import { createMeshSource } from "$lib/engine/mesh";
import type { Mesh, Scene } from "@babylonjs/core";

export const getSound = memo((scene: Scene) => new Sound("experience sound", assets.suck, scene));

export const getUpgradeMesh = createMeshSource(() => {
	const mesh = CreateDisc("upgrade source", { radius: 1 });
	const material = new StandardMaterial("upgrade");

	material.emissiveColor = new Color3(1, 1, 0);
	mesh.material = material;
	mesh.renderingGroupId = 1;
	mesh.rotation.x = Math.PI / 2;

	return mesh;
});

export const getExperienceMesh = createMeshSource(() => {
	const mesh = CreateDisc("experience source", { radius: 0.25 });
	const material = new StandardMaterial("experience");

	material.emissiveColor = new Color3(0.4, 0.4, 1);
	mesh.material = material;
	mesh.renderingGroupId = 1;
	mesh.rotation.x = Math.PI / 2;

	return mesh;
});

export const getBodyMesh = createMeshSource(() =>
	CreateCylinder("experience body", { diameter: 0.5, height: 1 }),
);

export const getExperienceShape = memo((mesh: Mesh, scene: Scene) => {
	const shape = new PhysicsShapeConvexHull(mesh, scene);

	shape.filterMembershipMask = ITEM_MASK;
	shape.filterCollideMask = PLAYER_AURA_MASK;
	shape.isTrigger = true;

	return shape;
});
export const getUpgradeShape = memo((mesh: Mesh, scene: Scene) => {
	const shape = new PhysicsShapeConvexHull(mesh, scene);

	shape.filterMembershipMask = UPGRADE_MASK;
	shape.filterCollideMask = PLAYER_MASK;
	shape.isTrigger = true;

	return shape;
});
