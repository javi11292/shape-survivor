import type { Mesh } from "@babylonjs/core";

export const prepareMesh = (callback: () => Mesh) => {
	let mesh: Mesh;

	return () => {
		if (mesh && !mesh.isDisposed()) {
			return mesh;
		}

		mesh = callback();
		mesh.isVisible = false;

		return mesh;
	};
};
