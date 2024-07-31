import type { Scene } from "@babylonjs/core";
import { createRender } from "./render";

export const createAnimation = ({
	scene,
	keyframes,
	callback,
}: {
	scene: Scene;
	callback: (value: number) => void;
	keyframes: { value: number; frame: number }[];
}) => {
	let frame = 0;

	const render = createRender({
		scene,
		render: (delta) => {
			let prevFrame = { frame: 0, value: 0 };

			for (let keyframe of keyframes) {
				if (frame <= keyframe.frame) {
					const elapsed = (frame - prevFrame.frame) / (keyframe.frame - prevFrame.frame);
					const value = prevFrame.value + elapsed * (keyframe.value - prevFrame.value);

					callback(value);

					break;
				}

				prevFrame = keyframe;
			}

			if (frame > keyframes[keyframes.length - 1]!.frame) {
				render.dispose();
				return;
			}

			frame += delta;
		},
	});

	return render;
};
