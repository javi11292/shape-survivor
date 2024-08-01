<script lang="ts" context="module">
	let eligibleUpgrades = $state(new Set<string>());
	let eligibleWeapons = $state(new Set<string>());
</script>

<script lang="ts">
	import { upgrades, weapons } from "$lib/constants/upgrades";
	import { Icon } from "$lib/core/components/icon";
	import { Modal } from "$lib/core/components/modal";
	import { game } from "$lib/state/game";
	import { player } from "$lib/state/player";

	type UpgradeKey = keyof typeof upgrades;
	type WeaponKey = keyof typeof weapons;

	if (player.level === 2) {
		eligibleUpgrades = new Set(Object.keys(upgrades));
		eligibleWeapons = new Set(Object.keys(weapons));
	}

	const upgradeKeys = [...eligibleUpgrades];
	const weaponKeys = [...eligibleWeapons];

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

	const cards = [selectRandom(), selectRandom(), selectRandom()].filter(Boolean);

	const handleClick =
		(items: Record<string, number | undefined>, key: string, eligible: Set<string>) => () => {
			items[key] = (items[key] || 0) + 1;

			if (items[key] === 5) {
				eligible.delete(key);
			}

			game.levelup = false;
		};

	if (cards.length === 0) {
		game.levelup = false;
		player.hp = player.maxHp;
	}
</script>

<div class="modal">
	<Modal open preventCancel>
		<div class="levelUp">
			{#each cards as card}
				{#if card}
					{@const { key, weapon, upgrade } = card}
					{@const items: Record<string, number | undefined> = weapon ? player.weapons : player.upgrades}
					{@const level = items[key] || 0}
					<div
						class="card"
						class:weapon
						onclick={handleClick(items, key, weapon ? eligibleWeapons : eligibleUpgrades)}
						role="none"
					>
						<div class="level">
							{#if !level}
								NEW
							{:else}
								Lv.{level + 1}
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
									{@const current = stat.amount(level)}
									{@const next = stat.amount(level + 1)}
									{#if current !== next}
										<div class="label">{stat.label}</div>

										<div class="difference">
											<span>{stat.format(current)}</span>
											<Icon icon="arrow-right" />
											<span class="nextValue">{stat.format(next)}</span>
										</div>
									{/if}
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
