import { CreatePolygon, Mesh, Render, Vector3, type Scene } from "$lib/engine";
import earcut from "earcut";

const shape = [new Vector3(0, 0, 1), new Vector3(-1, 0, -1), new Vector3(1, 0, -1)];

type Props = {
	name: string;
	holes?: [Vector3[]];
};

export abstract class Unit extends Render {
	protected mesh: Mesh;

	constructor(scene: Scene, { name, holes }: Props) {
		super(scene);

		this.mesh = CreatePolygon(
			name,
			{
				shape,
				holes,
			},
			scene,
			earcut,
		);
		this.mesh.definedFacingForward = false;
		this.mesh.metadata = this;
	}

	protected setup() {
		this.mesh.checkCollisions = true;
	}

	dispose() {
		super.dispose();
		this.mesh.dispose();
	}
}
