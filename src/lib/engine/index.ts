import type { Scene } from "@babylonjs/core";
import "@babylonjs/core/Culling/ray";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Physics/physicsEngineComponent";

export { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
export { Engine } from "@babylonjs/core/Engines/engine";
export { KeyboardEventTypes } from "@babylonjs/core/Events/keyboardEvents";
export { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
export { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
export { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
export { Matrix, Vector3 } from "@babylonjs/core/Maths/math.vector";
export { CreateCylinder } from "@babylonjs/core/Meshes/Builders/cylinderBuilder";
export { CreateDisc } from "@babylonjs/core/Meshes/Builders/discBuilder";
export { CreateLines } from "@babylonjs/core/Meshes/Builders/linesBuilder";
export { CreatePolygon, ExtrudePolygon } from "@babylonjs/core/Meshes/Builders/polygonBuilder";
export { TransformNode } from "@babylonjs/core/Meshes/transformNode";
export {
	PhysicsEventType,
	PhysicsMotionType,
	PhysicsShapeType,
} from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
export { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
export { PhysicsAggregate } from "@babylonjs/core/Physics/v2/physicsAggregate";
export { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
export { PhysicsShapeConvexHull } from "@babylonjs/core/Physics/v2/physicsShape";
export { Scene } from "@babylonjs/core/scene";

export abstract class Render {
	protected scene;
	protected engine;
	private unregister;

	constructor(scene: Scene) {
		this.scene = scene;
		this.engine = scene.getEngine();

		if (this.setup) {
			this.scene.onBeforeRenderObservable.addOnce(() => this.setup?.());
		}

		if (this.render) {
			const observer = scene.onBeforeRenderObservable.add(() =>
				this.render?.(this.engine.getDeltaTime()),
			);

			this.unregister = () => this.scene.onBeforeRenderObservable.remove(observer);
		}
	}

	protected setup?(): void;

	protected render?(delta?: number): void;

	dispose() {
		this.unregister?.();
	}
}
