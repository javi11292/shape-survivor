import { Mesh, Render, type Scene } from "$lib/engine";

export abstract class Unit extends Render {
	protected mesh: Mesh;

	constructor(scene: Scene, mesh: Mesh) {
		super(scene);

		this.mesh = mesh;
		this.mesh.definedFacingForward = false;
	}
}
