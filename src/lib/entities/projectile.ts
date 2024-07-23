import { ENEMY_MASK, PROJECTILE_MASK } from "$lib/constants";
import { CreatePolygon, Render, Vector3 } from "$lib/engine";
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
	pivot: Vector3;
};

const getMesh = prepareMesh(() =>
	CreatePolygon("projectile mesh", { shape: SHAPE }, undefined, earcut),
);

export class Projectile extends Render {
	protected mesh;
	private damage = 1;

	constructor(scene: Scene, { position, rotation, pivot }: Props) {
		super(scene);

		const mesh = getMesh();
		this.mesh = mesh.createInstance("projectile");
		this.mesh.definedFacingForward = false;
		this.mesh.setPivotPoint(pivot);
		this.mesh.position = position;
		this.mesh.rotation = rotation;
		this.mesh.collisionMask = ENEMY_MASK;
		this.mesh.collisionGroup = PROJECTILE_MASK;

		this.mesh.onCollideObservable.add((mesh) => {
			this.dispose();
			mesh.metadata.hit(this.damage, this.mesh);
		});

		setTimeout(() => {
			this.dispose();
		}, LIFE_TIME);
	}

	protected render(delta: number) {
		this.mesh.moveWithCollisions(this.mesh.calcMovePOV(0, 0, delta * SPEED));
	}

	setup() {
		this.mesh.checkCollisions = true;
	}

	dispose() {
		super.dispose();
		this.mesh.dispose();
	}
}
