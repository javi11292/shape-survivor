<script lang="ts">
	import { UI, type Position } from "../ui";

	type Props = {
		hp: number;
		state: { hp: number };
	} & Position;

	let { state, hp, position }: Props = $props();
</script>

<UI {position}>
	<div class="bar" style="--width:{state.hp / hp}"></div>
</UI>

<style>
	@import "./hp-bar.scss";
</style>
