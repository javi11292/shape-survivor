import type { AbstractMesh, IPhysicsCollisionEvent, Observable, Scene } from "@babylonjs/core";
import { PhysicsBody, PhysicsMotionType, Vector3 } from ".";

export namespace createBody {
	export type Params = {
		scene: Scene;
		mesh: AbstractMesh;
		type: PhysicsMotionType;
		onCollision?: Parameters<Observable<IPhysicsCollisionEvent>["add"]>[0];
	};
}

export const createBody = ({ scene, mesh, type, onCollision }: createBody.Params) => {
	const body = new PhysicsBody(mesh, type, false, scene);
	body.disablePreStep = false;
	body.setMassProperties({ inertia: Vector3.Zero() });

	mesh.isVisible = false;

	if (onCollision) {
		body.setCollisionCallbackEnabled(true);
		body.getCollisionObservable().add(onCollision);
	}

	return body;
};
