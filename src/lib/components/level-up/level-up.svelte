<script lang="ts">
	import { upgrades, weapons, type Upgrade, type Weapon } from "$lib/constants/upgrades";
	import { Icon } from "$lib/core/components/icon";
	import { Modal } from "$lib/core/components/modal";
	import { game } from "$lib/state/game";
	import { player } from "$lib/state/player";

	const UPGRADE_CHANCE = 0.8;
	const upgradeKeys = [...player.eligibleUpgrades];
	const weaponKeys = [...player.eligibleWeapons];

	const getKeys = (weaponSet: string[], upgradeSet: string[]) => {
		if (weaponSet.length > 0 && upgradeSet.length > 0) {
			return Math.random() < UPGRADE_CHANCE ? upgradeSet : weaponSet;
		}

		if (weaponSet.length > 0) {
			return weaponSet;
		}

		if (upgradeSet.length > 0) {
			return upgradeSet;
		}
	};

	const selectEvolve = () => {
		const evolve = Object.keys(player.weapons).filter((weapon) => {
			if (player.weapons[weapon as Weapon] === 5 && !player.evolved.has(weapon as Weapon)) {
				return true;
			}
		});

		if (evolve.length > 0) {
			const index = Math.floor(Math.random() * evolve.length);
			const key = evolve[index] as Weapon;

			return { key, weapon: true, upgrade: weapons[key], evolve: true };
		}

		return selectRandom(
			Object.keys(player.weapons).filter((weapon) => player.weapons[weapon as Weapon]! < 5),
			Object.keys(player.upgrades).filter((upgrade) => player.upgrades[upgrade as Upgrade]! < 5),
		);
	};

	const selectRandom = (weaponSet = weaponKeys, upgradeSet = upgradeKeys) => {
		const keys = getKeys(weaponSet, upgradeSet);

		if (!keys) {
			return;
		}

		const index = Math.floor(Math.random() * keys.length);
		const key = keys.splice(index, 1)[0]!;

		return {
			key,
			weapon: keys === weaponSet,
			upgrade: keys === weaponSet ? weapons[key as Weapon] : upgrades[key as Upgrade],
			evolve: false,
		};
	};

	const cards = $derived(
		game.upgrade
			? [selectEvolve()].filter(Boolean)
			: [selectRandom(), selectRandom(), selectRandom()].filter(Boolean),
	);

	const handleClick =
		(
			items: Record<string, number | undefined>,
			key: string,
			eligible: Set<string>,
			evolve: boolean,
		) =>
		() => {
			if (evolve) {
				player.evolved.add(key as Weapon);
			} else {
				items[key] = (items[key] || 0) + 1;

				if (items[key] === 5) {
					eligible.delete(key);
				}
			}

			if (game.upgrade) {
				game.upgrade = false;
			} else {
				game.levelup = false;
			}
		};

	$effect(() => {
		if (cards.length === 0) {
			game.levelup = false;
			game.upgrade = false;
			player.hp = player.maxHp;
		}
	});
</script>

<div class="modal">
	<Modal open preventCancel>
		<div class="levelUp">
			{#each cards as card}
				{#if card}
					{@const { key, weapon, upgrade, evolve } = card}
					{@const items: Record<string, number | undefined> = weapon ? player.weapons : player.upgrades}
					{@const level = items[key] || 0}
					<div
						class="card"
						class:weapon
						onclick={handleClick(
							items,
							key,
							weapon ? player.eligibleWeapons : player.eligibleUpgrades,
							evolve,
						)}
						role="none"
					>
						<div class="level">
							{#if evolve}
								Evolución
							{:else if !level}
								NEW
							{:else}
								Lv.{level + 1}
							{/if}
						</div>

						<div class="title">{upgrade.name}</div>

						{#if "evolve" in upgrade && (!level || evolve)}
							<div>{evolve ? upgrade.evolve : upgrade.description}</div>
						{/if}

						{#if !evolve}
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
						{/if}
					</div>
				{/if}
			{/each}
		</div>
	</Modal>
</div>

<style>
	@import "./level-up.scss";
</style>
