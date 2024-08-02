<script lang="ts">
	import { UI, type Position } from "../ui";

	type Props = {
		damage: number;
		fromEnemy?: boolean;
	} & Position;

	let { damage, fromEnemy, position }: Props = $props();
</script>

<UI {position}>
	<div class="damage" class:fromEnemy>{damage}</div>
</UI>

<style>
	@import "./damage.scss";
</style>
