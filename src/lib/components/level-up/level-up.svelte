<script lang="ts">
	import { upgrades, weapons } from "$lib/constants/upgrades";
	import { Icon } from "$lib/core/components/icon";
	import { Modal } from "$lib/core/components/modal";
	import type { player } from "$lib/state/player";

	type UpgradeKey = keyof typeof upgrades;
	type WeaponKey = keyof typeof weapons;

	type Props = {
		levelup: boolean;
		playerUpgrades: (typeof player)["upgrades"];
		playerWeapons: (typeof player)["weapons"];
	};

	let {
		levelup = $bindable(),
		playerUpgrades = $bindable(),
		playerWeapons = $bindable(),
	}: Props = $props();

	const upgradeKeys = Object.keys(upgrades);
	const weaponKeys = Object.keys(weapons);

	const getKeys = () => {
		if (weaponKeys.length > 0 && upgradeKeys.length > 0) {
			return Math.random() < 0.7 ? upgradeKeys : weaponKeys;
		}

		if (weaponKeys.length > 0) {
			return weaponKeys;
		}

		if (upgradeKeys.length > 0) {
			return upgradeKeys;
		}
	};

	const selectRandom = () => {
		const keys = getKeys();

		if (!keys) {
			return;
		}

		const index = Math.floor(Math.random() * keys.length);
		const key = keys.splice(index, 1)[0]!;

		return {
			key,
			weapon: keys === weaponKeys,
			upgrade: keys === weaponKeys ? weapons[key as WeaponKey] : upgrades[key as UpgradeKey],
		};
	};

	const randomUpgrades = [selectRandom(), selectRandom(), selectRandom()];

	const handleClick = (items: Record<string, number | undefined>, key: string) => () => {
		items[key] = (items[key] || 0) + 1;
		levelup = false;
	};
</script>

<div class="modal">
	<Modal open preventCancel>
		<div class="levelUp">
			{#each randomUpgrades as randomUpgrade}
				{#if randomUpgrade}
					{@const { key, weapon, upgrade } = randomUpgrade}
					{@const items: Record<string, number | undefined> = weapon ? playerWeapons : playerUpgrades}
					{@const level = items[key] || 0}
					<div class="card" class:weapon onclick={handleClick(items, key)} role="none">
						<div class="level">
							{#if !level}
								NEW
							{:else}
								Lv.{level}
							{/if}
						</div>
						<div class="title">{upgrade.name}</div>

						{#if "description" in upgrade && !level}
							<div>{upgrade.description}</div>
						{/if}

						<div>
							{#if "amount" in upgrade}
								<div class="label">{"label" in upgrade ? upgrade.label : upgrade.name}</div>
								<div class="difference">
									<span>{upgrade.format(upgrade.amount(level))}</span>
									<Icon icon="arrow-right" />
									<span class="nextValue">{upgrade.format(upgrade.amount(level + 1))}</span>
								</div>
							{:else if level}
								{@const stats = Object.values(upgrade.stats) as (typeof upgrade.stats)[keyof typeof upgrade.stats][]}
								{#each stats as stat}
									<div class="label">{stat.label}</div>

									<div class="difference">
										<span>{stat.format(stat.amount(level))}</span>
										<Icon icon="arrow-right" />
										<span class="nextValue">{stat.format(stat.amount(level + 1))}</span>
									</div>
								{/each}
							{/if}
						</div>
					</div>
				{/if}
			{/each}
		</div>
	</Modal>
</div>

<style>
	@import "./level-up.scss";
</style>
