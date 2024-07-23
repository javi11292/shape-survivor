import { Damage } from "$lib/components/damage";
import { State } from "$lib/core/utils";
import { CreatePolygon, Render, Vector3, type Scene } from "$lib/engine";
import earcut from "earcut";
import { mount, unmount } from "svelte";

const SHAPE = [new Vector3(0, 0, 1), new Vector3(-1, 0, -1), new Vector3(1, 0, -1)];
const DAMAGE_VECTOR = new Vector3();

type Props = {
	name: string;
	holes?: [Vector3[]];
};

export abstract class Unit extends Render {
	protected mesh;
	private state?: State<{ x: number; y: number }>;

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

	hit(damage: number) {
		this.dispose();

		let vectorProjection = this.getVectorProjection();

		if (!vectorProjection) {
			return;
		}

		this.state = new State({ x: vectorProjection.x, y: vectorProjection.y });

		const component = mount(Damage, {
			target: document.body,
			props: { position: this.state.value, damage },
		});

		const updatePosition = () => {
			vectorProjection = this.getVectorProjection();

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

	private getVectorProjection() {
		if (!this.scene.activeCamera) {
			return;
		}

		return Vector3.Project(
			DAMAGE_VECTOR,
			this.mesh.getWorldMatrix(),
			this.scene.getTransformMatrix(),
			this.scene.activeCamera.viewport.toGlobal(window.innerWidth, window.innerHeight),
		);
	}
}
