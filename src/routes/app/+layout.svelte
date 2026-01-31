<script>
    import { page } from '$app/stores';
    import { goto, invalidateAll } from '$app/navigation';
    import { 
        Briefcase, 
        Clock, 
        Calendar, 
        TrendingUp, 
        Building2,
        Settings,
        LogOut,
        Menu,
        User,
        ChevronRight
    } from 'lucide-svelte';
    import ThemeToggle from '$lib/components/theme/ThemeToggle.svelte';

    let { children, data } = $props();

    let isSidebarOpen = $state(false);

    // Main navigation items
    const mainNavigation = [
        { name: 'Timeline', href: '/app/timeline', icon: Clock },
        { name: 'Workspace', href: '/app/workspace', icon: Calendar },
        { name: 'Analytics', href: '/app/analytics', icon: TrendingUp },
        { name: 'Companies', href: '/app/companies', icon: Building2 }
    ];

    /** @param {string} href */
    function isActive(href) {
        return $page.url.pathname.startsWith(href);
    }

    async function handleLogout() {
        await fetch('/api/auth/logout', { method: 'POST' });
        await invalidateAll();
        goto('/');
    }

    $effect(() => {
        // Close sidebar on navigation
        $page.url.pathname;
        isSidebarOpen = false;
    });
</script>

<div class="h-screen flex overflow-hidden">
    <!-- Mobile sidebar backdrop -->
    {#if isSidebarOpen}
        <button
            type="button"
            class="lg:hidden fixed inset-0 bg-black/50 z-40"
            onclick={() => isSidebarOpen = false}
            aria-label="Close sidebar"
        ></button>
    {/if}

    <!-- Sidebar - Always fixed to viewport -->
    <aside class="
        fixed inset-y-0 left-0 z-50
        w-64 h-screen bg-white dark:bg-zinc-900 border-r border-zinc-500/25
        transform transition-transform duration-200 ease-in-out
        {isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    ">
        <div class="flex flex-col h-full">
            <!-- Logo -->
            <div class="flex items-center gap-3 px-6 h-16 border-b border-zinc-500/25 shrink-0">
                <div class="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
                    <img src="/logo.png" alt="Shift" class="w-full h-full object-cover" />
                </div>
                <span class="text-xl font-bold">Shift</span>
            </div>

            <!-- Main Navigation -->
            <nav class="px-4 py-6 space-y-1 shrink-0">
                <p class="px-3 mb-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Menu</p>
                {#each mainNavigation as item}
                    <a
                        href={item.href}
                        class="
                            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                            {isActive(item.href) 
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' 
                                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'}
                        "
                    >
                        <item.icon class="w-5 h-5" />
                        {item.name}
                        {#if isActive(item.href)}
                            <ChevronRight class="w-4 h-4 ml-auto" />
                        {/if}
                    </a>
                {/each}
            </nav>

            <!-- Spacer -->
            <div class="flex-1"></div>

            <!-- Bottom Section -->
            <div class="border-t border-zinc-500/25 shrink-0">
                <!-- Settings -->
                <div class="px-4 py-4">
                    <p class="px-3 mb-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Preferences</p>
                    <a
                        href="/app/settings"
                        class="
                            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                            {isActive('/app/settings') 
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' 
                                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'}
                        "
                    >
                        <Settings class="w-5 h-5" />
                        Settings
                        {#if isActive('/app/settings')}
                            <ChevronRight class="w-4 h-4 ml-auto" />
                        {/if}
                    </a>
                </div>

                <!-- User Section -->
                <div class="px-4 py-4 border-t border-zinc-500/25 bg-zinc-50 dark:bg-zinc-800/30">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                            <User class="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium truncate">{data.user?.email || 'User'}</p>
                            <p class="text-xs text-zinc-500 truncate">Signed in</p>
                        </div>
                        <ThemeToggle />
                    </div>
                    <button
                        onclick={handleLogout}
                        class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-800 border border-zinc-500/25 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                        <LogOut class="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    </aside>

    <!-- Main content wrapper - offset by sidebar width on desktop -->
    <div class="flex-1 flex flex-col min-w-0 lg:ml-64 h-screen">
        <!-- Mobile header -->
        <header class="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-16 bg-zinc-50 dark:bg-zinc-925 border-b border-zinc-500/25 shrink-0">
            <div class="flex items-center gap-4">
                <button
                    type="button"
                    onclick={() => isSidebarOpen = true}
                    class="p-2 -ml-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    aria-label="Open sidebar"
                >
                    <Menu class="w-5 h-5" />
                </button>
                <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
                        <Briefcase class="w-3 h-3 text-white dark:text-zinc-900" />
                    </div>
                    <span class="font-semibold">Shift</span>
                </div>
            </div>
            <ThemeToggle />
        </header>

        <!-- Page content - scrollable -->
        <main class="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {@render children()}
        </main>
    </div>
</div>
