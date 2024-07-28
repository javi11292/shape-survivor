<script lang="ts">
	import { GameOver } from "$lib/components/game-over";
	import { LevelUp } from "$lib/components/level-up";
	import { HP_PER_LEVEL } from "$lib/constants";
	import { upgrades } from "$lib/constants/upgrades";
	import { Button } from "$lib/core/components/button";
	import { createGame } from "$lib/engine/game";
	import { game } from "$lib/state/game";
	import { player } from "$lib/state/player";
	import { untrack } from "svelte";

	let canvas: HTMLCanvasElement;
	let started = $state(false);

	$effect(() => {
		game.reset();
		player.reset();
	});

	$effect(() => {
		if (game.state.wasted) {
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
			game.state.mounted = false;
			game.state.dispose?.();
		};
	});

	$effect(() => {
		if (started && game.state.running) {
			canvas.focus();
		}
	});

	$effect(() => {
		game.state.running = !game.state.levelup;
	});

	$effect(() => {
		const diff = untrack(() => player.state.maxHp - player.state.hp);
		player.state.maxHp = HP_PER_LEVEL * upgrades.hp.amount(player.state.upgrades.hp);
		player.state.hp = player.state.maxHp - diff;
	});
</script>

<main>
	<canvas tabindex="0" bind:this={canvas}></canvas>

	<div class="ui">
		{#if started}
			<div class="bars">
				<div class="bar hp" style="--width:{Math.max(player.state.hp / player.state.maxHp, 0)}">
					<div>{Math.round(player.state.hp)} / {player.state.maxHp}</div>
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

		{#if game.state.levelup}
			<LevelUp bind:levelup={game.state.levelup} bind:playerUpgrades={player.state.upgrades} />
		{/if}

		{#if game.state.wasted}
			<GameOver />
		{/if}
	</div>
</main>

<style>
	@import "./+page.scss";
</style>
