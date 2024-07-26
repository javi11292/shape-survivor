<script lang="ts">
	import { createGame } from "$lib/engine/game";
	import { player } from "$lib/state/player";

	let canvas = $state<HTMLCanvasElement>();

	const game: { mounted: boolean; dispose?: () => void } = {
		mounted: true,
	};

	$effect(() => {
		if (!canvas) {
			return;
		}

		createGame(canvas, game);

		return () => {
			game.mounted = false;
			game.dispose?.();
		};
	});
</script>

<main>
	<canvas bind:this={canvas}></canvas>
	<div class="ui">
		<div class="experience" style="--width:{player.value.experience / 100}"></div>
	</div>
</main>

<style>
	@import "./+page.scss";
</style>
