import type { Scene } from "@babylonjs/core";
import { createRenderable } from "./renderable";

type Params = {
	repeat?: boolean;
	scene: Scene;
	timeout: number;
	callback: () => void;
};

export const createTimer = ({ scene, timeout, callback, repeat = true }: Params) => {
	let elapsed = 0;

	const renderable = createRenderable({
		autostart: repeat,
		scene,
		render: (delta) => {
			elapsed += delta;

			if (elapsed >= timeout) {
				callback();

				if (repeat) {
					elapsed -= timeout;
				} else {
					renderable.dispose();
					elapsed = 0;
				}
			}
		},
	});

	return renderable;
};
