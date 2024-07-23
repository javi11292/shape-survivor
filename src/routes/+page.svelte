<script lang="ts">
	import { dev } from "$app/environment";
	import { Color4, Engine, HemisphericLight, Scene, Vector3 } from "$lib/engine";
	import { Enemy } from "$lib/entities/enemy";
	import { Player } from "$lib/entities/player";

	let canvas = $state<HTMLCanvasElement>();

	const SPAWN_DISTANCE = 40;
	const SPAWN_SPEED = 1;

	const createScene = (engine: Engine) => {
		const scene = new Scene(engine);
		const player = new Player(scene);
		const light = new HemisphericLight("light", new Vector3(0, 0, 1));
		let lastSpawn = 0;

		light.intensity = Math.PI;
		scene.clearColor = new Color4(0, 0, 0);

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
			scene.render();
		});

		return scene;
	};

	$effect(() => {
		const render = () => {
			if (!canvas) return;

			const engine = new Engine(canvas, true);
			const scene = createScene(engine);

			const resize = () => engine.resize();
			let inspector: (event: KeyboardEvent) => void;

			if (dev) {
				import("@babylonjs/inspector").then(({ Inspector }) => {
					inspector = (event) => {
						if (event.key.toUpperCase() === "Ñ") {
							if (Inspector.IsVisible) {
								Inspector.Hide();
							} else {
								Inspector.Show(scene, { embedMode: true, overlay: true });
							}
						}
					};

					window.addEventListener("keydown", inspector);
				});
			}

			window.addEventListener("resize", resize);

			return () => {
				engine.dispose();
				window.removeEventListener("resize", resize);

				if (dev) {
					window.removeEventListener("keydown", inspector);
				}
			};
		};

		return render();
	});
</script>

<main>
	<canvas bind:this={canvas}></canvas>
</main>

<style>
	@import "./+page.scss";
</style>
