<script lang="ts">
	import { createGame } from "$lib/engine/game";

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
</main>

<style>
	@import "./+page.scss";
</style>
