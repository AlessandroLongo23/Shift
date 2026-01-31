<script>
    import { workLogsStore } from '$lib/stores/workLogs.svelte.js';
    import { formatDate, formatHours } from '$lib/utils/format.js';
    import { moodsOptions } from '$lib/const/moods';
	import { WorkLogType, workLogTypeOptions } from '$lib/const/workLogTypes';

    import Modal from '$lib/components/ui/Modal.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import CustomSelect from '$lib/components/ui/CustomSelect.svelte';

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
        check_in: '09:00',
        check_out: '17:00',
        break_minutes: '30',
        type: WorkLogType.WORK,
        notes: '',
        mood_rating: 3
    });

    // Transform positions for CustomSelect
    let positionOptions = $derived(
        positions.map(p => ({
            id: p.id,
            name: `${p.job_title} @ ${p.company?.name || 'Unknown'}`
        }))
    );

    // Calculate hours worked from check_in, check_out, and break
    let calculatedHours = $derived.by(() => {
        if (!form.check_in || !form.check_out) return 0;
        
        const [inHours, inMinutes] = form.check_in.split(':').map(Number);
        const [outHours, outMinutes] = form.check_out.split(':').map(Number);
        
        const breakMins = parseInt(form.break_minutes) || 0;
        const totalMinutes = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes) - breakMins;
        return Math.max(0, totalMinutes / 60);
    });

    $effect(() => {
        if (isOpen) {
            if (existingLog) {
                form = {
                    position_id: existingLog.position_id || '',
                    check_in: existingLog.check_in || '09:00',
                    check_out: existingLog.check_out || '18:00',
                    break_minutes: existingLog.break_minutes?.toString() || '30',
                    type: existingLog.type || WorkLogType.WORK,
                    notes: existingLog.notes || '',
                    mood_rating: existingLog.mood_rating || 3
                };
            } else {
                // Default to current position
                const currentPos = positions.find(p => p.isCurrent());
                form = {
                    position_id: currentPos?.id || '',
                    check_in: '09:00',
                    check_out: '17:00',
                    break_minutes: '30',
                    type: WorkLogType.WORK,
                    notes: '',
                    mood_rating: 3
                };
            }
        }
    });

    

    async function handleSubmit(e) {
        e.preventDefault();
        loading = true;
        error = '';

        const data = {
            position_id: form.position_id,
            date: date,
            check_in: form.type === WorkLogType.WORK ? form.check_in : null,
            check_out: form.type === WorkLogType.WORK ? form.check_out : null,
            break_minutes: form.type === WorkLogType.WORK ? parseInt(form.break_minutes) || 0 : 0,
            hours_worked: form.type === WorkLogType.WORK ? calculatedHours : 0,
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

<Modal bind:isOpen title={date ? formatDate(date, 'full') : 'Log Shift'}>
    <form onsubmit={handleSubmit} class="space-y-4">
        {#if error}
            <div class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                {error}
            </div>
        {/if}

        <div class="space-y-1.5">
            <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Position
            </label>
            <CustomSelect
                bind:value={form.position_id}
                options={positionOptions}
                labelKey="name"
                valueKey="id"
                placeholder="Select a position"
                searchable={positions.length > 5}
            />
        </div>

        <div class="space-y-1.5">
            <label for="type" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Type
            </label>
            <CustomSelect
                bind:value={form.type}
                options={workLogTypeOptions}
                labelKey="label"
                valueKey="value"
                placeholder="Select a type"
            />
        </div>

        {#if form.type === WorkLogType.WORK}
            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1.5">
                    <label for="check_in" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Check In
                    </label>
                    <input
                        id="check_in"
                        type="time"
                        bind:value={form.check_in}
                        class="w-full px-3 py-2 rounded-lg border border-zinc-500/25 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                    />
                </div>
                <div class="space-y-1.5">
                    <label for="check_out" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Check Out
                    </label>
                    <input
                        id="check_out"
                        type="time"
                        bind:value={form.check_out}
                        class="w-full px-3 py-2 rounded-lg border border-zinc-500/25 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                    />
                </div>
            </div>

            <div class="space-y-1.5">
                <label for="break_minutes" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Break (minutes)
                </label>
                <input
                    id="break_minutes"
                    type="number"
                    min="0"
                    max="480"
                    step="5"
                    bind:value={form.break_minutes}
                    placeholder="30"
                    class="w-full px-3 py-2 rounded-lg border border-zinc-500/25 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                />
            </div>

            <!-- Calculated hours display -->
            <div class="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <div class="flex items-center justify-between">
                    <span class="text-sm text-emerald-700 dark:text-emerald-300">Total hours worked</span>
                    <span class="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
                        {formatHours(calculatedHours)}
                    </span>
                </div>
            </div>
        {/if}

        <div class="space-y-1.5">
            <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Mood
            </label>
            <div class="flex gap-2">
                {#each moodsOptions as mood}
                    <button
                        type="button"
                        onclick={() => form.mood_rating = mood.value}
                        class="
                            flex-1 py-3 rounded-lg text-2xl transition-all
                            {form.mood_rating === mood.value
                                ? 'bg-zinc-100 dark:bg-zinc-800 ring-2 ring-zinc-400 dark:ring-zinc-600' 
                                : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}
                        " title={mood.label}
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
                class="w-full px-3 py-2 rounded-lg border border-zinc-500/25 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500"
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
                {existingLog ? 'Save Changes' : 'Log Shift'}
            </Button>
        </div>
    </form>
</Modal>
