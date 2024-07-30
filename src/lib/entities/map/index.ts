import { PhysicsMotionType } from "$lib/engine";
import { createBody } from "$lib/engine/body";
import type { Scene } from "@babylonjs/core";
import { getMesh, getShape } from "./utils";

type Params = {
	scene: Scene;
};

export const createMap = ({ scene }: Params) => {
	const mesh = getMesh();
	const body = createBody({ name: "map", type: PhysicsMotionType.STATIC, scene });

	body.transformNode.addChild(mesh);
	body.shape = getShape(mesh, scene);
};
