<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

{#if import.meta.env.VITE_ENTERPRISE_MODE}
	<h1 class="text-2xl font-bold">Compliance Center (Enterprise)</h1>
	<p class="mt-4">This is a placeholder page for the Compliance Center.</p>
	{#if data && data.status}
		<pre class="mt-4">{JSON.stringify(data.status, null, 2)}</pre>
	{/if}
{:else}
	<div class="text-center">
		<h1 class="text-2xl font-bold">Access Denied</h1>
		<p class="mt-4">This feature is only available in the Enterprise Edition.</p>
	</div>
{/if}
