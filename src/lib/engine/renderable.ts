import type { Scene } from "@babylonjs/core";

export namespace createRenderable {
	export type Params = {
		scene: Scene;
		render: (delta: number) => void;
	};
}

export const createRenderable = ({ scene, render }: createRenderable.Params) => {
	const engine = scene.getEngine();
	const observer = scene.onBeforeRenderObservable.add(() => render(engine.getDeltaTime()));

	return {
		dispose: () => {
			scene.onBeforeRenderObservable.remove(observer);
		},
	};
};
