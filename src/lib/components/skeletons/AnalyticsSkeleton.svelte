<div class="max-w-6xl mx-auto space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="space-y-2">
            <div class="h-8 w-32 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
            <div class="h-4 w-72 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
        </div>
        <div class="flex items-center gap-3">
            <div class="h-4 w-20 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
            <div class="h-9 w-40 bg-zinc-200 dark:bg-zinc-700 rounded-lg animate-pulse"></div>
        </div>
    </div>

    <!-- Period info banner -->
    <div class="h-10 w-full bg-zinc-200 dark:bg-zinc-700 rounded-lg animate-pulse"></div>

    <!-- Summary Stats -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {#each Array(4) as _}
            <div class="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-500/25">
                <div class="flex items-center gap-3 mb-2">
                    <div class="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-700 animate-pulse"></div>
                    <div class="h-4 w-28 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                </div>
                <div class="h-8 w-32 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
            </div>
        {/each}
    </div>

    <!-- Charts -->
    <div class="grid lg:grid-cols-2 gap-6">
        {#each Array(2) as _}
            <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-500/25">
                <!-- Chart header -->
                <div class="p-5 border-b border-zinc-500/25 flex items-center gap-3">
                    <div class="w-9 h-9 rounded-lg bg-zinc-200 dark:bg-zinc-700 animate-pulse"></div>
                    <div class="space-y-1.5">
                        <div class="h-5 w-36 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                        <div class="h-3 w-24 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                    </div>
                </div>
                <!-- Canvas area -->
                <div class="p-5">
                    <div class="h-72 w-full bg-zinc-200 dark:bg-zinc-700 rounded-lg animate-pulse"></div>
                </div>
            </div>
        {/each}
    </div>

    <!-- Detailed Table -->
    <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-500/25 overflow-hidden">
        <!-- Table card header -->
        <div class="p-5 border-b border-zinc-500/25 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-zinc-200 dark:bg-zinc-700 animate-pulse"></div>
            <div class="space-y-1.5">
                <div class="h-5 w-44 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                <div class="h-3 w-52 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
            </div>
        </div>
        <!-- Column headers -->
        <div class="grid grid-cols-5 border-b border-zinc-500/25 px-5 py-3 gap-4">
            <div class="h-4 w-12 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
            <div class="h-4 w-16 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
            <div class="h-4 w-10 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse ml-auto"></div>
            <div class="h-4 w-14 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse ml-auto"></div>
            <div class="h-4 w-16 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse ml-auto"></div>
        </div>
        <!-- 6 data rows -->
        {#each Array(6) as _}
            <div class="grid grid-cols-5 px-5 h-16 items-center border-b border-zinc-500/15 gap-4">
                <div class="h-4 w-14 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-700 animate-pulse shrink-0"></div>
                    <div class="space-y-1">
                        <div class="h-3.5 w-20 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                        <div class="h-3 w-14 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                    </div>
                </div>
                <div class="h-4 w-10 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse ml-auto"></div>
                <div class="h-4 w-16 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse ml-auto"></div>
                <div class="h-4 w-14 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse ml-auto"></div>
            </div>
        {/each}
    </div>
</div>
