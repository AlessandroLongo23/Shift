<script>
    import { companiesStore } from '$lib/stores/companies.svelte.js';
    import Modal from '$lib/components/ui/Modal.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Input from '$lib/components/ui/Input.svelte';

    let { 
        isOpen = $bindable(false), 
        company = null
    } = $props();

    let loading = $state(false);
    let error = $state('');

    let form = $state({
        name: '',
        website: '',
        logo_url: '',
        color_theme: '#4F46E5'
    });

    $effect(() => {
        if (company) {
            form = {
                name: company.name || '',
                website: company.website || '',
                logo_url: company.logo_url || '',
                color_theme: company.color_theme || '#4F46E5'
            };
        } else {
            form = {
                name: '',
                website: '',
                logo_url: '',
                color_theme: '#4F46E5'
            };
        }
    });

    async function handleSubmit(e) {
        e.preventDefault();
        loading = true;
        error = '';

        try {
            let result;
            if (company) {
                result = await companiesStore.update(company.id, form);
            } else {
                result = await companiesStore.create(form);
            }

            if (result.success) {
                isOpen = false;
            } else {
                error = result.error;
            }
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    }

    async function handleDelete() {
        if (!company || !confirm('Are you sure you want to delete this company? All associated positions will also be deleted.')) return;
        
        loading = true;
        const result = await companiesStore.delete(company.id);
        if (result.success) {
            isOpen = false;
        } else {
            error = result.error;
        }
        loading = false;
    }
</script>

<Modal bind:isOpen title={company ? 'Edit Company' : 'Add Company'}>
    <form onsubmit={handleSubmit} class="space-y-4">
        {#if error}
            <div class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                {error}
            </div>
        {/if}

        <Input
            label="Company Name"
            placeholder="e.g., Acme Inc."
            bind:value={form.name}
            required
        />

        <Input
            type="url"
            label="Website"
            placeholder="https://example.com"
            bind:value={form.website}
        />

        <Input
            type="url"
            label="Logo URL"
            placeholder="https://example.com/logo.png"
            bind:value={form.logo_url}
        />

        <div class="space-y-1.5">
            <label for="color" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Brand Color
            </label>
            <div class="flex items-center gap-3">
                <input
                    type="color"
                    id="color"
                    bind:value={form.color_theme}
                    class="w-12 h-10 rounded cursor-pointer"
                />
                <input
                    type="text"
                    bind:value={form.color_theme}
                    placeholder="#4F46E5"
                    class="flex-1 px-3 py-2 rounded-lg border border-zinc-500/25 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                />
            </div>
        </div>

        <div class="flex gap-3 pt-4">
            {#if company}
                <Button type="button" variant="danger" onclick={handleDelete} disabled={loading}>
                    Delete
                </Button>
            {/if}
            <div class="flex-1"></div>
            <Button type="button" variant="outline" onclick={() => isOpen = false}>
                Cancel
            </Button>
            <Button type="submit" {loading}>
                {company ? 'Save Changes' : 'Add Company'}
            </Button>
        </div>
    </form>
</Modal>
