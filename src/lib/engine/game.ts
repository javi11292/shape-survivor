import { dev } from "$app/environment";
import { createEnemy } from "$lib/entities/enemy";
import { createPlayer } from "$lib/entities/player";
import { game } from "$lib/state/game";
import { player } from "$lib/state/player";
import HavokPhysics from "@babylonjs/havok";
import { untrack } from "svelte";
import { Color4, Engine, HavokPlugin, HemisphericLight, Scene, Vector3 } from ".";
import { getManager } from "./assets";
import { createTimer } from "./timer";

const SPAWN_DISTANCE = 40;
const SPAWN_SPEED = 1000;

const createScene = async (engine: Engine) => {
	const havokInstance = await HavokPhysics();
	const havok = new HavokPlugin(true, havokInstance);
	const scene = new Scene(engine);
	const light = new HemisphericLight("light", new Vector3(0, 0, 1));

	createTimer({
		scene,
		timeout: SPAWN_SPEED,
		callback: () => {
			const x = Math.random() * SPAWN_DISTANCE * 2 - SPAWN_DISTANCE;
			const y =
				Math.sqrt(Math.pow(SPAWN_DISTANCE, 2) - Math.pow(x, 2)) * (Math.random() < 0.5 ? -1 : 1);

			createEnemy({
				scene,
				position: player.position.add(new Vector3(x, 0, y)),
				target: player.position,
			});
		},
	});

	light.intensity = Math.PI;
	scene.clearColor = new Color4(0, 0, 0);
	scene.enablePhysics(Vector3.Zero(), havok);

	const player = createPlayer({ scene });

	engine.runRenderLoop(() => {
		if (!game.state.running) {
			return;
		}

		scene.render();
	});

	return scene;
};

export const createGame = async (canvas: HTMLCanvasElement) => {
	untrack(() => game.state.dispose?.());
	game.reset();
	player.reset();

	const engine = new Engine(canvas, undefined, undefined, true);
	const scene = await createScene(engine);
	await getManager(scene);

	let removeKeyDownListener: (() => void) | undefined;
	const resize = () => engine.resize();

	if (dev) {
		const { Inspector } = await import("@babylonjs/inspector");

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key.toUpperCase() === "Ñ") {
				if (Inspector.IsVisible) {
					Inspector.Hide();
				} else {
					Inspector.Show(scene, { embedMode: true, overlay: true });
				}
			}

			if (event.key.toUpperCase() === "P") {
				game.state.running = !game.state.running;
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		removeKeyDownListener = () => window.removeEventListener("keydown", handleKeyDown);
	}

	if (Engine.audioEngine) {
		Engine.audioEngine.useCustomUnlockedButton = true;

		window.addEventListener(
			"click",
			() => {
				if (Engine.audioEngine && !Engine.audioEngine.unlocked) {
					Engine.audioEngine.unlock();
				}
			},
			{ once: true },
		);
	}

	window.addEventListener("resize", resize);

	const dispose = () => {
		engine.dispose();
		window.removeEventListener("resize", resize);

		if (removeKeyDownListener) {
			removeKeyDownListener();
		}
	};

	if (!game.state.mounted) {
		dispose();
	} else {
		game.state.dispose = dispose;
	}
};
