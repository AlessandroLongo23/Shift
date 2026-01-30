<script>
    import { onMount } from 'svelte';
    import { workLogsStore } from '$lib/stores/workLogs.svelte.js';
    import { positionsStore } from '$lib/stores/positions.svelte.js';
    import { paychecksStore } from '$lib/stores/paychecks.svelte.js';
    import { formatCurrency, formatHours } from '$lib/utils/format.js';
    import { WorkLogTypeColors, WorkLogTypeMap } from '$lib/models/WorkLog.svelte';
    import { ChevronLeft, ChevronRight, Clock, Calendar, Banknote, Upload, Plus } from 'lucide-svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import WorkLogModal from '$lib/components/workspace/WorkLogModal.svelte';
    import PaycheckModal from '$lib/components/workspace/PaycheckModal.svelte';

    let currentDate = $state(new Date());
    let selectedDate = $state(null);
    let isWorkLogModalOpen = $state(false);
    let isPaycheckModalOpen = $state(false);

    let year = $derived(currentDate.getFullYear());
    let month = $derived(currentDate.getMonth());
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    onMount(() => {
        positionsStore.fetch();
        fetchLogsForMonth();
        paychecksStore.fetch();
    });

    function fetchLogsForMonth() {
        workLogsStore.fetch(year, month + 1);
    }

    $effect(() => {
        // Re-fetch when month changes
        year;
        month;
        fetchLogsForMonth();
    });

    function previousMonth() {
        currentDate = new Date(year, month - 1, 1);
    }

    function nextMonth() {
        currentDate = new Date(year, month + 1, 1);
    }

    function goToToday() {
        currentDate = new Date();
    }

    let calendarDays = $derived(() => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDay = firstDay.getDay();
        const totalDays = lastDay.getDate();
        
        const days = [];
        
        // Previous month's days
        const prevMonth = new Date(year, month, 0);
        const prevMonthDays = prevMonth.getDate();
        for (let i = startingDay - 1; i >= 0; i--) {
            days.push({
                date: new Date(year, month - 1, prevMonthDays - i),
                isCurrentMonth: false
            });
        }
        
        // Current month's days
        for (let i = 1; i <= totalDays; i++) {
            days.push({
                date: new Date(year, month, i),
                isCurrentMonth: true
            });
        }
        
        // Next month's days
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                isCurrentMonth: false
            });
        }
        
        return days;
    });

    function getLogForDate(date) {
        const dateStr = date.toISOString().split('T')[0];
        return workLogsStore.workLogs.find(log => log.date === dateStr);
    }

    function handleDayClick(day) {
        if (!day.isCurrentMonth) return;
        selectedDate = day.date.toISOString().split('T')[0];
        isWorkLogModalOpen = true;
    }

    function isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    let monthStats = $derived({
        totalHours: workLogsStore.getTotalHoursForMonth(year, month),
        workDays: workLogsStore.workLogs.filter(log => {
            const d = new Date(log.date);
            return d.getFullYear() === year && d.getMonth() === month && log.type === 'work';
        }).length,
        vacationDays: workLogsStore.workLogs.filter(log => {
            const d = new Date(log.date);
            return d.getFullYear() === year && d.getMonth() === month && log.type === 'vacation';
        }).length
    });

    let monthPaycheck = $derived(paychecksStore.getByMonth(year, month));
</script>

<svelte:head>
    <title>Monthly Workspace | Shift</title>
</svelte:head>

<WorkLogModal 
    bind:isOpen={isWorkLogModalOpen} 
    date={selectedDate}
    positions={positionsStore.positions}
    existingLog={selectedDate ? workLogsStore.getByDate(selectedDate) : null}
/>

<PaycheckModal 
    bind:isOpen={isPaycheckModalOpen}
    positions={positionsStore.positions}
    {year}
    {month}
    existingPaycheck={monthPaycheck}
/>

