<script lang="ts">
	import { Button } from "$lib/core/components/button";
	import { createGame } from "$lib/engine/game";
	import { game } from "$lib/state/game";
	import { player } from "$lib/state/player";

	let canvas: HTMLCanvasElement | undefined;
	let started = $state(false);

	$effect(() => {
		if (!canvas || !started) {
			return;
		}

		game.reset();

		createGame(canvas);
		canvas.focus();

		return () => {
			game.state.mounted = false;
			game.state.dispose?.();
		};
	});
</script>

<main>
	<canvas tabindex="0" bind:this={canvas}></canvas>

	<div class="ui">
		{#if started}
			<div class="experience" style="--width:{player.state.experience / player.state.toNextLevel}">
				<div class="experienceBar"></div>
				<div class="level">{player.state.level}</div>
			</div>
		{:else}
			<div class="start">
				<Button onclick={() => (started = true)}>Empezar</Button>
			</div>
		{/if}
	</div>
</main>

<style>
	@import "./+page.scss";
</style>
