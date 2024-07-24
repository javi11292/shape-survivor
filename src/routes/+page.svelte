<script lang="ts">
	import { dev } from "$app/environment";
	import { Color4, Engine, HavokPlugin, HemisphericLight, Scene, Vector3 } from "$lib/engine";
	import { Enemy } from "$lib/entities/enemy";
	import { Player } from "$lib/entities/player";
	import HavokPhysics from "@babylonjs/havok";

	let canvas = $state<HTMLCanvasElement>();
	let paused = false;

	const SPAWN_DISTANCE = 40;
	const SPAWN_SPEED = 1;

	const createScene = async (engine: Engine) => {
		const havokInstance = await HavokPhysics();
		const havok = new HavokPlugin(true, havokInstance);
		const scene = new Scene(engine);
		const light = new HemisphericLight("light", new Vector3(0, 0, 1));

		let lastSpawn = 0;

		light.intensity = Math.PI;
		scene.clearColor = new Color4(0, 0, 0);
		scene.enablePhysics(Vector3.Zero(), havok);

		const player = new Player(scene);

		scene.registerBeforeRender(() => {
			const delta = engine.getDeltaTime() / 1000;

			lastSpawn += delta;

			if (lastSpawn >= SPAWN_SPEED) {
				const x = Math.random() * SPAWN_DISTANCE * 2 - SPAWN_DISTANCE;
				const y =
					Math.sqrt(Math.pow(SPAWN_DISTANCE, 2) - Math.pow(x, 2)) * (Math.random() < 0.5 ? -1 : 1);

				new Enemy(scene, {
					position: player.position.add(new Vector3(x, 0, y)),
					target: player.position,
				});

				lastSpawn -= SPAWN_SPEED;
			}
		});

		engine.runRenderLoop(() => {
			if (paused) {
				return;
			}

			scene.render();
		});

		return scene;
	};

	$effect(() => {
		let cleanup: (() => void) | undefined;

		const render = async () => {
			if (!canvas) return;

			const engine = new Engine(canvas, true);
			const scene = await createScene(engine);

			const resize = () => engine.resize();
			let inspector: (event: KeyboardEvent) => void;

			if (dev) {
				const { Inspector } = await import("@babylonjs/inspector");

				inspector = (event) => {
					if (event.key.toUpperCase() === "Ñ") {
						if (Inspector.IsVisible) {
							Inspector.Hide();
							paused = false;
						} else {
							Inspector.Show(scene, { embedMode: true, overlay: true });
							paused = true;
						}
					}
				};

				window.addEventListener("keydown", inspector);
			}

			window.addEventListener("resize", resize);

			cleanup = () => {
				engine.dispose();
				window.removeEventListener("resize", resize);

				if (dev) {
					window.removeEventListener("keydown", inspector);
				}
			};
		};

		render();

		return () => cleanup?.();
	});
</script>

<main>
	<canvas bind:this={canvas}></canvas>
</main>

<style>
	@import "./+page.scss";
</style>
