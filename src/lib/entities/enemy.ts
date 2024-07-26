import { ENEMY_MASK, PLAYER_MASK, PROJECTILE_MASK } from "$lib/constants";
import { memo } from "$lib/core/utils";
import { CreatePolygon, PhysicsMotionType, PhysicsShapeConvexHull, Vector3 } from "$lib/engine";
import { createBody } from "$lib/engine/body";
import { createMeshSource } from "$lib/engine/mesh";
import { createRenderable } from "$lib/engine/renderable";
import type { Mesh, Scene } from "@babylonjs/core";
import earcut from "earcut";
import { SHAPE, createUnit } from "./unit";

const DISTANCE = 0.1;
const SPEED = 5;
const SQRT = Math.sqrt(Math.pow(DISTANCE, 2) / 2);

const HOLES: [Vector3[]] = [
	[
		new Vector3(0, 0, 1 - DISTANCE),
		new Vector3(DISTANCE - 1, 0, SQRT - 1),
		new Vector3(1 - DISTANCE, 0, SQRT - 1),
	],
];

const getMesh = createMeshSource(() =>
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

const getShape = memo((mesh: Mesh, scene: Scene) => new PhysicsShapeConvexHull(mesh, scene));

type Params = {
	scene: Scene;
	position: Vector3;
	target: Vector3;
};

export const createEnemy = ({ scene, position, target }: Params) => {
	const entity = createRenderable({
		scene,
		render: () => {
			unit.mesh.lookAt(target);
			unit.body.setLinearVelocity(unit.mesh.getDirection(new Vector3(0, 0, SPEED)));
		},
	});

	const unit = createUnit({
		scene,
		mesh: getMesh().createInstance("enemy"),
		getBody: (mesh) => createBody({ scene, mesh, type: PhysicsMotionType.DYNAMIC }),
	});

	unit.mesh.position = position;
	unit.mesh.lookAt(target);
	unit.body.shape = getShape(unit.mesh.sourceMesh, scene);
	unit.body.shape.filterMembershipMask = ENEMY_MASK;
	unit.body.shape.filterCollideMask = PROJECTILE_MASK | PLAYER_MASK | ENEMY_MASK;

	const unitDispose = unit.dispose;

	unit.dispose = () => {
		unitDispose();
		entity.dispose();
	};

	return {
		hit: unit.hit,
		dispose: unit.dispose,
	};
};
