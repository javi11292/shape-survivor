import { Color3, CreateDisc, Render, StandardMaterial, Vector3 } from "$lib/engine";
import { prepareMesh } from "$lib/utils";
import type { Scene } from "@babylonjs/core";

type Props = {
	position: Vector3;
};

const getMesh = prepareMesh(() => {
	const mesh = CreateDisc("experience mesh", { radius: 0.25 });
	const material = new StandardMaterial("experience material");

	material.diffuseColor = new Color3(0.4, 0.4, 1);
	mesh.material = material;
	mesh.renderingGroupId = 1;

	return mesh;
});

export class Experience extends Render {
	private mesh;

	constructor(scene: Scene, { position }: Props) {
		super(scene);

		this.mesh = getMesh().createInstance("experience");
		this.mesh.position = position;
		this.mesh.rotation.x = Math.PI / 2;
	}
}
