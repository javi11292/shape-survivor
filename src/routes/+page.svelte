<script lang="ts">
	import { dev } from "$app/environment";
	import { Color4, Engine, HemisphericLight, Scene, Vector3 } from "$lib/engine";
	import { Enemy } from "$lib/entities/enemy";
	import { Player } from "$lib/entities/player";

	let canvas = $state<HTMLCanvasElement>();

	const createScene = (engine: Engine) => {
		const scene = new Scene(engine);
		new Player(scene);
		new Enemy(scene);
		const light = new HemisphericLight("light", new Vector3(0, 0, 1));

		light.intensity = Math.PI;
		scene.clearColor = new Color4(0, 0, 0);

		engine.runRenderLoop(() => {
			scene.render();
		});

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
