import { memo, State } from "$lib/core/utils";
import { Matrix, Vector3 } from "$lib/engine";
import { player } from "$lib/state/player";
import type { GlowLayer, Mesh, Scene } from "@babylonjs/core";
import { mount, unmount, type Component } from "svelte";

export const isEntity =
	<T>(type: unknown) =>
	(metadata: unknown): metadata is T =>
		metadata !== null &&
		typeof metadata === "object" &&
		"type" in metadata &&
		metadata.type === type;

export const getTime = () =>
	`${Math.floor(player.time / 1000 / 60)}:${Math.floor((player.time / 1000) % 60)
		.toString()
		.padStart(2, "0")}`;

export const mountComponent = <
	P extends Record<string, unknown>,
	T extends Component<P & { position: { x: number; y: number } }>,
>({
	scene,
	point,
	Component,
	props,
}: {
	scene: Scene;
	point: Vector3;
	Component: T;
	props: P;
}) => {
	let vectorProjection = getVectorProjection({ scene, point });
	const position = new State({ x: vectorProjection.x, y: vectorProjection.y });

	const component = mount(Component, {
		target: document.body,
		props: { position: position.state, ...props },
	});

	const observer = scene.onBeforeRenderObservable.add(() => {
		vectorProjection = getVectorProjection({ scene, point });

		position.state.x = vectorProjection.x;
		position.state.y = vectorProjection.y;
	});

	return () => {
		scene.onBeforeRenderObservable.remove(observer);
		unmount(component);
	};
};

const getVectorProjection = ({ scene, point }: { scene: Scene; point: Vector3 }) => {
	return Vector3.Project(
		point,
		Matrix.Identity(),
		scene.getTransformMatrix(),
		scene.activeCamera!.viewport.toGlobal(window.innerWidth, window.innerHeight),
	);
};

export const addGlow = memo((scene: Scene, mesh: Mesh) => {
	(scene.effectLayers[0]! as GlowLayer).addIncludedOnlyMesh(mesh);
});
