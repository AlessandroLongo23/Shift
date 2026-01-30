<script>
    import { paychecksStore } from '$lib/stores/paychecks.svelte.js';
    import Modal from '$lib/components/ui/Modal.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Input from '$lib/components/ui/Input.svelte';

    let { 
        isOpen = $bindable(false),
        positions = [],
        year = new Date().getFullYear(),
        month = new Date().getMonth(),
        existingPaycheck = null
    } = $props();

    let loading = $state(false);
    let error = $state('');

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    let form = $state({
        position_id: '',
        net_amount: '',
        gross_amount: '',
        bonuses: '0',
        is_synced_to_budget: false
    });

    $effect(() => {
        if (existingPaycheck) {
            form = {
                position_id: existingPaycheck.position_id || '',
                net_amount: existingPaycheck.net_amount?.toString() || '',
                gross_amount: existingPaycheck.gross_amount?.toString() || '',
                bonuses: existingPaycheck.bonuses?.toString() || '0',
                is_synced_to_budget: existingPaycheck.is_synced_to_budget || false
            };
        } else {
            const currentPos = positions.find(p => p.isCurrent());
            form = {
                position_id: currentPos?.id || '',
                net_amount: '',
                gross_amount: '',
                bonuses: '0',
                is_synced_to_budget: false
            };
        }
    });

    async function handleSubmit(e) {
        e.preventDefault();
        loading = true;
        error = '';

        // Create reference date (first day of month)
        const reference_date = `${year}-${String(month + 1).padStart(2, '0')}-01`;

        const data = {
            position_id: form.position_id,
            reference_date,
            net_amount: parseFloat(form.net_amount),
            gross_amount: form.gross_amount ? parseFloat(form.gross_amount) : null,
            bonuses: parseFloat(form.bonuses) || 0,
            is_synced_to_budget: form.is_synced_to_budget
        };

        try {
            let result;
            if (existingPaycheck) {
                result = await paychecksStore.update(existingPaycheck.id, data);
            } else {
                result = await paychecksStore.create(data);
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
        if (!existingPaycheck || !confirm('Are you sure you want to delete this paycheck?')) return;
        
        loading = true;
        const result = await paychecksStore.delete(existingPaycheck.id);
        if (result.success) {
            isOpen = false;
        } else {
            error = result.error;
        }
        loading = false;
    }
</script>

<Modal bind:isOpen title="{monthNames[month]} {year} Paycheck">
    <form onsubmit={handleSubmit} class="space-y-4">
        {#if error}
            <div class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                {error}
            </div>
        {/if}

        <div class="space-y-1.5">
            <label for="position" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Position
            </label>
            <select
                id="position"
                bind:value={form.position_id}
                required
                class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            >
                <option value="">Select a position</option>
                {#each positions as position}
                    <option value={position.id}>{position.job_title} @ {position.company?.name}</option>
                {/each}
            </select>
        </div>

        <Input
            type="number"
            label="Net Amount"
            placeholder="2000"
            bind:value={form.net_amount}
            required
        />

        <Input
            type="number"
            label="Gross Amount"
            placeholder="2800"
            bind:value={form.gross_amount}
        />

        <Input
            type="number"
            label="Bonuses"
            placeholder="0"
            bind:value={form.bonuses}
        />

        <div class="flex items-center gap-3 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
            <input
                type="checkbox"
                id="sync"
                bind:checked={form.is_synced_to_budget}
                class="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-emerald-600 focus:ring-emerald-500"
            />
            <label for="sync" class="flex-1">
                <span class="block text-sm font-medium">Sync to FinTrack</span>
                <span class="text-xs text-zinc-500">Automatically add this income to your budget tracker</span>
            </label>
        </div>

        <div class="flex gap-3 pt-4">
            {#if existingPaycheck}
                <Button type="button" variant="danger" onclick={handleDelete} disabled={loading}>
                    Delete
                </Button>
            {/if}
            <div class="flex-1"></div>
            <Button type="button" variant="outline" onclick={() => isOpen = false}>
                Cancel
            </Button>
            <Button type="submit" {loading}>
                {existingPaycheck ? 'Save Changes' : 'Add Paycheck'}
            </Button>
        </div>
    </form>
</Modal>
