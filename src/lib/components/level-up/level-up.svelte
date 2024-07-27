<script lang="ts">
	import { upgrades } from "$lib/constants/upgrades";

	const remainingUpgrades = [...upgrades];

	const selectRandom = () => {
		const index = Math.floor(Math.random() * remainingUpgrades.length);

		return remainingUpgrades.splice(index, 1)[0];
	};

	const randomUpgrades = [selectRandom(), selectRandom(), selectRandom()];
</script>

<div class="levelUp"></div>

<style>
	@import "./level-up.scss";
</style>
