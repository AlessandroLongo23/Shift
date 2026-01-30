<script>
    import { workLogsStore } from '$lib/stores/workLogs.svelte.js';
    import { formatDate } from '$lib/utils/format.js';
    import Modal from '$lib/components/ui/Modal.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Input from '$lib/components/ui/Input.svelte';

    let { 
        isOpen = $bindable(false), 
        date = null,
        positions = [],
        existingLog = null
    } = $props();

    let loading = $state(false);
    let error = $state('');

    let form = $state({
        position_id: '',
        hours_worked: '8',
        type: 'work',
        notes: '',
        mood_rating: 3
    });

    $effect(() => {
        if (existingLog) {
            form = {
                position_id: existingLog.position_id || '',
                hours_worked: existingLog.hours_worked?.toString() || '8',
                type: existingLog.type || 'work',
                notes: existingLog.notes || '',
                mood_rating: existingLog.mood_rating || 3
            };
        } else {
            // Default to current position
            const currentPos = positions.find(p => p.isCurrent());
            form = {
                position_id: currentPos?.id || '',
                hours_worked: '8',
                type: 'work',
                notes: '',
                mood_rating: 3
            };
        }
    });

    const moods = [
        { value: 1, emoji: '😢', label: 'Very Bad' },
        { value: 2, emoji: '😕', label: 'Bad' },
        { value: 3, emoji: '😐', label: 'Okay' },
        { value: 4, emoji: '🙂', label: 'Good' },
        { value: 5, emoji: '😄', label: 'Great' }
    ];

    async function handleSubmit(e) {
        e.preventDefault();
        loading = true;
        error = '';

        const data = {
            position_id: form.position_id,
            date: date,
            hours_worked: parseFloat(form.hours_worked) || 0,
            type: form.type,
            notes: form.notes || null,
            mood_rating: form.mood_rating
        };

        try {
            let result;
            if (existingLog) {
                result = await workLogsStore.update(existingLog.id, data);
            } else {
                result = await workLogsStore.create(data);
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
        if (!existingLog || !confirm('Are you sure you want to delete this work log?')) return;
        
        loading = true;
        const result = await workLogsStore.delete(existingLog.id);
        if (result.success) {
            isOpen = false;
        } else {
            error = result.error;
        }
        loading = false;
    }
</script>

<Modal bind:isOpen title={date ? formatDate(date, 'full') : 'Log Work'}>
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

        <div class="space-y-1.5">
            <label for="type" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Type
            </label>
            <select
                id="type"
                bind:value={form.type}
                class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            >
                <option value="work">Work</option>
                <option value="vacation">Vacation</option>
                <option value="sick_leave">Sick Leave</option>
                <option value="permit">Permit</option>
            </select>
        </div>

        {#if form.type === 'work'}
            <Input
                type="number"
                label="Hours Worked"
                placeholder="8"
                bind:value={form.hours_worked}
                min="0"
                max="24"
                step="0.5"
            />
        {/if}

        <div class="space-y-1.5">
            <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Mood
            </label>
            <div class="flex gap-2">
                {#each moods as mood}
                    <button
                        type="button"
                        onclick={() => form.mood_rating = mood.value}
                        class="
                            flex-1 py-3 rounded-lg text-2xl transition-all
                            {form.mood_rating === mood.value 
                                ? 'bg-zinc-100 dark:bg-zinc-800 ring-2 ring-zinc-400 dark:ring-zinc-600' 
                                : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}
                        "
                        title={mood.label}
                    >
                        {mood.emoji}
                    </button>
                {/each}
            </div>
        </div>

        <div class="space-y-1.5">
            <label for="notes" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Notes
            </label>
            <textarea
                id="notes"
                bind:value={form.notes}
                placeholder="What did you work on today?"
                rows="3"
                class="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            ></textarea>
        </div>

        <div class="flex gap-3 pt-4">
            {#if existingLog}
                <Button type="button" variant="danger" onclick={handleDelete} disabled={loading}>
                    Delete
                </Button>
            {/if}
            <div class="flex-1"></div>
            <Button type="button" variant="outline" onclick={() => isOpen = false}>
                Cancel
            </Button>
            <Button type="submit" {loading}>
                {existingLog ? 'Save Changes' : 'Log Work'}
            </Button>
        </div>
    </form>
</Modal>
