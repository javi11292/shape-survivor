import { MAP_SIZE } from "$lib/constants";
import { PhysicsMotionType, Vector3 } from "$lib/engine";
import { createBody } from "$lib/engine/body";
import type { Mesh, Scene } from "@babylonjs/core";
import { WALL_WIDTH, getShape, getWallMesh } from "./utils";

type Params = {
	scene: Scene;
};

const addWall = ({
	mesh,
	scene,
	position,
	rotation,
}: {
	mesh: Mesh;
	scene: Scene;
	position: Vector3;
	rotation: Vector3;
}) => {
	const body = createBody({ name: "wall", type: PhysicsMotionType.STATIC, scene });
	body.transformNode.addChild(mesh.createInstance("wall"));
	body.transformNode.position = position;
	body.transformNode.rotation = rotation;
	body.shape = getShape(mesh, scene);
};

const POSITION = MAP_SIZE / 2 + WALL_WIDTH;

export const createMap = ({ scene }: Params) => {
	const mesh = getWallMesh();

	addWall({
		mesh,
		scene,
		position: new Vector3(POSITION - WALL_WIDTH, 0, -POSITION),
		rotation: Vector3.Zero(),
	});

	addWall({
		mesh,
		scene,
		position: new Vector3(-POSITION, 0, -POSITION),
		rotation: Vector3.Zero(),
	});

	addWall({
		mesh,
		scene,
		position: new Vector3(-POSITION, 0, POSITION),
		rotation: new Vector3(0, Math.PI / 2, 0),
	});

	addWall({
		mesh,
		scene,
		position: new Vector3(-POSITION, 0, -POSITION + WALL_WIDTH),
		rotation: new Vector3(0, Math.PI / 2, 0),
	});
};