<div class="max-w-6xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold">Monthly Workspace</h1>
            <p class="text-zinc-600 dark:text-zinc-400">Log your daily work and track hours</p>
        </div>
    </div>

    <!-- Month Navigation -->
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
            <Button variant="outline" size="icon" onclick={previousMonth}>
                <ChevronLeft class="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onclick={nextMonth}>
                <ChevronRight class="w-4 h-4" />
            </Button>
            <Button variant="ghost" onclick={goToToday}>Today</Button>
        </div>
        <h2 class="text-xl font-semibold">{monthNames[month]} {year}</h2>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
        <!-- Calendar -->
        <div class="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <!-- Weekday headers -->
            <div class="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800">
                {#each ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as day}
                    <div class="py-3 text-center text-sm font-medium text-zinc-500">{day}</div>
                {/each}
            </div>

            <!-- Calendar grid -->
            <div class="grid grid-cols-7">
                {#each calendarDays() as day, i}
                    {@const log = getLogForDate(day.date)}
                    <button
                        type="button"
                        onclick={() => handleDayClick(day)}
                        disabled={!day.isCurrentMonth}
                        class="
                            relative h-20 sm:h-24 p-2 border-r border-b border-zinc-100 dark:border-zinc-800 
                            text-left transition-colors
                            {day.isCurrentMonth ? 'hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer' : 'bg-zinc-50 dark:bg-zinc-900/50 cursor-default'}
                            {(i + 1) % 7 === 0 ? 'border-r-0' : ''}
                        "
                    >
                        <span class="
                            inline-flex items-center justify-center w-7 h-7 rounded-full text-sm
                            {!day.isCurrentMonth ? 'text-zinc-400' : ''}
                            {isToday(day.date) ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold' : ''}
                        ">
                            {day.date.getDate()}
                        </span>

                        {#if log && day.isCurrentMonth}
                            <div class="mt-1">
                                <div class="flex items-center gap-1">
                                    <span class="w-2 h-2 rounded-full {WorkLogTypeColors[log.type]}"></span>
                                    <span class="text-xs text-zinc-600 dark:text-zinc-400">{log.hours_worked}h</span>
                                </div>
                                {#if log.mood_rating}
                                    <span class="text-xs">{log.getMoodEmoji()}</span>
                                {/if}
                            </div>
                        {/if}
                    </button>
                {/each}
            </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-4">
            <!-- Month Stats -->
            <div class="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                <h3 class="font-semibold">Month Summary</h3>
                
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                            <Clock class="w-4 h-4" />
                            <span class="text-sm">Total Hours</span>
                        </div>
                        <span class="font-semibold">{formatHours(monthStats.totalHours)}</span>
                    </div>

                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                            <Calendar class="w-4 h-4" />
                            <span class="text-sm">Work Days</span>
                        </div>
                        <span class="font-semibold">{monthStats.workDays}</span>
                    </div>

                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                            <Calendar class="w-4 h-4" />
                            <span class="text-sm">Vacation Days</span>
                        </div>
                        <span class="font-semibold">{monthStats.vacationDays}</span>
                    </div>
                </div>
            </div>

            <!-- Paycheck Card -->
            <div class="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                <div class="flex items-center justify-between">
                    <h3 class="font-semibold">Paycheck</h3>
                    {#if monthPaycheck}
                        <Button variant="ghost" size="sm" onclick={() => isPaycheckModalOpen = true}>Edit</Button>
                    {/if}
                </div>

                {#if monthPaycheck}
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-zinc-600 dark:text-zinc-400">Net Amount</span>
                            <span class="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(monthPaycheck.net_amount)}</span>
                        </div>
                        {#if monthPaycheck.gross_amount}
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-zinc-600 dark:text-zinc-400">Gross Amount</span>
                                <span class="text-sm">{formatCurrency(monthPaycheck.gross_amount)}</span>
                            </div>
                        {/if}
                        {#if monthPaycheck.bonuses > 0}
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-zinc-600 dark:text-zinc-400">Bonuses</span>
                                <span class="text-sm text-emerald-600">+{formatCurrency(monthPaycheck.bonuses)}</span>
                            </div>
                        {/if}
                        <div class="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-zinc-600 dark:text-zinc-400">Hourly Rate</span>
                                <span class="font-semibold">
                                    {monthStats.totalHours > 0 
                                        ? formatCurrency(monthPaycheck.net_amount / monthStats.totalHours) + '/h'
                                        : '—'}
                                </span>
                            </div>
                        </div>
                        {#if monthPaycheck.is_synced_to_budget}
                            <div class="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                                Synced to FinTrack
                            </div>
                        {/if}
                    </div>
                {:else}
                    <div class="text-center py-4">
                        <Banknote class="w-8 h-8 mx-auto text-zinc-400 mb-2" />
                        <p class="text-sm text-zinc-500 mb-3">No paycheck recorded</p>
                        <Button variant="outline" size="sm" onclick={() => isPaycheckModalOpen = true}>
                            <Plus class="w-4 h-4" />
                            Add Paycheck
                        </Button>
                    </div>
                {/if}
            </div>

            <!-- Legend -->
            <div class="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <h4 class="text-sm font-medium mb-3">Legend</h4>
                <div class="space-y-2">
                    {#each Object.entries(WorkLogTypeMap) as [type, label]}
                        <div class="flex items-center gap-2">
                            <span class="w-3 h-3 rounded-full {WorkLogTypeColors[type]}"></span>
                            <span class="text-sm text-zinc-600 dark:text-zinc-400">{label}</span>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>
</div>
