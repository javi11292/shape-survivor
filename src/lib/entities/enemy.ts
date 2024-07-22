import { CreateLines, Vector3, type Scene } from "$lib/engine";
import { Unit } from "./unit";

const points = [
	new Vector3(0, 0, 1),
	new Vector3(-1, 0, -1),
	new Vector3(1, 0, -1),
	new Vector3(0, 0, 1),
];

export class Enemy extends Unit {
	constructor(scene: Scene) {
		super(scene, CreateLines("enemy", { points }));
	}
}
