<script>
    import { onMount } from 'svelte';
    import { positionsStore } from '$lib/stores/positions.svelte.js';
    import { paychecksStore } from '$lib/stores/paychecks.svelte.js';
    import { companiesStore } from '$lib/stores/companies.svelte.js';
    import { formatCurrency, calculateTotalExperience } from '$lib/utils/format.js';
    import { Briefcase, Calendar, Banknote, Building2, Plus, MapPin } from 'lucide-svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import PositionModal from '$lib/components/timeline/PositionModal.svelte';
    import CompanyModal from '$lib/components/timeline/CompanyModal.svelte';

    let isPositionModalOpen = $state(false);
    let isCompanyModalOpen = $state(false);
    let editingPosition = $state(null);

    onMount(() => {
        positionsStore.fetch();
        paychecksStore.fetch();
        companiesStore.fetch();
    });

    let stats = $derived({
        totalExperience: calculateTotalExperience(positionsStore.positions),
        totalEarnings: paychecksStore.totalEarnings,
        currentCompany: positionsStore.currentPosition?.company?.name || 'Not employed'
    });

    function handleAddPosition() {
        editingPosition = null;
        isPositionModalOpen = true;
    }

    function handleEditPosition(position) {
        editingPosition = position;
        isPositionModalOpen = true;
    }
</script>

<svelte:head>
    <title>Career Timeline | Shift</title>
</svelte:head>

<PositionModal 
    bind:isOpen={isPositionModalOpen} 
    position={editingPosition}
    companies={companiesStore.companies}
/>

<CompanyModal bind:isOpen={isCompanyModalOpen} />

<div class="max-w-5xl mx-auto space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold">Career Timeline</h1>
            <p class="text-zinc-600 dark:text-zinc-400">Your professional journey at a glance</p>
        </div>
        <div class="flex gap-2">
            <Button variant="outline" onclick={() => isCompanyModalOpen = true}>
                <Building2 class="w-4 h-4" />
                Add Company
            </Button>
            <Button onclick={handleAddPosition}>
                <Plus class="w-4 h-4" />
                Add Position
            </Button>
        </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid sm:grid-cols-3 gap-4">
        <div class="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Calendar class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span class="text-sm text-zinc-600 dark:text-zinc-400">Experience</span>
            </div>
            <p class="text-2xl font-bold">{stats.totalExperience} years</p>
        </div>

        <div class="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Banknote class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span class="text-sm text-zinc-600 dark:text-zinc-400">Total Earnings</span>
            </div>
            <p class="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</p>
        </div>

        <div class="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Building2 class="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span class="text-sm text-zinc-600 dark:text-zinc-400">Current Company</span>
            </div>
            <p class="text-2xl font-bold truncate">{stats.currentCompany}</p>
        </div>
    </div>

    <!-- Timeline -->
    <div class="space-y-6">
        <h2 class="text-lg font-semibold">Position History</h2>
        
        {#if positionsStore.loading}
            <div class="flex items-center justify-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-100"></div>
            </div>
        {:else if positionsStore.positions.length === 0}
            <div class="text-center py-12 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <Briefcase class="w-12 h-12 mx-auto text-zinc-400 mb-4" />
                <h3 class="text-lg font-medium mb-2">No positions yet</h3>
                <p class="text-zinc-600 dark:text-zinc-400 mb-4">Start by adding your first position</p>
                <Button onclick={handleAddPosition}>
                    <Plus class="w-4 h-4" />
                    Add Position
                </Button>
            </div>
        {:else}
            <div class="relative">
                <!-- Timeline line -->
                <div class="absolute left-6 top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-800"></div>

                <div class="space-y-6">
                    {#each positionsStore.sortedByDate as position}
                        <div class="relative pl-16">
                            <!-- Timeline dot -->
                            <div class="absolute left-4 w-5 h-5 rounded-full border-4 border-zinc-200 dark:border-zinc-800 {position.isCurrent() ? 'bg-emerald-500' : 'bg-zinc-400 dark:bg-zinc-600'}"></div>

                            <button 
                                type="button"
                                onclick={() => handleEditPosition(position)}
                                class="w-full text-left p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                            >
                                <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div class="flex-1">
                                        <div class="flex items-center gap-2 mb-1">
                                            {#if position.isCurrent()}
                                                <span class="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium">Current</span>
                                            {/if}
                                            <span class="text-sm text-zinc-500">{position.getPeriodString()}</span>
                                        </div>
                                        <h3 class="text-lg font-semibold mb-1">{position.job_title}</h3>
                                        <div class="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                            <Building2 class="w-4 h-4" />
                                            <span>{position.company?.name || 'Unknown Company'}</span>
                                        </div>
                                    </div>
                                    <div class="flex flex-wrap gap-2">
                                        {#each position.skills.slice(0, 4) as skill}
                                            <span class="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs">{skill}</span>
                                        {/each}
                                        {#if position.skills.length > 4}
                                            <span class="px-2 py-1 text-zinc-500 text-xs">+{position.skills.length - 4}</span>
                                        {/if}
                                    </div>
                                </div>
                                {#if position.base_salary}
                                    <div class="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                        <span class="text-sm text-zinc-500">Base Salary</span>
                                        <span class="font-semibold">{formatCurrency(position.base_salary, position.currency)}/year</span>
                                    </div>
                                {/if}
                            </button>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
</div>
