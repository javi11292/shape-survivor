<script lang="ts">
	import { upgrades } from "$lib/constants/upgrades";
	import { Icon } from "$lib/core/components/icon";
	import { Modal } from "$lib/core/components/modal";
	import { game } from "$lib/state/game";
	import { player } from "$lib/state/player";

	const remainingUpgrades = [...upgrades];

	type Upgrade = (typeof remainingUpgrades)[number];

	const selectRandom = () => {
		const index = Math.floor(Math.random() * remainingUpgrades.length);

		return remainingUpgrades.splice(index, 1)[0] as Upgrade;
	};

	const randomUpgrades = [selectRandom(), selectRandom(), selectRandom()];

	const handleClick = (upgrade: Upgrade) => () => {
		player.state.upgrades[upgrade.key] = (player.state.upgrades[upgrade.key] ?? 0) + 1;
		game.state.levelup = false;
		game.state.running = true;
	};
</script>

<div class="modal">
	<Modal open>
		<div class="levelUp">
			{#each randomUpgrades as upgrade}
				{@const playerUpgrade = player.state.upgrades[upgrade.key] || 0}
				<div class="card" onclick={handleClick(upgrade)} role="none">
					<div class="title">{upgrade.name}</div>

					{#if "description" in upgrade}
						<div>{upgrade.description}</div>
					{/if}

					<div>
						<div class="label">{"label" in upgrade ? upgrade.label : upgrade.name}</div>
						<div class="difference">
							<span>{upgrade.format(upgrade.amount(playerUpgrade))}</span>
							<Icon icon="arrow-right" />
							<span class="nextValue">{upgrade.format(upgrade.amount(playerUpgrade + 1))}</span>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</Modal>
</div>

<style>
	@import "./level-up.scss";
</style>
