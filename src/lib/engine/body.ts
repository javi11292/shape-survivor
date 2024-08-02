import { game } from "$lib/state/game";
import type { Scene } from "@babylonjs/core";
import { PhysicsBody, PhysicsEventType, PhysicsMotionType, TransformNode, Vector3 } from ".";

type Params = {
	scene: Scene;
	name: string;
	type: PhysicsMotionType;
	onCollision?: (trigger: PhysicsBody) => void;
	onTrigger?: (trigger: PhysicsBody) => void;
};

export const createBody = ({ scene, name, type, onCollision, onTrigger }: Params) => {
	const body = new PhysicsBody(new TransformNode(name), type, false, scene);
	body.disablePreStep = false;
	body.setMassProperties({ inertia: Vector3.Zero(), mass: 1 });

	const observer = scene.onAfterPhysicsObservable.add(() => {
		body.transformNode.position.y = 0;
	});

	body.transformNode.onDisposeObservable.add(() => scene.onAfterPhysicsObservable.remove(observer));

	if (onCollision) {
		body.setCollisionCallbackEnabled(true);
		body.getCollisionObservable;

		const observer = game.havok.onCollisionObservable.add((data) => {
			let owner: PhysicsBody;
			let trigger: PhysicsBody;

			if (data.collider === body) {
				owner = data.collider;
				trigger = data.collidedAgainst;
			} else {
				owner = data.collidedAgainst;
				trigger = data.collider;
			}

			if (owner !== body) {
				return;
			}

			onCollision(trigger);
		});

		body.transformNode.onDisposeObservable.add(() => {
			game.havok.onCollisionObservable.remove(observer);
		});
	}

	if (onTrigger) {
		const observer = game.havok.onTriggerCollisionObservable.add((data) => {
			let owner: PhysicsBody;
			let trigger: PhysicsBody;

			if (data.type !== PhysicsEventType.TRIGGER_ENTERED) {
				return;
			}

			if (data.collider === body) {
				owner = data.collider;
				trigger = data.collidedAgainst;
			} else {
				owner = data.collidedAgainst;
				trigger = data.collider;
			}

			if (owner !== body) {
				return;
			}

			onTrigger(trigger);
		});

		body.transformNode.onDisposeObservable.add(() => {
			game.havok.onTriggerCollisionObservable.remove(observer);
		});
	}

	return body;
};
