import { ENEMY_MASK } from "$lib/constants";
import { Vector3, type Scene } from "$lib/engine";
import { Unit } from "./unit";

const DISTANCE = 0.05;
const SQRT = Math.sqrt(Math.pow(DISTANCE, 2) / 2);

const holes: [Vector3[]] = [
	[
		new Vector3(0, 0, 1 - DISTANCE),
		new Vector3(DISTANCE - 1, 0, SQRT - 1),
		new Vector3(1 - DISTANCE, 0, SQRT - 1),
	],
];

export class Enemy extends Unit {
	constructor(scene: Scene) {
		super(scene, {
			name: "enemy",
			holes,
		});

		this.mesh.collisionGroup = ENEMY_MASK;
	}
}
