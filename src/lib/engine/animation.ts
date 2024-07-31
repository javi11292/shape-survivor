import type { Scene } from "@babylonjs/core";
import { createRender } from "./render";

export const createAnimation = ({
	scene,
	keyframes,
	callback,
	onAnimationEnd,
}: {
	scene: Scene;
	onAnimationEnd?: () => void;
	callback: (value: number) => void;
	keyframes: { value: number; frame: number }[];
}) => {
	let frame = 0;
	let remainingFrames = keyframes;
	let prevFrame = { frame: 0, value: 0 };

	const render = createRender({
		scene,
		render: (delta) => {
			for (const keyframe of remainingFrames) {
				if (frame <= keyframe.frame) {
					const elapsed = (frame - prevFrame.frame) / (keyframe.frame - prevFrame.frame);
					const value =
						prevFrame.value +
						(Number.isNaN(elapsed) ? 1 : elapsed) * (keyframe.value - prevFrame.value);

					callback(value);

					break;
				} else {
					remainingFrames = remainingFrames.slice(1);
					prevFrame = keyframe;
				}
			}

			if (!remainingFrames.length) {
				render.dispose();
				onAnimationEnd?.();
				return;
			}

			frame += delta;
		},
	});

	return render;
};
