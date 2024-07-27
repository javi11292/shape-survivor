import type { Scene } from "@babylonjs/core";

type Params = {
	scene: Scene;
	render: (delta: number) => void;
	autostart?: boolean;
};

export const createRenderable = ({ scene, render, autostart = true }: Params) => {
	const engine = scene.getEngine();

	let observer: ReturnType<typeof scene.onBeforeRenderObservable.add>;

	const dispose = () => {
		scene.onBeforeRenderObservable.remove(observer);
	};

	const start = () => {
		observer = scene.onBeforeRenderObservable.add(() => render(engine.getDeltaTime()));
	};

	if (autostart) {
		start();
	}

	return { dispose, start };
};
