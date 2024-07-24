import { ENEMY_MASK, PROJECTILE_MASK } from "$lib/constants";
import { memo } from "$lib/core/utils";
import {
	CreatePolygon,
	ExtrudePolygon,
	Mesh,
	PhysicsBody,
	PhysicsMotionType,
	PhysicsShapeConvexHull,
	Render,
	Vector3,
} from "$lib/engine";
import { prepareMesh } from "$lib/utils";
import { type Scene } from "@babylonjs/core";
import earcut from "earcut";

const SPEED = 50;
const LIFE_TIME = 750;

const SHAPE = [
	new Vector3(0.05, 0, 0),
	new Vector3(0.05, 0, 0.5),
	new Vector3(-0.05, 0, 0.5),
	new Vector3(-0.05, 0, 0),
];

type Props = {
	position: Vector3;
	rotation: Vector3;
};

const getMesh = prepareMesh(() =>
	CreatePolygon("projectile source", { shape: SHAPE }, undefined, earcut),
);

const getBodyMesh = prepareMesh(() =>
	ExtrudePolygon("projectile body source", { shape: SHAPE, depth: 1 }, undefined, earcut),
);

const getShape = memo((mesh: Mesh, scene: Scene) => new PhysicsShapeConvexHull(mesh, scene));

export class Projectile extends Render {
	private mesh;
	private body;
	private damage = 1;

	constructor(scene: Scene, { position, rotation }: Props) {
		super(scene);

		this.mesh = getBodyMesh().createInstance("projectile body");
		this.mesh.addChild(getMesh().createInstance("projectile"));
		this.mesh.rotation = rotation;
		this.mesh.position = position;
		this.mesh.isVisible = false;

		this.body = new PhysicsBody(this.mesh, PhysicsMotionType.ANIMATED, false, scene);
		this.body.disablePreStep = false;
		this.body.setMassProperties({ inertia: Vector3.Zero() });
		this.body.setCollisionCallbackEnabled(true);
		this.body.setLinearVelocity(this.mesh.getDirection(new Vector3(0, 0, SPEED)));
		this.body.shape = getShape(this.mesh.sourceMesh, scene);
		this.body.shape.filterMembershipMask = PROJECTILE_MASK;
		this.body.shape.filterCollideMask = ENEMY_MASK;

		const observable = this.body.getCollisionObservable();

		observable.add(({ collidedAgainst, point }) => {
			this.dispose();
			collidedAgainst.transformNode.metadata.hit(this.damage, point);
		});

		setTimeout(() => {
			this.dispose();
		}, LIFE_TIME);
	}

	dispose() {
		super.dispose();
		this.mesh.dispose();
	}
}
