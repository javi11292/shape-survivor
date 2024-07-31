import type { HavokPlugin, Scene } from "@babylonjs/core";
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
	body.setMassProperties({ inertia: Vector3.Zero() });

	const observer = scene.onAfterPhysicsObservable.add(() => {
		body.transformNode.position.y = 0;
	});

	body.transformNode.onDisposeObservable.add(() => scene.onAfterPhysicsObservable.remove(observer));

	if (onCollision) {
		const plugin = scene.getPhysicsEngine()!.getPhysicsPlugin() as HavokPlugin;

		body.setCollisionCallbackEnabled(true);
		body.getCollisionObservable;

		const observer = plugin.onCollisionObservable.add((data) => {
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
			plugin.onCollisionObservable.remove(observer);
		});
	}

	if (onTrigger) {
		const plugin = scene.getPhysicsEngine()!.getPhysicsPlugin() as HavokPlugin;

		const observer = plugin.onTriggerCollisionObservable.add((data) => {
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
			plugin.onTriggerCollisionObservable.remove(observer);
		});
	}

	return body;
};
