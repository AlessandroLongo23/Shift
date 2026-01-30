<script>
    import { onMount } from 'svelte';
    import { companiesStore } from '$lib/stores/companies.svelte.js';
    import { positionsStore } from '$lib/stores/positions.svelte.js';
    import { Building2, Globe, Plus, ExternalLink, Briefcase } from 'lucide-svelte';
    
    import Button from '$lib/components/ui/Button.svelte';
    import CompanyModal from '$lib/components/timeline/CompanyModal.svelte';

    let isModalOpen = $state(false);
    let editingCompany = $state(null);

    onMount(() => {
        companiesStore.fetch();
        positionsStore.fetch();
    });

    function handleAddCompany() {
        editingCompany = null;
        isModalOpen = true;
    }

    function handleEditCompany(company) {
        editingCompany = company;
        isModalOpen = true;
    }

    function getPositionCount(companyId) {
        return positionsStore.getByCompanyId(companyId).length;
    }
</script>

<svelte:head>
    <title>Companies | Shift</title>
</svelte:head>

<CompanyModal bind:isOpen={isModalOpen} company={editingCompany} />

<div class="max-w-5xl mx-auto space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold">Companies</h1>
            <p class="text-zinc-600 dark:text-zinc-400">Manage the companies you've worked for</p>
        </div>
        <Button onclick={handleAddCompany}>
            <Plus class="w-4 h-4" />
            Add Company
        </Button>
    </div>

    <!-- Companies Grid -->
    {#if companiesStore.loading}
        <div class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-100"></div>
        </div>
    {:else if companiesStore.companies.length === 0}
        <div class="text-center py-12 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <Building2 class="w-12 h-12 mx-auto text-zinc-400 mb-4" />
            <h3 class="text-lg font-medium mb-2">No companies yet</h3>
            <p class="text-zinc-600 dark:text-zinc-400 mb-4">Add companies to organize your positions</p>
            <Button onclick={handleAddCompany}>
                <Plus class="w-4 h-4" />
                Add Company
            </Button>
        </div>
    {:else}
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each companiesStore.companies as company}
                <button
                    type="button"
                    onclick={() => handleEditCompany(company)}
                    class="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors text-left"
                >
                    <div class="flex items-start gap-4">
                        <!-- Company Logo/Color -->
                        {#if company.logo_url}
                            <img 
                                src={company.logo_url} 
                                alt="{company.name} logo"
                                class="w-12 h-12 rounded-lg object-cover"
                            />
                        {:else}
                            <div 
                                class="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                                style="background-color: {company.color_theme || '#6366F1'}"
                            >
                                {company.name[0]?.toUpperCase()}
                            </div>
                        {/if}

                        <div class="flex-1 min-w-0">
                            <h3 class="font-semibold truncate">{company.name}</h3>
                            
                            {#if company.website}
                                <a 
                                    href={company.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onclick={(e) => e.stopPropagation()}
                                    class="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mt-1"
                                >
                                    <Globe class="w-3 h-3" />
                                    <span class="truncate">{company.website.replace(/^https?:\/\//, '')}</span>
                                    <ExternalLink class="w-3 h-3" />
                                </a>
                            {/if}
                        </div>
                    </div>

                    <div class="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 text-sm text-zinc-500">
                        <Briefcase class="w-4 h-4" />
                        <span>{getPositionCount(company.id)} position{getPositionCount(company.id) !== 1 ? 's' : ''}</span>
                    </div>
                </button>
            {/each}
        </div>
    {/if}
</div>
