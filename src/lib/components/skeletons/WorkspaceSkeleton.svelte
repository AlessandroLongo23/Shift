<div class="max-w-6xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="space-y-2">
            <div class="h-8 w-48 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
            <div class="h-4 w-64 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
        </div>
        <div class="flex items-center gap-3">
            <div class="h-4 w-20 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
            <div class="h-9 w-40 bg-zinc-200 dark:bg-zinc-700 rounded-lg animate-pulse"></div>
        </div>
    </div>

    <!-- Month Navigation -->
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
            <div class="h-9 w-9 bg-zinc-200 dark:bg-zinc-700 rounded-lg animate-pulse"></div>
            <div class="h-9 w-9 bg-zinc-200 dark:bg-zinc-700 rounded-lg animate-pulse"></div>
            <div class="h-9 w-16 bg-zinc-200 dark:bg-zinc-700 rounded-lg animate-pulse"></div>
        </div>
        <div class="h-7 w-36 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
        <!-- Calendar -->
        <div class="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-500/25 overflow-hidden">
            <!-- Weekday headers -->
            <div class="grid grid-cols-7 border-b border-zinc-500/25">
                {#each Array(7) as _}
                    <div class="py-3 flex justify-center">
                        <div class="h-4 w-6 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                    </div>
                {/each}
            </div>

            <!-- Calendar grid: 5 rows × 7 cells -->
            <div class="grid grid-cols-7">
                {#each Array(35) as _, i}
                    <div class="h-20 sm:h-24 p-2 border-r border-b border-zinc-500/15 {(i + 1) % 7 === 0 ? 'border-r-0' : ''}">
                        <div class="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse"></div>
                        {#if i % 3 !== 0}
                            <div class="mt-2 h-3 w-10 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-4">
            <!-- Period Summary card -->
            <div class="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-500/25 space-y-4">
                <div class="h-5 w-1/3 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                <div class="space-y-3">
                    {#each Array(3) as _}
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <div class="w-4 h-4 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse"></div>
                                <div class="h-4 w-20 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                            </div>
                            <div class="h-5 w-10 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                        </div>
                    {/each}
                </div>
            </div>

            <!-- Paychecks card -->
            <div class="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-500/25 space-y-4">
                <div class="flex items-center justify-between">
                    <div class="h-5 w-24 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                    <div class="h-7 w-16 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                </div>
                {#each Array(2) as _}
                    <div class="w-full p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 space-y-2">
                        <div class="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                        <div class="h-6 w-1/2 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                    </div>
                {/each}
            </div>

            <!-- Legend card -->
            <div class="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-500/25">
                <div class="h-4 w-16 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse mb-3"></div>
                <div class="space-y-2">
                    {#each Array(3) as _}
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse"></div>
                            <div class="h-4 w-24 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>
</div>
