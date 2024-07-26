import { ENEMY_MASK, PROJECTILE_MASK } from "$lib/constants";
import { memo } from "$lib/core/utils";
import {
	CreatePolygon,
	ExtrudePolygon,
	PhysicsMotionType,
	PhysicsShapeConvexHull,
	Vector3,
} from "$lib/engine";
import { createBody } from "$lib/engine/body";
import { createMeshSource } from "$lib/engine/mesh";
import type { Mesh, Scene } from "@babylonjs/core";
import earcut from "earcut";
import type { createEnemy } from "./enemy";

const SPEED = 50;
const LIFE_TIME = 750;
const DAMAGE = 1;

const SHAPE = [
	new Vector3(0.05, 0, 0),
	new Vector3(0.05, 0, 0.5),
	new Vector3(-0.05, 0, 0.5),
	new Vector3(-0.05, 0, 0),
];

const getMesh = createMeshSource(() =>
	CreatePolygon("projectile source", { shape: SHAPE }, undefined, earcut),
);

const getBodyMesh = createMeshSource(() =>
	ExtrudePolygon("projectile body source", { shape: SHAPE, depth: 1 }, undefined, earcut),
);

const getShape = memo((mesh: Mesh, scene: Scene) => new PhysicsShapeConvexHull(mesh, scene));

type Params = {
	scene: Scene;
	position: Vector3;
	rotation: Vector3;
};

export const createProjectile = ({ scene, position, rotation }: Params) => {
	const mesh = getBodyMesh().createInstance("projectile body");
	mesh.addChild(getMesh().createInstance("projectile"));
	mesh.rotation = rotation;
	mesh.position = position;

	const body = createBody({
		scene,
		mesh,
		type: PhysicsMotionType.ANIMATED,
		onCollision: ({ collidedAgainst, point }) => {
			const enemy: ReturnType<typeof createEnemy> = collidedAgainst.transformNode.metadata;

			dispose();
			enemy.hit(DAMAGE, point as Vector3);
		},
	});

	const dispose = () => {
		mesh.dispose();
	};

	body.setLinearVelocity(mesh.getDirection(new Vector3(0, 0, SPEED)));
	body.shape = getShape(mesh.sourceMesh, scene);
	body.shape.filterMembershipMask = PROJECTILE_MASK;
	body.shape.filterCollideMask = ENEMY_MASK;

	setTimeout(dispose, LIFE_TIME);
};
