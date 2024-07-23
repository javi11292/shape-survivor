import { Damage } from "$lib/components/damage";
import { State } from "$lib/core/utils";
import { Render, Vector3 } from "$lib/engine";
import type { InstancedMesh, Mesh, Scene } from "@babylonjs/core";
import { mount, unmount } from "svelte";
import { Experience } from "./experience";

const DAMAGE_VECTOR = new Vector3();

export abstract class Unit extends Render {
	protected mesh;
	private state?: State<{ x: number; y: number }>;

	constructor(scene: Scene, mesh: InstancedMesh | Mesh) {
		super(scene);

		this.mesh = mesh;
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

	hit(damage: number, projectile: Mesh) {
		this.dispose();

		new Experience(this.scene, { position: this.mesh.position });
		let vectorProjection = this.getVectorProjection(projectile);

		if (!vectorProjection) {
			return;
		}

		this.state = new State({ x: vectorProjection.x, y: vectorProjection.y });

		const component = mount(Damage, {
			target: document.body,
			props: { position: this.state.value, damage },
		});

		const updatePosition = () => {
			vectorProjection = this.getVectorProjection(projectile);

			if (!vectorProjection || !this.state) {
				return;
			}

			this.state.value.x = vectorProjection.x;
			this.state.value.y = vectorProjection.y;
		};

		this.scene.registerBeforeRender(updatePosition);

		setTimeout(() => {
			this.scene.unregisterBeforeRender(updatePosition);
			unmount(component);
		}, 750);
	}

	private getVectorProjection(projectile: Mesh) {
		if (!this.scene.activeCamera) {
			return;
		}

		return Vector3.Project(
			DAMAGE_VECTOR,
			projectile.getWorldMatrix(),
			this.scene.getTransformMatrix(),
			this.scene.activeCamera.viewport.toGlobal(window.innerWidth, window.innerHeight),
		);
	}
}
