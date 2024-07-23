import "@babylonjs/core/Culling/ray";
import "@babylonjs/core/Materials/standardMaterial";

import { Scene } from "@babylonjs/core/scene";

export { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
export { Engine } from "@babylonjs/core/Engines/engine";
export { KeyboardEventTypes } from "@babylonjs/core/Events/keyboardEvents";
export { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
export { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
export { Vector3 } from "@babylonjs/core/Maths/math.vector";
export { CreateLines } from "@babylonjs/core/Meshes/Builders/linesBuilder";
export { CreatePolygon } from "@babylonjs/core/Meshes/Builders/polygonBuilder";
export { Mesh } from "@babylonjs/core/Meshes/mesh";
export { TransformNode } from "@babylonjs/core/Meshes/transformNode";
export { Scene };

export abstract class Render {
	protected scene;
	protected engine;
	private unregister;

	constructor(scene: Scene) {
		this.scene = scene;
		this.engine = scene.getEngine();

		if (this.setup) {
			const setup = () => {
				this.setup?.();
				this.scene.unregisterBeforeRender(setup);
			};

			this.scene.registerBeforeRender(setup);
		}

		if (this.render) {
			const render = () => {
				this.render?.(this.engine.getDeltaTime() / 1000);
			};

			scene.registerBeforeRender(render);
			this.unregister = () => this.scene.unregisterBeforeRender(render);
		}
	}

	protected setup?(): void;

	protected render?(delta?: number): void;

	dispose() {
		this.unregister?.();
	}
}
