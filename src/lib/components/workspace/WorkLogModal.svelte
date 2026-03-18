<script>
    import { workLogsStore } from '$lib/stores/workLogs.svelte.js';
    import { settingsStore } from '$lib/stores/settings.svelte.js';
    import { formatDate, formatHours, toLocalDateString } from '$lib/utils/format.js';
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

    // Repeat shift state (only for new logs)
    let repeat = $state(false);
    let repeatDays = $state(new Set());

    // Day labels in order, respecting weekStartsOnMonday
    // Each entry: { label, dow } where dow is JS getDay() value (0=Sun...6=Sat)
    let weekdayOptions = $derived.by(() => {
        const all = [
            { label: 'Sun', dow: 0 },
            { label: 'Mon', dow: 1 },
            { label: 'Tue', dow: 2 },
            { label: 'Wed', dow: 3 },
            { label: 'Thu', dow: 4 },
            { label: 'Fri', dow: 5 },
            { label: 'Sat', dow: 6 },
        ];
        return settingsStore.weekStartsOnMonday
            ? [...all.slice(1), all[0]]
            : all;
    });

    // All dates to create when repeat is on.
    // Includes the originally clicked date always, plus all matching weekday dates in the period
    // that don't already have a log.
    let repeatTargets = $derived.by(() => {
        if (!repeat || !date || repeatDays.size === 0) return [];
        const [y, m, d] = date.split('-').map(Number);
        const { startDate, endDate } = settingsStore.getPayPeriod(y, m - 1);
        const targets = [];
        let cursor = new Date(startDate);
        while (cursor <= endDate) {
            const dow = cursor.getDay();
            const ds = toLocalDateString(cursor);
            if (repeatDays.has(dow) && !workLogsStore.getByDate(ds)) {
                targets.push(ds);
            }
            cursor.setDate(cursor.getDate() + 1);
        }
        // Always include the clicked date (it has no log since existingLog is null here)
        if (!targets.includes(date)) {
            targets.unshift(date);
        }
        return targets;
    });

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
                repeat = false;
                repeatDays = new Set();
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
                // Pre-select the weekday of the chosen date
                repeat = false;
                if (date) {
                    const [y, m, d] = date.split('-').map(Number);
                    const dow = new Date(y, m - 1, d).getDay();
                    repeatDays = new Set([dow]);
                } else {
                    repeatDays = new Set();
                }
            }
        }
    });

    

    async function handleSubmit(e) {
        e.preventDefault();
        loading = true;
        error = '';

        const baseData = {
            position_id: form.position_id,
            check_in: form.type === WorkLogType.WORK ? form.check_in : null,
            check_out: form.type === WorkLogType.WORK ? form.check_out : null,
            break_minutes: form.type === WorkLogType.WORK ? parseInt(form.break_minutes) || 0 : 0,
            hours_worked: form.type === WorkLogType.WORK ? calculatedHours : 0,
            type: form.type,
            notes: form.notes || null,
            mood_rating: form.mood_rating
        };

        try {
            if (existingLog) {
                const result = await workLogsStore.update(existingLog.id, { ...baseData, date });
                if (result.success) {
                    isOpen = false;
                } else {
                    error = result.error;
                }
            } else if (repeat && repeatTargets.length > 0) {
                // Bulk create: repeatTargets already includes the clicked date + all matching weekday dates
                let lastError = '';
                for (const d of repeatTargets) {
                    const result = await workLogsStore.create({ ...baseData, date: d });
                    if (!result.success) lastError = result.error;
                }
                if (lastError) {
                    error = lastError;
                } else {
                    isOpen = false;
                }
            } else {
                const result = await workLogsStore.create({ ...baseData, date });
                if (result.success) {
                    isOpen = false;
                } else {
                    error = result.error;
                }
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
                            flex-1 py-3 rounded-lg text-2xl transition-colors
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

        {#if !existingLog}
            <div class="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                <label class="flex items-center gap-3 cursor-pointer">
                    <div class="relative">
                        <input
                            type="checkbox"
                            bind:checked={repeat}
                            class="sr-only peer"
                        />
                        <div class="w-9 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 peer-checked:bg-zinc-800 dark:peer-checked:bg-zinc-300 transition-colors"></div>
                        <div class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4"></div>
                    </div>
                    <span class="text-sm font-medium text-zinc-700 dark:text-zinc-300">Repeat this shift in the pay period</span>
                </label>

                {#if repeat}
                    <div class="space-y-2">
                        <div class="flex gap-1.5 flex-wrap">
                            {#each weekdayOptions as opt}
                                <button
                                    type="button"
                                    onclick={() => {
                                        const next = new Set(repeatDays);
                                        next.has(opt.dow) ? next.delete(opt.dow) : next.add(opt.dow);
                                        repeatDays = next;
                                    }}
                                    class="
                                        px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                                        {repeatDays.has(opt.dow)
                                            ? 'bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900'
                                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'}
                                    "
                                >
                                    {opt.label}
                                </button>
                            {/each}
                        </div>
                        <p class="text-xs text-zinc-500 dark:text-zinc-400">
                            {#if repeatDays.size === 0}
                                Select at least one day to repeat.
                            {:else}
                                {repeatTargets.length} shift{repeatTargets.length === 1 ? '' : 's'} will be created (days with existing logs are skipped).
                            {/if}
                        </p>
                    </div>
                {/if}
            </div>
        {/if}

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
                {existingLog ? 'Save Changes' : (repeat && repeatTargets.length > 0 ? `Create ${repeatTargets.length} Shift${repeatTargets.length === 1 ? '' : 's'}` : 'Log Shift')}
            </Button>
        </div>
    </form>
</Modal>
