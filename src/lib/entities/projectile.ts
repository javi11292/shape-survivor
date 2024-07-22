import { ENEMY_MASK } from "$lib/constants";
import { CreateLines, Mesh, Render, Vector3, type Scene } from "$lib/engine";

const SPEED = 50;
const LIFE_TIME = 750;

const points = [new Vector3(), new Vector3(0, 0, 0.5)];

type Props = {
	position: Vector3;
	rotation: Vector3;
	pivot: Vector3;
};

export class Projectile extends Render {
	protected mesh: Mesh;

	constructor(scene: Scene, { position, rotation, pivot }: Props) {
		super(scene);

		this.mesh = CreateLines("projectile", { points });
		this.mesh.definedFacingForward = false;
		this.mesh.setPivotPoint(pivot);
		this.mesh.position = position;
		this.mesh.rotation = rotation;
		this.mesh.checkCollisions = true;
		this.mesh.collisionMask = ENEMY_MASK;

		this.mesh.onCollideObservable.add((mesh) => {
			this.dispose();
			mesh.metadata.dispose();
		});

		setTimeout(() => {
			this.dispose();
		}, LIFE_TIME);
	}

	render(delta: number) {
		this.mesh.moveWithCollisions(this.mesh.calcMovePOV(0, 0, delta * SPEED));
	}

	dispose() {
		super.dispose();
		this.mesh.dispose();
	}
}
