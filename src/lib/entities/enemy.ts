import { ENEMY_MASK } from "$lib/constants";
import { Vector3, type Scene } from "$lib/engine";
import { Unit } from "./unit";

const DISTANCE = 0.1;
const SPEED = 5;
const SQRT = Math.sqrt(Math.pow(DISTANCE, 2) / 2);

const holes: [Vector3[]] = [
	[
		new Vector3(0, 0, 1 - DISTANCE),
		new Vector3(DISTANCE - 1, 0, SQRT - 1),
		new Vector3(1 - DISTANCE, 0, SQRT - 1),
	],
];

type Props = {
	position: Vector3;
	target: Vector3;
};

export class Enemy extends Unit {
	private target: Vector3;
	constructor(scene: Scene, { position, target }: Props) {
		super(scene, {
			name: "enemy",
			holes,
		});

		this.target = target;
		this.mesh.collisionGroup = ENEMY_MASK;
		this.mesh.position = position;
		this.mesh.lookAt(this.target);
	}

	protected render(delta: number) {
		this.mesh.lookAt(this.target);
		this.mesh.moveWithCollisions(this.mesh.calcMovePOV(0, 0, delta * SPEED));
	}
}
