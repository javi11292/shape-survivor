<script lang="ts">
	import { GameOver } from "$lib/components/game-over";
	import { LevelUp } from "$lib/components/level-up";
	import { HP_PER_LEVEL } from "$lib/constants";
	import { upgrades } from "$lib/constants/upgrades";
	import { Button } from "$lib/core/components/button";
	import { createGame } from "$lib/engine/game";
	import { game, resetGame } from "$lib/state/game";
	import { player, resetPlayer } from "$lib/state/player";
	import { untrack } from "svelte";

	let canvas: HTMLCanvasElement;
	let started = $state(false);

	resetGame();
	resetPlayer();

	$effect(() => {
		if (game.wasted) {
			setTimeout(() => {
				createGame(canvas);
			}, 3000);
		}
	});

	$effect(() => {
		if (!started) {
			return;
		}

		createGame(canvas);

		return () => {
			game.mounted = false;
			game.dispose?.();
		};
	});

	$effect(() => {
		if (started && game.running && game.wasted === false) {
			canvas.focus();
		}
	});

	$effect(() => {
		game.running = !game.levelup;
	});

	$effect(() => {
		const diff = untrack(() => player.maxHp - player.hp);
		player.maxHp = HP_PER_LEVEL * upgrades.hp.amount(player.upgrades.hp);
		player.hp = player.maxHp - diff;
	});
</script>

<main>
	<canvas tabindex="0" bind:this={canvas}></canvas>

	<div class="ui">
		{#if started}
			<div class="bars">
				<div class="bar hp" style="--width:{player.hp / player.maxHp}">
					<div>{Math.round(player.hp)} / {player.maxHp}</div>
				</div>

				<div class="bar experience" style="--width:{player.experience / player.toNextLevel}">
					<div>{player.experience} / {player.toNextLevel}</div>
				</div>
				<div class="level">{player.level}</div>
			</div>
		{:else}
			<div class="start">
				<Button onclick={() => (started = true)}>Empezar</Button>
			</div>
		{/if}

		{#if game.levelup}
			<LevelUp bind:levelup={game.levelup} bind:playerUpgrades={player.upgrades} />
		{/if}

		{#if game.wasted}
			<GameOver />
		{/if}
	</div>
</main>

<style>
	@import "./+page.scss";
</style>
