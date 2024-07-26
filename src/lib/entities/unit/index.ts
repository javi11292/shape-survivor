import { Damage } from "$lib/components/damage";
import { State } from "$lib/core/utils";
import { PhysicsBody, Vector3 } from "$lib/engine";
import type { AbstractMesh, Scene } from "@babylonjs/core";
import { mount, unmount } from "svelte";
import { createExperience } from "../experience";
import { SHAPE, getMesh, getVectorProjection } from "./utils";

type Params = {
	scene: Scene;
	context?: { dispose?: () => void };
	mesh: AbstractMesh;
	getBody: (mesh: AbstractMesh) => PhysicsBody;
};

export { SHAPE };

export const createUnit = ({ scene, mesh: childMesh, getBody }: Params) => {
	const unit = {
		get mesh() {
			return mesh;
		},
		get body() {
			return body;
		},

		dispose: () => {
			scene.onAfterPhysicsObservable.remove(observer);
			mesh.dispose();
		},

		hit: (damage: number, point: Vector3) => {
			unit.dispose();
			createExperience({ scene, position: mesh.position });

			let vectorProjection = getVectorProjection({ scene, point });

			if (!vectorProjection) {
				return;
			}

			const state = new State({ x: vectorProjection.x, y: vectorProjection.y });

			const component = mount(Damage, {
				target: document.body,
				props: { position: state.value, damage },
			});

			const observer = scene.onBeforeRenderObservable.add(() => {
				vectorProjection = getVectorProjection({ scene, point });

				if (!vectorProjection || !state) {
					return;
				}

				state.value.x = vectorProjection.x;
				state.value.y = vectorProjection.y;
			});

			setTimeout(() => {
				scene.onBeforeRenderObservable.remove(observer);
				unmount(component);
			}, 750);
		},
	};

	const mesh = getMesh().createInstance("unit body");
	const body = getBody(mesh);

	mesh.addChild(childMesh);
	mesh.metadata = unit;

	const observer = scene.onAfterPhysicsObservable.add(() => {
		mesh.position.y = 0;
	});

	return unit;
};
