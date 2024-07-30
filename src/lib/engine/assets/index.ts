import { memo } from "$lib/core/utils";
import { AssetsManager, Sound } from "$lib/engine";
import type { Scene } from "@babylonjs/core";
import death from "./death.mp3";
import hit from "./hit.mp3";
import shot from "./shot.mp3";
import suck from "./suck.mp3";

type Assets = {
	shot: Sound;
	suck: Sound;
	death: Sound;
	hit: Sound;
};

export const assets = {} as Assets;

export const getManager = memo((scene: Scene) => {
	const manager = new AssetsManager(scene);

	manager.useDefaultLoadingScreen = false;

	manager.addBinaryFileTask("shot", shot).onSuccess = (task) =>
		(assets.shot = new Sound("shot sound", task.data, scene));

	manager.addBinaryFileTask("suck", suck).onSuccess = (task) =>
		(assets.suck = new Sound("suck sound", task.data, scene, undefined, { volume: 0.4 }));

	manager.addBinaryFileTask("death", death).onSuccess = (task) =>
		(assets.death = new Sound("death sound", task.data, scene));

	manager.addBinaryFileTask("hit", hit).onSuccess = (task) =>
		(assets.hit = new Sound("hit sound", task.data, scene));

	return manager.loadAsync();
});
