<script lang="ts">
	import { Modal } from "$lib/core/components/modal";
	import { assets } from "$lib/engine/assets";

	assets.death.play();
</script>

<div class="gameOver">
	<Modal open>
		<div class="content">wasted</div>
	</Modal>
</div>

<style>
	@import "./game-over.scss";
</style>
