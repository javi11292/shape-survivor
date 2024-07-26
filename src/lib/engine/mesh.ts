import { memo } from "$lib/core/utils";
import type { Mesh } from "@babylonjs/core";

export const createMeshSource = <T extends unknown[]>(callback: (...args: T) => Mesh) => {
	return memo(
		(...args: T) => {
			const mesh = callback(...args);
			mesh.isVisible = false;

			return mesh;
		},

		(mesh) => mesh.isDisposed(),
	);
};
