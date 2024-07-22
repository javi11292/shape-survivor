import { ENEMY_MASK } from "$lib/constants";
import { CreatePolygon, Mesh, Render, Vector3, type Scene } from "$lib/engine";
import earcut from "earcut";

const SPEED = 50;
const LIFE_TIME = 750;

const shape = [
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

export class Projectile extends Render {
	protected mesh: Mesh;

	constructor(scene: Scene, { position, rotation, pivot }: Props) {
		super(scene);

		this.mesh = CreatePolygon("projectile", { shape }, scene, earcut);
		this.mesh.definedFacingForward = false;
		this.mesh.setPivotPoint(pivot);
		this.mesh.position = position;
		this.mesh.rotation = rotation;
		this.mesh.collisionMask = ENEMY_MASK;

		this.mesh.onCollideObservable.add((mesh) => {
			this.dispose();
			mesh.metadata.dispose();
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
