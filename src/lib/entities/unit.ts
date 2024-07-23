import { Damage } from "$lib/components/damage";
import { State } from "$lib/core/utils";
import { CreatePolygon, Mesh, Render, Vector3, type Scene } from "$lib/engine";
import earcut from "earcut";
import { mount, unmount } from "svelte";

const SHAPE = [new Vector3(0, 0, 1), new Vector3(-1, 0, -1), new Vector3(1, 0, -1)];
const DAMAGE_VECTOR = new Vector3(0, 0, 1);

type Props = {
	name: string;
	holes?: [Vector3[]];
};

export abstract class Unit extends Render {
	protected mesh: Mesh;
	protected state?: State<{ x: number; y: number }>;

	constructor(scene: Scene, { name, holes }: Props) {
		super(scene);

		this.mesh = CreatePolygon(
			name,
			{
				shape: SHAPE,
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

	hit() {
		this.dispose();

		if (!this.scene.activeCamera) {
			return;
		}

		const { x, y } = Vector3.Project(
			DAMAGE_VECTOR,
			this.mesh.getWorldMatrix(),
			this.scene.getTransformMatrix(),
			this.scene.activeCamera.viewport.toGlobal(window.innerWidth, window.innerHeight),
		);

		this.state = new State({ x, y });

		const damage = mount(Damage, { target: document.body, props: { position: this.state.value } });

		const updatePosition = () => {
			if (!this.scene.activeCamera || !this.state) {
				return;
			}

			const { x, y } = Vector3.Project(
				DAMAGE_VECTOR,
				this.mesh.getWorldMatrix(),
				this.scene.getTransformMatrix(),
				this.scene.activeCamera.viewport.toGlobal(window.innerWidth, window.innerHeight),
			);

			this.state.value.x = x;
			this.state.value.y = y;
		};

		this.scene.registerBeforeRender(updatePosition);

		setTimeout(() => {
			this.scene.unregisterBeforeRender(updatePosition);
			unmount(damage);
		}, 1000);
	}
}
