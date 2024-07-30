import type { IPhysicsCollisionEvent, Observable, Scene } from "@babylonjs/core";
import { PhysicsBody, PhysicsMotionType, TransformNode, Vector3 } from ".";

type Params = {
	scene: Scene;
	name: string;
	type: PhysicsMotionType;
	onCollision?: Parameters<Observable<IPhysicsCollisionEvent>["add"]>[0];
};

export const createBody = ({ scene, name, type, onCollision }: Params) => {
	const body = new PhysicsBody(new TransformNode(name), type, false, scene);
	body.disablePreStep = false;
	body.setMassProperties({ inertia: Vector3.Zero() });

	if (onCollision) {
		body.setCollisionCallbackEnabled(true);
		body.getCollisionObservable().add(onCollision);
	}

	return body;
};
