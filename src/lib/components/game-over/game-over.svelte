<script lang="ts">
	import { weapons, type Weapon } from "$lib/constants/upgrades";
	import { Button } from "$lib/core/components/button";
	import { Modal } from "$lib/core/components/modal";
	import { assets } from "$lib/engine/assets";
	import { player } from "$lib/state/player";
	import { getTime } from "$lib/utils";

	let { restart }: { restart: () => void } = $props();

	assets.death.play();
</script>

<div class="modal">
	<Modal open preventCancel>
		<div class="content">
			<span class="title">wasted</span>

			<div class="card">
				<div class="row">
					Tiempo
					<span class="green">
						{getTime()}
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
					<span class="green">
						{Math.round(Object.values(player.damageDone).reduce((acc, damage) => acc + damage, 0))}
					</span>
				</div>

				{#each Object.entries(player.damageDone) as [weapon, damage]}
					<div class="row subRow">
						{weapons[weapon as Weapon].name}
						<span class="green">{damage}</span>
					</div>
				{/each}

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
