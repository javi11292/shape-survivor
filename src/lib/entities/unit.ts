import { Damage } from "$lib/components/damage";
import { State } from "$lib/core/utils";
import { ExtrudePolygon, Matrix, PhysicsBody, Render, Vector3 } from "$lib/engine";
import { prepareMesh } from "$lib/utils";
import { type AbstractMesh, type Scene } from "@babylonjs/core";
import earcut from "earcut";
import { mount, unmount } from "svelte";
import { Experience } from "./experience";

export const SHAPE = [new Vector3(0, 0, 1), new Vector3(-1, 0, -1), new Vector3(1, 0, -1)];

const getMesh = prepareMesh(() =>
	ExtrudePolygon("unit body source", { shape: SHAPE, depth: 1 }, undefined, earcut),
);

export class Unit extends Render {
	protected mesh;
	protected body;
	private state?: State<{ x: number; y: number }>;

	constructor(
		scene: Scene,
		{ mesh, body }: { mesh: AbstractMesh; body: (mesh: AbstractMesh) => PhysicsBody },
	) {
		super(scene);

		this.mesh = getMesh().createInstance("unit body");
		this.mesh.addChild(mesh);
		this.mesh.metadata = this;
		this.mesh.isVisible = false;

		this.body = body(this.mesh);
		this.body.disablePreStep = false;
		this.body.setMassProperties({ inertia: Vector3.Zero() });

		this.scene.onAfterPhysicsObservable.add(() => {
			this.mesh.position.y = 0;
		});
	}

	dispose() {
		super.dispose();
		this.mesh.dispose();
	}

	hit(damage: number, point: Vector3) {
		this.dispose();

		new Experience(this.scene, { position: this.mesh.position });
		let vectorProjection = this.getVectorProjection(point);

		if (!vectorProjection) {
			return;
		}

		this.state = new State({ x: vectorProjection.x, y: vectorProjection.y });

		const component = mount(Damage, {
			target: document.body,
			props: { position: this.state.value, damage },
		});

		const observer = this.scene.onBeforeRenderObservable.add(() => {
			vectorProjection = this.getVectorProjection(point);

			if (!vectorProjection || !this.state) {
				return;
			}

			this.state.value.x = vectorProjection.x;
			this.state.value.y = vectorProjection.y;
		});

		setTimeout(() => {
			this.scene.onBeforeRenderObservable.remove(observer);
			unmount(component);
		}, 750);
	}

	private getVectorProjection(point: Vector3) {
		if (!this.scene.activeCamera) {
			return;
		}

		return Vector3.Project(
			point,
			Matrix.Identity(),
			this.scene.getTransformMatrix(),
			this.scene.activeCamera.viewport.toGlobal(window.innerWidth, window.innerHeight),
		);
	}
}
