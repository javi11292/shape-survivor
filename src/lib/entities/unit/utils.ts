import { Damage } from "$lib/components/damage";
import { State } from "$lib/core/utils";
import { ExtrudePolygon, Matrix, Vector3 } from "$lib/engine";
import { createMeshSource } from "$lib/engine/mesh";
import type { Scene } from "@babylonjs/core";
import earcut from "earcut";
import { mount, unmount } from "svelte";
export const SHAPE = [new Vector3(0, 0, 1), new Vector3(-1, 0, -1), new Vector3(1, 0, -1)];

export const getMesh = createMeshSource(() =>
	ExtrudePolygon("unit body source", { shape: SHAPE, depth: 1 }, undefined, earcut),
);

export const showDamage = ({
	scene,
	point,
	damage,
	fromEnemy,
}: {
	scene: Scene;
	point: Vector3;
	damage: number;
	fromEnemy?: boolean;
}) => {
	let vectorProjection = getVectorProjection({ scene, point });

	if (!vectorProjection) {
		return;
	}

	const state = new State({ x: vectorProjection.x, y: vectorProjection.y });

	const component = mount(Damage, {
		target: document.body,
		props: { position: state.state, damage, fromEnemy },
	});

	const observer = scene.onBeforeRenderObservable.add(() => {
		vectorProjection = getVectorProjection({ scene, point });

		if (!vectorProjection || !state) {
			return;
		}

		state.state.x = vectorProjection.x;
		state.state.y = vectorProjection.y;
	});

	setTimeout(() => {
		scene.onBeforeRenderObservable.remove(observer);
		unmount(component);
	}, 750);
};

const getVectorProjection = ({ scene, point }: { scene: Scene; point: Vector3 }) => {
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
