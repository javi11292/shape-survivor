<script lang="ts">
	import { dev } from "$app/environment";
	import { Color4, Engine, HemisphericLight, Scene, Vector3 } from "$lib/engine";
	import { Enemy } from "$lib/entities/enemy";
	import { Player } from "$lib/entities/player";

	let canvas = $state<HTMLCanvasElement>();

	const SPAWN_DISTANCE = 50;
	const SPAWN_SPEED = 1000;

	const createScene = (engine: Engine) => {
		const scene = new Scene(engine);
		const player = new Player(scene);
		const light = new HemisphericLight("light", new Vector3(0, 0, 1));

		light.intensity = Math.PI;
		scene.clearColor = new Color4(0, 0, 0);

		engine.runRenderLoop(() => {
			scene.render();
		});

		setInterval(() => {
			const x = Math.random() * SPAWN_DISTANCE * 2 - SPAWN_DISTANCE;
			const y =
				Math.sqrt(Math.pow(SPAWN_DISTANCE, 2) - Math.pow(x, 2)) * (Math.random() < 0.5 ? -1 : 1);

			new Enemy(scene, {
				position: player.position.add(new Vector3(x, 0, y)),
				target: player.position,
			});
		}, SPAWN_SPEED);

		return scene;
	};

	$effect(() => {
		const render = async () => {
			if (!canvas) return;

			const engine = new Engine(canvas, true);
			const scene = createScene(engine);

			if (dev) {
				const { Inspector } = await import("@babylonjs/inspector");

				window.addEventListener("keydown", (event) => {
					if (event.key.toUpperCase() === "Ñ") {
						if (Inspector.IsVisible) {
							Inspector.Hide();
						} else {
							Inspector.Show(scene, { embedMode: true, overlay: true });
						}
					}
				});
			}

			window.addEventListener("resize", () => {
				engine.resize();
			});
		};

		render();
	});
</script>

<main>
	<canvas bind:this={canvas}></canvas>
</main>

<style>
	@import "./+page.scss";
</style>
