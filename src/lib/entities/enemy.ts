import { type Scene } from "$lib/engine";
import { Unit } from "./unit";

export class Enemy extends Unit {
	constructor(scene: Scene) {
		super(scene, { name: "enemy" });
	}
}
