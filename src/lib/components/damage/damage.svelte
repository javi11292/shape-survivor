<script lang="ts">
	type Props = {
		position: { x: number; y: number };
	};

	let { position }: Props = $props();
</script>

<div class="container" style="--x:{position.x}px; --y:{position.y}px">
	<div class="damage">DAMAGE</div>
</div>

<style>
	@import "./damage.scss";
</style>
