<script lang="ts">
	import { upgrades } from "$lib/constants/upgrades";
	import { Icon } from "$lib/core/components/icon";
	import { Modal } from "$lib/core/components/modal";

	let {
		levelup = $bindable(),
		playerUpgrades = $bindable(),
	}: { levelup: boolean; playerUpgrades: Record<Key, number> } = $props();

	type Key = keyof typeof upgrades;

	const upgradeKeys = Object.keys(upgrades) as Key[];

	const selectRandom = () => {
		const index = Math.floor(Math.random() * upgradeKeys.length);

		return upgradeKeys.splice(index, 1)[0]!;
	};

	const randomUpgrades = [selectRandom(), selectRandom(), selectRandom()];

	const handleClick = (key: Key) => () => {
		playerUpgrades[key] = playerUpgrades[key] + 1;
		levelup = false;
	};
</script>

<div class="modal">
	<Modal open>
		<div class="levelUp">
			{#each randomUpgrades as key}
				{@const upgrade = upgrades[key]}
				{@const playerUpgrade = playerUpgrades[key]}
				<div class="card" onclick={handleClick(key)} role="none">
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
