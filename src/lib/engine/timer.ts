import type { Scene } from "@babylonjs/core";
import { createRenderable } from "./renderable";

type Params = {
	scene: Scene;
	timeout: number;
	callback: () => void;
};

export const createTimer = ({ scene, timeout, callback }: Params) => {
	let elapsed = 0;

	const renderable = createRenderable({
		scene,
		render: (delta) => {
			elapsed += delta;

			if (elapsed >= timeout) {
				callback();
				elapsed -= timeout;
			}
		},
	});

	return renderable;
};
