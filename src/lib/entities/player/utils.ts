import {
	CreatePolygon,
	PhysicsShapeConvexHull,
	PointerEventTypes,
	Scene,
	TransformNode,
	Vector3,
} from "$lib/engine";
import type { Mesh } from "@babylonjs/core";
import earcut from "earcut";
import { SHAPE } from "../unit";

export enum KEYS {
	"up" = "W",
	"down" = "S",
	"left" = "A",
	"right" = "D",
}

const keys = new Set<string>(Object.values(KEYS));

const CAMERA_HEIGHT = new Vector3(0, -9, 0);

export const getShape = (mesh: Mesh, scene: Scene) => new PhysicsShapeConvexHull(mesh, scene);

export const getMesh = () =>
	CreatePolygon(
		"player",
		{
			shape: SHAPE,
		},
		undefined,
		earcut,
	);

export const addEvents = ({
	scene,
	node,
	input,
}: {
	scene: Scene;
	node: TransformNode;
	input: Set<KEYS>;
}) => {
	scene.onPointerObservable.add(({ pickInfo }) => {
		const origin = pickInfo!.ray!.origin;

		node.lookAt(origin.addInPlace(CAMERA_HEIGHT));
	}, PointerEventTypes.POINTERMOVE);

	const handleEvent = (event: KeyboardEvent) => {
		switch (event.type) {
			case "keydown": {
				const key = event.key.toUpperCase();

				if (keys.has(key)) {
					input.add(key as KEYS);
				}

				break;
			}

			case "keyup": {
				const key = event.key.toUpperCase();

				if (keys.has(key)) {
					input.delete(key as KEYS);
				}

				break;
			}
		}
	};

	window.addEventListener("keydown", handleEvent);
	window.addEventListener("keyup", handleEvent);

	scene.onDisposeObservable.add(() => {
		window.removeEventListener("keydown", handleEvent);
		window.removeEventListener("keyup", handleEvent);
	});
};
