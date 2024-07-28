import { PhysicsBody } from "$lib/engine";
import { assets } from "$lib/engine/assets";
import type { AbstractMesh, Scene } from "@babylonjs/core";
import { createExperience } from "../experience";
import { SHAPE, getMesh, showDamage } from "./utils";

const EXPERIENCE = 1;

type Params = {
	scene: Scene;
	state: { hp: number };
	context?: { dispose?: () => void };
	mesh: AbstractMesh;
	getBody: (mesh: AbstractMesh) => PhysicsBody;
};

export { SHAPE };

export const createUnit = ({ scene, mesh: childMesh, getBody, state }: Params) => {
	const unit = {
		get mesh() {
			return mesh;
		},
		get body() {
			return body;
		},

		hit: (damage: number, fromEnemy?: boolean) => {
			assets.hit.play();
			state.hp -= damage;

			if (state.hp <= 0) {
				mesh.dispose();

				if (!fromEnemy) {
					createExperience({ scene, position: mesh.position, amount: EXPERIENCE });
				}
			}

			showDamage({ point: mesh.position, damage, scene, fromEnemy });
		},
	};

	const mesh = getMesh().createInstance("unit body");
	const body = getBody(mesh);

	mesh.addChild(childMesh);
	mesh.metadata = unit;

	const observer = scene.onAfterPhysicsObservable.add(() => {
		mesh.position.y = 0;
	});

	mesh.onDisposeObservable.add(() => scene.onAfterPhysicsObservable.remove(observer));

	return unit;
};
