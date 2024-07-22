import { CreatePolygon, Mesh, Render, Vector3, type Scene } from "$lib/engine";
import earcut from "earcut";

const shape = [new Vector3(0, 0, 1), new Vector3(-1, 0, -1), new Vector3(1, 0, -1)];

export abstract class Unit extends Render {
	protected mesh: Mesh;

	constructor(scene: Scene, { name }: { name: string }) {
		super(scene);

		this.mesh = CreatePolygon(name, { shape, sideOrientation: Mesh.DOUBLESIDE }, scene, earcut);
		this.mesh.definedFacingForward = false;
	}
}
