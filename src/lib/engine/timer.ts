import type { Scene } from "@babylonjs/core";
import { createRenderable } from "./renderable";

type Params = {
	repeat?: boolean;
	scene: Scene;
	timeout: number;
	callback: () => void;
};

export const createTimer = ({
	scene,
	timeout: initialTimeout,
	callback,
	repeat = true,
}: Params) => {
	let timeout = initialTimeout;
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

	return {
		dispose: renderable.dispose,
		start: renderable.start,

		get timeout() {
			return timeout;
		},

		set timeout(value: number) {
			timeout = value;
		},
	};
};
