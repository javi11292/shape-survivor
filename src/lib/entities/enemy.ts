import { ENEMY_MASK, PLAYER_MASK, PROJECTILE_MASK } from "$lib/constants";
import { memo } from "$lib/core/utils";
import {
	CreatePolygon,
	PhysicsBody,
	PhysicsMotionType,
	PhysicsShapeConvexHull,
	Vector3,
} from "$lib/engine";
import { prepareMesh } from "$lib/utils";
import { type Mesh, type Scene } from "@babylonjs/core";
import earcut from "earcut";
import { SHAPE, Unit } from "./unit";

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

const getMesh = prepareMesh(() =>
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

type Props = {
	position: Vector3;
	target: Vector3;
};

export class Enemy extends Unit {
	private target;

	constructor(scene: Scene, { position, target }: Props) {
		super(scene, {
			mesh: getMesh().createInstance("enemy"),
			body: (mesh) => new PhysicsBody(mesh, PhysicsMotionType.DYNAMIC, false, scene),
		});

		this.target = target;
		this.mesh.position = position;
		this.mesh.lookAt(this.target);

		this.body.shape = getShape(this.mesh.sourceMesh, scene);
		this.body.shape.filterMembershipMask = ENEMY_MASK;
		this.body.shape.filterCollideMask = PROJECTILE_MASK | PLAYER_MASK | ENEMY_MASK;
	}

	protected render() {
		this.mesh.lookAt(this.target);
		this.body.setLinearVelocity(this.mesh.getDirection(new Vector3(0, 0, SPEED)));
	}
}
