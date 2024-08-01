import type { Scene } from "@babylonjs/core";
import { createRender } from "./render";

type Params = {
	repeat?: boolean;
	autostart?: boolean;
	scene: Scene;
	timeout: number;
	callback: () => void;
};

export const createTimer = ({
	scene,
	timeout: initialTimeout,
	callback,
	autostart,
	repeat = true,
}: Params) => {
	let timeout = initialTimeout;
	let elapsed = 0;

	const render = createRender({
		autostart,
		scene,
		render: (delta) => {
			elapsed += delta;

			if (elapsed >= timeout) {
				callback();

				if (repeat) {
					elapsed -= timeout;
				} else {
					render.dispose();
					elapsed = 0;
				}
			}
		},
	});

	return {
		dispose: render.dispose,
		start: render.start,

		get timeout() {
			return timeout;
		},

		set timeout(value: number) {
			timeout = value;
		},
	};
};
