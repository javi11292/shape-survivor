<script lang="ts">
	type Props = {
		position: { x: number; y: number };
		damage: number;
		fromEnemy?: boolean;
	};

	let { position, damage, fromEnemy }: Props = $props();
</script>

<div class="container" style="--x:{position.x}px; --y:{position.y}px">
	<div class="content">
		<div class="damage" class:fromEnemy>{damage}</div>
	</div>
</div>

<style>
	@import "./damage.scss";
</style>
