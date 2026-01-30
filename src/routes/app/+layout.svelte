<script>
    import { page } from '$app/stores';
    import { goto, invalidateAll } from '$app/navigation';
    import { 
        Briefcase, 
        Clock, 
        Calendar, 
        TrendingUp, 
        Building2,
        LogOut,
        Menu,
        X,
        ChevronRight
    } from 'lucide-svelte';

    let { children, data } = $props();

    let isSidebarOpen = $state(false);

    const navigation = [
        { name: 'Timeline', href: '/app/timeline', icon: Clock },
        { name: 'Workspace', href: '/app/workspace', icon: Calendar },
        { name: 'Analytics', href: '/app/analytics', icon: TrendingUp },
        { name: 'Companies', href: '/app/companies', icon: Building2 }
    ];

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

<div class="min-h-screen flex">
    <!-- Mobile sidebar backdrop -->
    {#if isSidebarOpen}
        <button
            type="button"
            class="lg:hidden fixed inset-0 bg-black/50 z-40"
            onclick={() => isSidebarOpen = false}
            aria-label="Close sidebar"
        ></button>
    {/if}

    <!-- Sidebar -->
    <aside class="
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800
        transform transition-transform duration-200 ease-in-out
        {isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    ">
        <div class="flex flex-col h-full">
            <!-- Logo -->
            <div class="flex items-center gap-3 px-6 h-16 border-b border-zinc-200 dark:border-zinc-800">
                <div class="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
                    <Briefcase class="w-4 h-4 text-white dark:text-zinc-900" />
                </div>
                <span class="text-xl font-bold">Shift</span>
            </div>

            <!-- Navigation -->
            <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {#each navigation as item}
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

            <!-- User section -->
            <div class="px-4 py-4 border-t border-zinc-200 dark:border-zinc-800">
                <div class="flex items-center gap-3 px-3 py-2 mb-2">
                    <div class="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-sm font-medium">
                        {data.user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium truncate">{data.user?.email || 'User'}</p>
                    </div>
                </div>
                <button
                    onclick={handleLogout}
                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                    <LogOut class="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col min-w-0">
        <!-- Mobile header -->
        <header class="lg:hidden sticky top-0 z-30 flex items-center gap-4 px-4 h-16 bg-zinc-50 dark:bg-zinc-925 border-b border-zinc-200 dark:border-zinc-800">
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
        </header>

        <!-- Page content -->
        <main class="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {@render children()}
        </main>
    </div>
</div>
