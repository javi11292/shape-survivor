import { memo } from "$lib/core/utils";
import { AssetsManager, Sound } from "$lib/engine";
import type { Scene } from "@babylonjs/core";
import shot from "./shot.mp3";
import suck from "./suck.mp3";

type Assets = {
	shot: Sound;
	suck: Sound;
};

export const assets = {} as Assets;

export const getManager = memo((scene: Scene) => {
	const manager = new AssetsManager(scene);

	manager.useDefaultLoadingScreen = false;

	manager.addBinaryFileTask("shot", shot).onSuccess = (task) =>
		(assets.shot = new Sound("projectile sound", task.data, scene));

	manager.addBinaryFileTask("suck", suck).onSuccess = (task) =>
		(assets.suck = new Sound("experience sound", task.data, scene));

	return manager.loadAsync();
});
