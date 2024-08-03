import { dev } from "$app/environment";
import { MAP_SIZE } from "$lib/constants";
import { effect } from "$lib/core/utils";
import { createEnemy } from "$lib/entities/enemy";
import { createMap } from "$lib/entities/map";
import { createPlayer } from "$lib/entities/player";
import { game, resetGame } from "$lib/state/game";
import { resetPlayer } from "$lib/state/player";
import HavokPhysics from "@babylonjs/havok";
import { untrack } from "svelte";
import {
	Color3,
	Color4,
	Engine,
	HavokPlugin,
	KeyboardEventTypes,
	Scene,
	ScenePerformancePriority,
	StandardMaterial,
	Vector3,
} from ".";
import { getManager } from "./assets";
import { createTimer } from "./timer";

const SPAWN_DISTANCE = 50;
const SPAWN_SPEED = 1500;
const BOSS_SPAWN_SPEED = 60000;
const MAX = MAP_SIZE / 2 - 2;

const createScene = async (engine: Engine) => {
	let improved = false;
	game.havok = new HavokPlugin(true, await HavokPhysics());
	const scene = new Scene(engine);

	createTimer({
		scene,
		timeout: 30000,
		callback: () => {
			game.difficulty++;
		},
	});

	createTimer({
		scene,
		timeout: BOSS_SPAWN_SPEED * 5,
		callback: () => {
			improved = true;
		},
	});

	createTimer({
		scene,
		timeout: BOSS_SPAWN_SPEED,
		callback: () => {
			createEnemy({
				scene,
				position: getPosition(),
				target: player.position,
				boss: true,
				improved,
			});

			game.difficulty++;
		},
	});

	const getPosition = () => {
		const x = Math.random() * SPAWN_DISTANCE * 2 - SPAWN_DISTANCE;
		const y =
			Math.sqrt(Math.pow(SPAWN_DISTANCE, 2) - Math.pow(x, 2)) * (Math.random() < 0.5 ? -1 : 1);

		const position = player.position.add(new Vector3(x, 0, y));

		if (position.x < -MAX) {
			position.x = -MAX;
		} else if (position.x > MAX) {
			position.x = MAX;
		}

		if (position.z < -MAX) {
			position.z = -MAX;
		} else if (position.z > MAX) {
			position.z = MAX;
		}

		return position;
	};

	const timer = createTimer({
		scene,
		timeout: SPAWN_SPEED,
		callback: () => {
			createEnemy({
				scene,
				position: getPosition(),
				target: player.position,
				improved: Math.random() < game.difficulty * 0.025,
			});
		},
	});

	const disposeTimeout = effect(() => {
		timer.timeout = SPAWN_SPEED / (1 + game.difficulty * 0.25);
	});

	const material = new StandardMaterial("default");

	material.emissiveColor = new Color3(1, 1, 1);
	scene.clearColor = new Color4(0, 0, 0);
	scene.enablePhysics(Vector3.Zero(), game.havok);
	scene.performancePriority = ScenePerformancePriority.Intermediate;
	scene.defaultMaterial = material;

	const player = createPlayer({ scene });
	createMap({ scene });

	scene.onDisposeObservable.add(() => {
		disposeTimeout();
	});

	return scene;
};

export const createGame = async (canvas: HTMLCanvasElement) => {
	untrack(() => game.dispose?.());
	resetGame();
	resetPlayer();

	const engine = new Engine(canvas, undefined, undefined, true);
	const scene = await createScene(engine);
	await getManager(scene);

	const resize = () => engine.resize();

	if (dev) {
		const { Inspector } = await import("@babylonjs/inspector");

		scene.onKeyboardObservable.add(({ type, event }) => {
			if (type !== KeyboardEventTypes.KEYDOWN || event.key.toUpperCase() !== "Ñ") {
				return;
			}

			if (Inspector.IsVisible) {
				Inspector.Hide();
			} else {
				Inspector.Show(scene, { embedMode: true, overlay: true });
			}
		});
	}

	scene.onKeyboardObservable.add(({ type, event }) => {
		if (type !== KeyboardEventTypes.KEYDOWN) {
			return;
		}

		const key = event.key.toUpperCase();

		switch (key) {
			case "ESCAPE":
			case "P": {
				game.running = !game.running;

				break;
			}
		}
	});

	engine.runRenderLoop(() => {
		if (!game.running) {
			return;
		}

		scene.render();
	});

	window.addEventListener("resize", resize);

	const dispose = () => {
		engine.dispose();
		window.removeEventListener("resize", resize);
	};

	if (!game.mounted) {
		dispose();
	} else {
		game.dispose = dispose;
	}
};
