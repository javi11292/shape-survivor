import { ITEM_MASK, PLAYER_AURA_MASK } from "$lib/constants";
import { memo } from "$lib/core/utils";
import {
	Color3,
	CreateCylinder,
	CreateDisc,
	PhysicsMotionType,
	PhysicsShapeConvexHull,
	StandardMaterial,
	Vector3,
} from "$lib/engine";
import { createBody } from "$lib/engine/body";
import { createMeshSource } from "$lib/engine/mesh";
import { createRenderable } from "$lib/engine/renderable";
import type { Mesh, Scene } from "@babylonjs/core";

const SPEED = 0.02;

const getMesh = createMeshSource(() => {
	const mesh = CreateDisc("experience source", { radius: 0.25 });
	const material = new StandardMaterial("experience material");

	material.diffuseColor = new Color3(0.4, 0.4, 1);
	mesh.material = material;
	mesh.renderingGroupId = 1;

	return mesh;
});

const getBodyMesh = createMeshSource(() =>
	CreateCylinder("experience body source", { height: 1, diameter: 0.5 }),
);

const getShape = memo((mesh: Mesh, scene: Scene) => new PhysicsShapeConvexHull(mesh, scene));

type Params = {
	scene: Scene;
	position: Vector3;
};

export const createExperience = ({ scene, position }: Params) => {
	const mesh = getBodyMesh().createInstance("experience body");
	const body = createBody({ mesh, type: PhysicsMotionType.STATIC, scene });

	const entity = createRenderable({
		scene,
		render: (delta) => {
			if (!target) {
				return;
			}

			if (Vector3.DistanceSquared(mesh.position, target) <= 1) {
				experience.dispose();
				return;
			}

			mesh.lookAt(target);
			mesh.position.addInPlace(mesh.getDirection(new Vector3(0, 0, SPEED * delta)));
		},
	});

	const experience = {
		absorb: (nextTarget: Vector3) => {
			target = nextTarget;
		},

		dispose: () => {
			entity.dispose();
			mesh.dispose();
		},
	};

	let target: Vector3 | undefined;

	const childMesh = getMesh().createInstance("experience");
	childMesh.rotation.x = Math.PI / 2;

	mesh.addChild(childMesh);
	mesh.position = position;
	mesh.metadata = experience;

	body.shape = getShape(mesh.sourceMesh, scene);
	body.shape.filterMembershipMask = ITEM_MASK;
	body.shape.filterCollideMask = PLAYER_AURA_MASK;

	return experience;
};
