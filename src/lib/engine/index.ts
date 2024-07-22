import "@babylonjs/core/Materials/standardMaterial";

import type { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine";
import { Scene } from "@babylonjs/core/scene";

export { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
export { Engine } from "@babylonjs/core/Engines/engine";
export { KeyboardEventTypes } from "@babylonjs/core/Events/keyboardEvents";
export { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
export { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
export { Vector3 } from "@babylonjs/core/Maths/math.vector";
export { CreatePolygon } from "@babylonjs/core/Meshes/Builders/polygonBuilder";
export { Mesh } from "@babylonjs/core/Meshes/mesh";
export { Scene };

export abstract class Render {
	protected scene: Scene;
	protected engine: AbstractEngine;

	private handleRender = () => {
		this.render(this.engine.getDeltaTime() / 1000);
	};

	constructor(scene: Scene) {
		this.scene = scene;
		this.engine = scene.getEngine();

		scene.registerBeforeRender(this.handleRender);
	}

	protected render(delta: number): void;
	protected render() {}

	dispose() {
		this.scene.unregisterBeforeRender(this.handleRender);
	}
}
