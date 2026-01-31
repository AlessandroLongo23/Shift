<script>
    import { positionsStore } from '$lib/stores/positions.svelte.js';
    import { currencyList } from '$lib/stores/currency.js';
    import { Currency } from '$lib/const/currency';
    import { ContractType, ContractTypeMap } from '$lib/const/contract';

    import Modal from '$lib/components/ui/Modal.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Input from '$lib/components/ui/Input.svelte';

    let { 
        isOpen = $bindable(false), 
        position = null,
        companies = []
    } = $props();

    let loading = $state(false);
    let error = $state('');

    let form = $state({
        company_id: '',
        job_title: '',
        contract_type: ContractType.FULL_TIME,
        start_date: '',
        end_date: '',
        base_salary: '',
        currency: Currency.EURO,
        description: '',
        skills: ''
    });

    $effect(() => {
        if (position) {
            form = {
                company_id: position.company_id || '',
                job_title: position.job_title || '',
                contract_type: position.contract_type || ContractType.FULL_TIME,
                start_date: position.start_date || '',
                end_date: position.end_date || '',
                base_salary: position.base_salary?.toString() || '',
                currency: position.currency || Currency.EURO,
                description: position.description || '',
                skills: position.skills?.join(', ') || ''
            };
        } else {
            form = {
                company_id: '',
                job_title: '',
                contract_type: ContractType.FULL_TIME,
                start_date: '',
                end_date: '',
                base_salary: '',
                currency: Currency.EURO,
                description: '',
                skills: ''
            };
        }
    });

    async function handleSubmit(e) {
        e.preventDefault();
        loading = true;
        error = '';

        const data = {
            company_id: form.company_id,
            job_title: form.job_title,
            contract_type: form.contract_type,
            start_date: form.start_date,
            end_date: form.end_date || null,
            base_salary: form.base_salary ? parseFloat(form.base_salary) : null,
            currency: form.currency,
            description: form.description || null,
            skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : []
        };

        try {
            let result;
            if (position) {
                result = await positionsStore.update(position.id, data);
            } else {
                result = await positionsStore.create(data);
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
        if (!position || !confirm('Are you sure you want to delete this position?')) return;
        
        loading = true;
        const result = await positionsStore.delete(position.id);
        if (result.success) {
            isOpen = false;
        } else {
            error = result.error;
        }
        loading = false;
    }
</script>

<Modal bind:isOpen title={position ? 'Edit Position' : 'Add Position'} size="lg">
    <form onsubmit={handleSubmit} class="space-y-4">
        {#if error}
            <div class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                {error}
            </div>
        {/if}

        <div class="space-y-1.5">
            <label for="company" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Company <span class="text-red-500">*</span>
            </label>
            <select
                id="company"
                bind:value={form.company_id}
                required
                class="w-full px-3 py-2 rounded-lg border border-zinc-500/25 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            >
                <option value="">Select a company</option>
                {#each companies as company}
                    <option value={company.id}>{company.name}</option>
                {/each}
            </select>
        </div>

        <Input
            label="Job Title"
            placeholder="e.g., Senior Software Engineer"
            bind:value={form.job_title}
            required
        />

        <div class="space-y-1.5">
            <label for="contract_type" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Contract Type
            </label>
            <select
                id="contract_type"
                bind:value={form.contract_type}
                class="w-full px-3 py-2 rounded-lg border border-zinc-500/25 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            >
                {#each Object.values(ContractType) as contractType}
                    <option value={contractType}>{ContractTypeMap[contractType]}</option>
                {/each}
            </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
            <Input
                type="date"
                label="Start Date"
                bind:value={form.start_date}
                required
            />
            <Input
                type="date"
                label="End Date"
                placeholder="Leave empty if current"
                bind:value={form.end_date}
            />
        </div>

        <div class="grid grid-cols-2 gap-4">
            <Input
                type="number"
                label="Base Salary (Annual)"
                placeholder="50000"
                bind:value={form.base_salary}
            />
            <div class="space-y-1.5">
                <label for="currency" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Currency
                </label>
                <select
                    id="currency"
                    bind:value={form.currency}
                    class="w-full px-3 py-2 rounded-lg border border-zinc-500/25 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                >
                    {#each currencyList as currency}
                        <option value={currency.code}>{currency.code} ({currency.symbol})</option>
                    {/each}
                </select>
            </div>
        </div>

        <Input
            label="Skills"
            placeholder="React, TypeScript, Node.js (comma separated)"
            bind:value={form.skills}
        />

        <div class="space-y-1.5">
            <label for="description" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Description
            </label>
            <textarea
                id="description"
                bind:value={form.description}
                placeholder="Job description and responsibilities..."
                rows="3"
                class="w-full px-3 py-2 rounded-lg border border-zinc-500/25 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            ></textarea>
        </div>

        <div class="flex gap-3 pt-4">
            {#if position}
                <Button type="button" variant="danger" onclick={handleDelete} disabled={loading}>
                    Delete
                </Button>
            {/if}
            <div class="flex-1"></div>
            <Button type="button" variant="outline" onclick={() => isOpen = false}>
                Cancel
            </Button>
            <Button type="submit" {loading}>
                {position ? 'Save Changes' : 'Add Position'}
            </Button>
        </div>
    </form>
</Modal>
