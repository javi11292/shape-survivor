import { Damage } from "$lib/components/damage";
import { State } from "$lib/core/utils";
import { ExtrudePolygon, Matrix, PhysicsBody, Vector3 } from "$lib/engine";
import { createMeshSource } from "$lib/engine/mesh";
import type { AbstractMesh, Scene } from "@babylonjs/core";
import earcut from "earcut";
import { mount, unmount } from "svelte";
import { createExperience } from "./experience";

export const SHAPE = [new Vector3(0, 0, 1), new Vector3(-1, 0, -1), new Vector3(1, 0, -1)];

const getMesh = createMeshSource(() =>
	ExtrudePolygon("unit body source", { shape: SHAPE, depth: 1 }, undefined, earcut),
);

type Params = {
	scene: Scene;
	context?: { dispose?: () => void };
	mesh: AbstractMesh;
	getBody: (mesh: AbstractMesh) => PhysicsBody;
};

export const createUnit = ({ scene, mesh: childMesh, getBody }: Params) => {
	const mesh = getMesh().createInstance("unit body");
	const body = getBody(mesh);

	const unit = {
		mesh,
		body,

		dispose: () => {
			scene.onAfterPhysicsObservable.remove(observer);
			mesh.dispose();
		},

		hit: (damage: number, point: Vector3) => {
			unit.dispose();
			createExperience({ scene, position: mesh.position });

			let vectorProjection = getVectorProjection(point);

			if (!vectorProjection) {
				return;
			}

			const state = new State({ x: vectorProjection.x, y: vectorProjection.y });

			const component = mount(Damage, {
				target: document.body,
				props: { position: state.value, damage },
			});

			const observer = scene.onBeforeRenderObservable.add(() => {
				vectorProjection = getVectorProjection(point);

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

	const getVectorProjection = (point: Vector3) => {
		if (!scene.activeCamera) {
			return;
		}

		return Vector3.Project(
			point,
			Matrix.Identity(),
			scene.getTransformMatrix(),
			scene.activeCamera.viewport.toGlobal(window.innerWidth, window.innerHeight),
		);
	};

	mesh.addChild(childMesh);
	mesh.metadata = unit;

	const observer = scene.onAfterPhysicsObservable.add(() => {
		mesh.position.y = 0;
	});

	return unit;
};
