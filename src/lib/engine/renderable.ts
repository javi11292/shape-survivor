import type { Scene } from "@babylonjs/core";

type Params = {
	scene: Scene;
	render: (delta: number) => void;
};

export const createRenderable = ({ scene, render }: Params) => {
	const engine = scene.getEngine();
	const observer = scene.onBeforeRenderObservable.add(() => render(engine.getDeltaTime()));

	return {
		dispose: () => {
			scene.onBeforeRenderObservable.remove(observer);
		},
	};
};
