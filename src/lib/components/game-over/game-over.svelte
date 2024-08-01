<script lang="ts">
	import { Button } from "$lib/core/components/button";
	import { Modal } from "$lib/core/components/modal";
	import { assets } from "$lib/engine/assets";
	import { player } from "$lib/state/player";

	let { restart }: { restart: () => void } = $props();

	assets.death.play();

	const duration = player.time / 1000;
</script>

<div class="modal">
	<Modal open preventCancel>
		<div class="content">
			<span class="title">wasted</span>

			<div class="card">
				<div class="row">
					Tiempo
					<span class="green">
						{Math.floor(duration / 60)}:{Math.round(duration % 60)
							.toString()
							.padStart(2, "0")}
					</span>
				</div>
				<div class="row">
					Nivel
					<span class="green">{player.level}</span>
				</div>
				<div class="row">
					Enemigos eliminados
					<span class="green">{player.defeatedEnemies}</span>
				</div>
				<div class="row">
					Daño realizado
					<span class="green">{Math.round(player.damageDone)}</span>
				</div>
				<div class="row">
					Daño recibido
					<span class="red">{Math.round(player.damageTaken)}</span>
				</div>
			</div>

			<Button onclick={restart}>Reiniciar</Button>
		</div>
	</Modal>
</div>

<style>
	@import "./game-over.scss";
</style>
