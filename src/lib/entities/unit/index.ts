import { PhysicsBody } from "$lib/engine";
import type { AbstractMesh, Scene } from "@babylonjs/core";
import { createExperience } from "../experience";
import { SHAPE, getMesh, showDamage } from "./utils";

const EXPERIENCE = 1;

type Params = {
	scene: Scene;
	hp: number;
	context?: { dispose?: () => void };
	mesh: AbstractMesh;
	getBody: (mesh: AbstractMesh) => PhysicsBody;
};

export { SHAPE };

export const createUnit = ({ scene, mesh: childMesh, getBody, hp }: Params) => {
	const unit = {
		get mesh() {
			return mesh;
		},
		get body() {
			return body;
		},

		dispose: () => {
			scene.onAfterPhysicsObservable.remove(observer);
			mesh.dispose();
		},

		hit: (damage: number, fromEnemy?: boolean) => {
			remainingHp -= damage;

			if (remainingHp <= 0) {
				unit.dispose();

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

	let remainingHp = hp;

	return unit;
};
