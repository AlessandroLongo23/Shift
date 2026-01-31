<script>
	import { Sun, Moon } from 'lucide-svelte';
	import { themeStore } from '$lib/components/theme/theme.js';

	const toggleTheme = () => {
		const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
		themeStore.setTheme(newTheme);
	}
</script>

<button 
	class="
		relative flex items-center justify-center p-2
		bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 
		border border-zinc-500/25
		rounded-xl transition-all duration-100 ease-in-out cursor-pointer
	"
	onclick={toggleTheme}
	aria-label="Toggle theme"
>
	<div class="relative size-5 flex items-center justify-center">
		<Sun class="absolute size-5 rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0 text-zinc-700 dark:text-zinc-300" />
		<Moon class="absolute size-5 rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100 text-zinc-700 dark:text-zinc-300" />
	</div>
</button>
