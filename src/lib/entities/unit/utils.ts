import { Damage } from "$lib/components/damage";
import { ExtrudePolygon, Vector3 } from "$lib/engine";
import { createMeshSource } from "$lib/engine/mesh";
import { mountComponent } from "$lib/utils";
import type { Scene } from "@babylonjs/core";
import earcut from "earcut";

export const getMesh = createMeshSource((shape: Vector3[]) =>
	ExtrudePolygon(
		"unit body",
		{
			shape,
			depth: 1,
		},
		undefined,
		earcut,
	),
);

export const showDamage = ({
	scene,
	point,
	damage,
	fromEnemy,
}: {
	scene: Scene;
	point: Vector3;
	damage: number;
	fromEnemy?: boolean;
}) => {
	const dispose = mountComponent({
		scene,
		point,
		Component: Damage,
		props: { damage, fromEnemy },
	});

	setTimeout(() => {
		dispose();
	}, 750);
};
