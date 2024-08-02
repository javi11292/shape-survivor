<script lang="ts">
	import type { Snippet } from "svelte";

	type Props = {
		position: { x: number; y: number };
		children: Snippet;
	};

	let { position, children }: Props = $props();
</script>

<div class="container" style="--x:{position.x}px; --y:{position.y}px">
	<div class="content">
		{@render children()}
	</div>
</div>

<style>
	@import "./ui.scss";
</style>
