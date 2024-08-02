import { Damage } from "$lib/components/damage";
import { State } from "$lib/core/utils";
import { ExtrudePolygon, Matrix, Vector3 } from "$lib/engine";
import { createMeshSource } from "$lib/engine/mesh";
import type { Scene } from "@babylonjs/core";
import earcut from "earcut";
import { mount, unmount } from "svelte";

export const getMesh = createMeshSource((shape: Vector3[]) =>
	ExtrudePolygon(
		"unit body",
		{
			shape,
			depth: 1,
		},
		undefined,
		earcut,
	),
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
	const position = new State({ x: vectorProjection.x, y: vectorProjection.y });

	const component = mount(Damage, {
		target: document.body,
		props: { position: position.state, damage, fromEnemy },
	});

	const observer = scene.onBeforeRenderObservable.add(() => {
		vectorProjection = getVectorProjection({ scene, point });

		position.state.x = vectorProjection.x;
		position.state.y = vectorProjection.y;
	});

	setTimeout(() => {
		scene.onBeforeRenderObservable.remove(observer);
		unmount(component);
	}, 750);
};

const getVectorProjection = ({ scene, point }: { scene: Scene; point: Vector3 }) => {
	return Vector3.Project(
		point,
		Matrix.Identity(),
		scene.getTransformMatrix(),
		scene.activeCamera!.viewport.toGlobal(window.innerWidth, window.innerHeight),
	);
};
