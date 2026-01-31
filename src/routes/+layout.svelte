<script lang="ts">
	import './layout.css';
	import ThemeProvider from '$lib/components/theme/ThemeProvider.svelte';

	let { children, data } = $props();
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
</svelte:head>

<ThemeProvider>
	<div class="min-h-screen bg-zinc-50 dark:bg-zinc-925 text-zinc-900 dark:text-zinc-100 font-sans antialiased">
		{@render children()}
	</div>
</ThemeProvider>
