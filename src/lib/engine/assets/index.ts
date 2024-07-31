import { memo } from "$lib/core/utils";
import { AssetsManager, Sound } from "$lib/engine";
import type { ISoundOptions, Scene } from "@babylonjs/core";
import death from "./death.mp3";
import hit from "./hit.mp3";
import laser from "./laser.mp3";
import shot from "./shot.mp3";
import suck from "./suck.mp3";

type Assets = {
	shot: Sound;
	suck: Sound;
	death: Sound;
	hit: Sound;
	laser: Sound;
};

export const assets = {} as Assets;

const addSound = (
	{
		manager,
		name,
		scene,
		path,
	}: {
		manager: AssetsManager;
		name: keyof typeof assets;
		path: string;
		scene: Scene;
	},
	params?: ISoundOptions,
) =>
	(manager.addBinaryFileTask(name, path).onSuccess = (task) =>
		(assets[name] = new Sound(name, task.data, scene, undefined, params)));

export const getManager = memo((scene: Scene) => {
	const manager = new AssetsManager(scene);

	manager.useDefaultLoadingScreen = false;

	addSound({ manager, scene, name: "shot", path: shot });
	addSound({ manager, scene, name: "laser", path: laser });
	addSound({ manager, scene, name: "suck", path: suck }, { volume: 0.4 });
	addSound({ manager, scene, name: "death", path: death });
	addSound({ manager, scene, name: "hit", path: hit });

	return manager.loadAsync();
});
