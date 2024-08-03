import { HPBar } from "$lib/components/hp-bar";
import { memo } from "$lib/core/utils";
import {
	Color3,
	CreatePolygon,
	PhysicsShapeConvexHull,
	Scene,
	StandardMaterial,
	Vector3,
} from "$lib/engine";
import { createMeshSource } from "$lib/engine/mesh";
import { mountComponent } from "$lib/utils";
import type { Mesh } from "@babylonjs/core";
import earcut from "earcut";

const BASIC_WIDTH = 0.1;
const BOSS_WIDTH = 0.3;
const SQRT = Math.sqrt(Math.pow(BASIC_WIDTH, 2) / 2);

const BASIC_HOLES: [Vector3[]] = [
	[
		new Vector3(0, 0, 1 - BASIC_WIDTH),
		new Vector3(BASIC_WIDTH - 1, 0, SQRT - 1),
		new Vector3(1 - BASIC_WIDTH, 0, SQRT - 1),
	],
];

export const BASIC_SHAPE = [new Vector3(0, 0, 1), new Vector3(-1, 0, -1), new Vector3(1, 0, -1)];

const BOSS_HOLES: [Vector3[]] = [
	[
		new Vector3(-2 + BOSS_WIDTH, 0, 2 - BOSS_WIDTH),
		new Vector3(2 - BOSS_WIDTH, 0, 2 - BOSS_WIDTH),
		new Vector3(2 - BOSS_WIDTH, 0, -2 + BOSS_WIDTH),
		new Vector3(-2 + BOSS_WIDTH, 0, -2 + BOSS_WIDTH),
	],
];

export const BOSS_SHAPE = [
	new Vector3(-2, 0, 2),
	new Vector3(2, 0, 2),
	new Vector3(2, 0, -2),
	new Vector3(-2, 0, -2),
];

export const getBasicMesh = createMeshSource(() =>
	CreatePolygon(
		"enemy source",
		{
			shape: BASIC_SHAPE,
			holes: BASIC_HOLES,
		},
		undefined,
		earcut,
	),
);

export const getImprovedMesh = createMeshSource(() => {
	const mesh = CreatePolygon(
		"improved enemy source",
		{
			shape: BASIC_SHAPE,
			holes: BASIC_HOLES,
		},
		undefined,
		earcut,
	);

	const material = new StandardMaterial("improved");
	material.emissiveColor = new Color3(1, 0.35, 0);

	mesh.material = material;

	return mesh;
});

export const getBossMesh = createMeshSource(() =>
	CreatePolygon(
		"boss source",
		{
			shape: BOSS_SHAPE,
			holes: BOSS_HOLES,
		},
		undefined,
		earcut,
	),
);

export const getImprovedBossMesh = createMeshSource(() => {
	const mesh = CreatePolygon(
		"improved boss source",
		{
			shape: BOSS_SHAPE,
			holes: BOSS_HOLES,
		},
		undefined,
		earcut,
	);

	const material = new StandardMaterial("improved");
	material.emissiveColor = new Color3(1, 0.5, 0);

	mesh.material = material;

	return mesh;
});

export const getBasicShape = memo(
	(mesh: Mesh, scene: Scene) => new PhysicsShapeConvexHull(mesh, scene),
);

export const getBossShape = memo(
	(mesh: Mesh, scene: Scene) => new PhysicsShapeConvexHull(mesh, scene),
);

export const showHPBar = ({
	scene,
	point,
	state,
	hp,
}: {
	scene: Scene;
	point: Vector3;
	hp: number;
	state: { hp: number };
}) => {
	return mountComponent({ scene, point, Component: HPBar, props: { state, hp } });
};
