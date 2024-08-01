<script lang="ts">
	import { GameOver } from "$lib/components/game-over";
	import { LevelUp } from "$lib/components/level-up";
	import { upgrades } from "$lib/constants/upgrades";
	import { Button } from "$lib/core/components/button";
	import { createGame } from "$lib/engine/game";
	import { game, resetGame } from "$lib/state/game";
	import { player, resetPlayer } from "$lib/state/player";
	import { getTime } from "$lib/utils";
	import { untrack } from "svelte";

	let canvas: HTMLCanvasElement;
	let started = $state(false);
	let stopAfterDeathTimeout: ReturnType<typeof setTimeout> | undefined;

	resetGame();
	resetPlayer();

	$effect(() => {
		if (game.wasted) {
			stopAfterDeathTimeout = setTimeout(() => {
				game.running = false;
			}, 3000);
		}
	});

	$effect(() => {
		if (!started) {
			return;
		}

		startGame();

		return () => {
			game.mounted = false;
			game.dispose?.();
		};
	});

	$effect(() => {
		if (started && game.running) {
			canvas.focus();
		}
	});

	$effect(() => {
		game.running = !game.levelup;
	});

	$effect(() => {
		const diff = untrack(() => player.maxHp - player.hp);
		player.maxHp = upgrades.hp.amount(player.upgrades.hp);
		player.hp = player.maxHp - diff;
	});

	const startGame = () => {
		clearTimeout(stopAfterDeathTimeout);
		createGame(canvas);
	};
</script>

<main>
	<canvas tabindex="0" bind:this={canvas}></canvas>

	<div class="ui">
		{#if started}
			<div class="time">{getTime()}</div>

			<div class="bars">
				<div class="bar hp" style="--width:{player.hp / player.maxHp}">
					<div>{Math.round(player.hp)} / {player.maxHp}</div>
				</div>

				<div class="bar experience" style="--width:{player.experience / player.toNextLevel}">
					<div>{player.experience} / {player.toNextLevel}</div>
				</div>
				<div class="level">{player.level}</div>
			</div>

			{#if !game.running && !game.levelup && !game.wasted}
				<div class="backdrop">
					<div class="paused">Paused</div>
				</div>
			{/if}
		{:else}
			<div class="start">
				<Button onclick={() => (started = true)}>Empezar</Button>
			</div>
		{/if}

		{#if game.levelup}
			<LevelUp />
		{/if}

		{#if game.wasted}
			<GameOver restart={startGame} />
		{/if}
	</div>
</main>

<style>
	@import "./+page.scss";
</style>
