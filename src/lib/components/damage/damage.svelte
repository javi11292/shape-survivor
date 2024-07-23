<script lang="ts">
	type Props = {
		position: { x: number; y: number };
		damage: number;
	};

	let { position, damage }: Props = $props();
</script>

<div class="container" style="--x:{position.x}px; --y:{position.y}px">
	<div class="content">
		<div class="damage">{damage}</div>
	</div>
</div>

<style>
	@import "./damage.scss";
</style>
