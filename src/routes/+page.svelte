<script lang="ts">
	import { GameOver } from "$lib/components/game-over";
	import { Button } from "$lib/core/components/button";
	import { createGame } from "$lib/engine/game";
	import { game } from "$lib/state/game";
	import { player } from "$lib/state/player";

	let canvas: HTMLCanvasElement;
	let started = $state(false);

	$effect(() => {
		if (game.state.wasted) {
			setTimeout(() => {
				game.state.dispose?.();
				createGame(canvas);
			}, 3000);
		}
	});

	$effect(() => {
		if (!started) {
			return;
		}

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
			<div class="bars">
				<div class="bar hp" style="--width:{player.state.hp / player.state.maxHp}">
					<div>{player.state.hp} / {player.state.maxHp}</div>
				</div>

				<div
					class="bar experience"
					style="--width:{player.state.experience / player.state.toNextLevel}"
				>
					<div>{player.state.experience} / {player.state.toNextLevel}</div>
				</div>
				<div class="level">{player.state.level}</div>
			</div>
		{:else}
			<div class="start">
				<Button onclick={() => (started = true)}>Empezar</Button>
			</div>
		{/if}

		{#if game.state.wasted}
			<GameOver />
		{/if}
	</div>
</main>

<style>
	@import "./+page.scss";
</style>
