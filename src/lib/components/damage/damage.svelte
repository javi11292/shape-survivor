<script lang="ts">
	type Props = {
		position: { x: number; y: number };
	};
	let { position }: Props = $props();
</script>

<div class="damage" style="--x:{position.x}px; --y:{position.y}px">DAMAGE</div>

<style>
	@import "./damage.scss";
</style>
