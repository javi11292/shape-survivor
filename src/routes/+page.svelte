<script lang="ts">
	import { createGame } from "$lib/engine/game";
	import { game } from "$lib/state/game";
	import { player } from "$lib/state/player";

	let canvas: HTMLCanvasElement | undefined;

	$effect(() => {
		if (!canvas) {
			return;
		}

		game.reset();

		createGame(canvas);

		return () => {
			game.value.mounted = false;
			game.value.dispose?.();
		};
	});
</script>

<main>
	<canvas bind:this={canvas}></canvas>
	<div class="ui">
		<div class="experience" style="--width:{player.value.experience / player.value.toNextLevel}">
			<div class="experienceBar"></div>
			<div class="level">{player.value.level}</div>
		</div>
	</div>
</main>

<style>
	@import "./+page.scss";
</style>
