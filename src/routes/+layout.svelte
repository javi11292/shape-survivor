<script lang="ts">
	import { dev } from "$app/environment";
	import { Setup } from "$lib/core/components/setup";

	let { children } = $props();
</script>

<Setup />

{@render children()}

{#if !dev}
	<script
		defer
		src="https://static.cloudflareinsights.com/beacon.min.js"
		data-cf-beacon={{ token: "977b2509d4e64d1485799479d7dc4204" }}
	></script>
{/if}
