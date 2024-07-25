import { ITEM_MASK, PLAYER_AURA_MASK, PLAYER_MASK } from "$lib/constants";
import { memo } from "$lib/core/utils";
import {
	Color3,
	CreateCylinder,
	CreateDisc,
	PhysicsBody,
	PhysicsMotionType,
	PhysicsShapeConvexHull,
	Render,
	StandardMaterial,
	Vector3,
} from "$lib/engine";
import { prepareMesh } from "$lib/utils";
import type { Mesh, Scene } from "@babylonjs/core";

type Props = {
	position: Vector3;
};

const SPEED = 20;

const getMesh = prepareMesh(() => {
	const mesh = CreateDisc("experience source", { radius: 0.25 });
	const material = new StandardMaterial("experience material");

	material.diffuseColor = new Color3(0.4, 0.4, 1);
	mesh.material = material;
	mesh.renderingGroupId = 1;

	return mesh;
});

const getBodyMesh = prepareMesh(() =>
	CreateCylinder("experience body source", { height: 1, diameter: 0.5 }),
);

const getShape = memo((mesh: Mesh, scene: Scene) => new PhysicsShapeConvexHull(mesh, scene));

export class Experience extends Render {
	private mesh;
	private body;
	private target?: Vector3;

	constructor(scene: Scene, { position }: Props) {
		super(scene);

		const mesh = getMesh().createInstance("experience");
		mesh.rotation.x = Math.PI / 2;

		this.mesh = getBodyMesh().createInstance("experience body");
		this.mesh.addChild(mesh);
		this.mesh.position = position;
		this.mesh.isVisible = false;
		this.mesh.metadata = this;

		this.body = new PhysicsBody(this.mesh, PhysicsMotionType.ANIMATED, false, scene);
		this.body.disablePreStep = false;
		this.body.shape = getShape(this.mesh.sourceMesh, scene);
		this.body.shape.filterMembershipMask = ITEM_MASK;
		this.body.shape.filterCollideMask = PLAYER_AURA_MASK | PLAYER_MASK;
	}

	protected render() {
		if (!this.target) {
			return;
		}

		if (Vector3.DistanceSquared(this.mesh.position, this.target) <= 1) {
			this.dispose();
			return;
		}

		this.mesh.lookAt(this.target);
		this.body.setLinearVelocity(this.mesh.getDirection(new Vector3(0, 0, SPEED)));
	}

	dispose() {
		super.dispose();
		this.mesh.dispose();
	}

	absorb(target: Vector3) {
		this.target = target;
	}
}
