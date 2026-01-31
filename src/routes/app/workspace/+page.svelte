<script>
    import { onMount } from 'svelte';
    import { workLogsStore } from '$lib/stores/workLogs.svelte.js';
    import { positionsStore } from '$lib/stores/positions.svelte.js';
    import { paychecksStore } from '$lib/stores/paychecks.svelte.js';
    import { settingsStore } from '$lib/stores/settings.js';
    import { currencyList } from '$lib/stores/currency.js';
    import { exchangeRates, fetchExchangeRates, convertCurrency } from '$lib/stores/exchangeRates.js';
    import { formatCurrency, formatHours, formatTime } from '$lib/utils/format.js';
    import { WorkLogTypeColors, WorkLogTypeMap } from '$lib/models/WorkLog.svelte';
    import { ChevronLeft, ChevronRight, Clock, Calendar, Banknote, Plus, RefreshCw } from 'lucide-svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import CustomSelect from '$lib/components/ui/CustomSelect.svelte';
    import WorkLogModal from '$lib/components/workspace/WorkLogModal.svelte';
    import PaycheckModal from '$lib/components/workspace/PaycheckModal.svelte';

    let currentDate = $state(new Date());
    let selectedDate = $state(null);
    let isWorkLogModalOpen = $state(false);
    let isPaycheckModalOpen = $state(false);
    let selectedCurrency = $state('EUR');
    let rates = $state({});
    let loadingRates = $state(false);
    let settings = $state({
        weekStartsOnMonday: true,
        useCustomPeriod: false,
        periodStartDay: 16,
        periodEndDay: 15,
        defaultCurrency: 'EUR'
    });

    // Reference month (the paycheck month we're viewing)
    let year = $derived(currentDate.getFullYear());
    let month = $derived(currentDate.getMonth());
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    onMount(async () => {
        positionsStore.fetch();
        paychecksStore.fetch();
        workLogsStore.fetch(); // Fetch all logs
        
        // Fetch exchange rates
        loadingRates = true;
        rates = await fetchExchangeRates();
        loadingRates = false;
    });

    // Subscribe to settings store
    $effect(() => {
        const unsubscribe = settingsStore.subscribe(value => {
            settings = value;
            selectedCurrency = value.defaultCurrency || 'EUR';
        });
        return unsubscribe;
    });

    // Subscribe to exchange rates store
    $effect(() => {
        const unsubscribe = exchangeRates.subscribe(value => {
            rates = value;
        });
        return unsubscribe;
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

    // Get position currency for a paycheck
    function getPaycheckCurrency(paycheck) {
        if (!paycheck) return 'EUR';
        const position = positionsStore.getById(paycheck.position_id);
        return position?.currency || 'EUR';
    }

    // Convert amount to selected currency
    function toSelectedCurrency(amount, fromCurrency) {
        if (!fromCurrency || fromCurrency === selectedCurrency) return amount;
        return convertCurrency(amount, fromCurrency, selectedCurrency, rates);
    }

    // Get pay period for current month
    let payPeriod = $derived(() => {
        return settingsStore.getPayPeriod(year, month);
    });

    // Get weekday names based on settings
    let weekdays = $derived(() => {
        return settingsStore.getWeekdays(true);
    });

    // Generate calendar days based on the pay period
    let calendarDays = $derived(() => {
        const { startDate, endDate } = payPeriod();
        
        // Find the first day of the week containing the start date
        let firstDayOfWeek = new Date(startDate);
        let dayOfWeek = firstDayOfWeek.getDay(); // 0 = Sunday
        
        // Adjust for Monday start
        if (settings.weekStartsOnMonday) {
            dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        }
        
        // Go back to the start of the week
        firstDayOfWeek.setDate(firstDayOfWeek.getDate() - dayOfWeek);
        
        // Find the last day of the week containing the end date
        let lastDayOfWeek = new Date(endDate);
        let endDayOfWeek = lastDayOfWeek.getDay();
        
        // Adjust for Monday start
        if (settings.weekStartsOnMonday) {
            endDayOfWeek = endDayOfWeek === 0 ? 6 : endDayOfWeek - 1;
        }
        
        // Go forward to the end of the week
        lastDayOfWeek.setDate(lastDayOfWeek.getDate() + (6 - endDayOfWeek));
        
        const days = [];
        let currentDay = new Date(firstDayOfWeek);
        
        while (currentDay <= lastDayOfWeek) {
            const isInPeriod = currentDay >= startDate && currentDay <= endDate;
            days.push({
                date: new Date(currentDay),
                isInPeriod
            });
            currentDay.setDate(currentDay.getDate() + 1);
        }
        
        return days;
    });

    function getLogForDate(date) {
        const dateStr = date.toISOString().split('T')[0];
        return workLogsStore.workLogs.find(log => log.date === dateStr);
    }

    function handleDayClick(day) {
        selectedDate = day.date.toISOString().split('T')[0];
        isWorkLogModalOpen = true;
    }

    function isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    // Calculate stats based on pay period
    let monthStats = $derived(() => {
        const { startDate, endDate } = payPeriod();
        
        // Filter logs within the pay period
        const periodLogs = workLogsStore.workLogs.filter(log => {
            const logDate = new Date(log.date);
            logDate.setHours(0, 0, 0, 0);
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            return logDate >= start && logDate <= end;
        });
        
        return {
            totalHours: periodLogs.reduce((sum, log) => sum + (log.hours_worked || 0), 0),
            workDays: periodLogs.filter(log => log.type === 'work').length,
            vacationDays: periodLogs.filter(log => log.type === 'vacation').length
        };
    });

    let monthPaycheck = $derived(paychecksStore.getByMonth(year, month));
    let paycheckCurrency = $derived(getPaycheckCurrency(monthPaycheck));

    // Format pay period for display
    let payPeriodLabel = $derived(() => {
        const { startDate, endDate } = payPeriod();
        const formatOpts = { month: 'short', day: 'numeric', year: 'numeric' };
        const startStr = startDate.toLocaleDateString('en-US', formatOpts);
        const endStr = endDate.toLocaleDateString('en-US', formatOpts);
        return `${startStr} - ${endStr}`;
    });

    // Currency options for select
    let currencyOptions = currencyList.map(c => ({
        id: c.code,
        name: `${c.code} (${c.symbol})`
    }));

    async function refreshRates() {
        loadingRates = true;
        exchangeRates.set({});
        rates = await fetchExchangeRates();
        loadingRates = false;
    }
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
        <div class="flex items-center gap-3">
            <span class="text-sm text-zinc-500">Display in:</span>
            <CustomSelect
                bind:value={selectedCurrency}
                options={currencyOptions}
                labelKey="name"
                valueKey="id"
                placeholder="Select currency"
                searchable={false}
                classes="w-40"
            />
            <button
                type="button"
                onclick={refreshRates}
                disabled={loadingRates}
                class="p-2 rounded-lg border border-zinc-500/25 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                title="Refresh exchange rates"
            >
                <RefreshCw class="w-4 h-4 {loadingRates ? 'animate-spin' : ''}" />
            </button>
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
        <div class="text-right">
            <h2 class="text-xl font-semibold">{monthNames[month]} {year}</h2>
            {#if settings.useCustomPeriod}
                <p class="text-sm text-zinc-500">{payPeriodLabel()}</p>
            {/if}
        </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
        <!-- Calendar -->
        <div class="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-500/25 overflow-hidden">
            <!-- Weekday headers -->
            <div class="grid grid-cols-7 border-b border-zinc-500/25">
                {#each weekdays() as day}
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
                        class="
                            relative h-20 sm:h-24 p-2 border-r border-b border-zinc-500/15 
                            text-left transition-colors
                            {day.isInPeriod 
                                ? 'hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer' 
                                : 'bg-zinc-100 dark:bg-zinc-800/50 cursor-pointer'}
                            {(i + 1) % 7 === 0 ? 'border-r-0' : ''}
                        "
                    >
                        <span class="
                            inline-flex items-center justify-center w-7 h-7 rounded-full text-sm
                            {!day.isInPeriod ? 'text-zinc-400' : ''}
                            {isToday(day.date) ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold' : ''}
                        ">
                            {day.date.getDate()}
                        </span>

                        {#if log}
                            <div class="mt-1">
                                <div class="flex items-center gap-1">
                                    <span class="w-2 h-2 rounded-full {WorkLogTypeColors[log.type]}"></span>
                                    <span class="text-xs {day.isInPeriod ? 'text-zinc-600 dark:text-zinc-400' : 'text-zinc-400 dark:text-zinc-500'}">{formatHours(log.hours_worked)}</span>
                                </div>
                                {#if log.check_in && log.check_out}
                                    <span class="text-[10px] text-zinc-400 hidden sm:block">{formatTime(log.check_in)}-{formatTime(log.check_out)}</span>
                                {/if}
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
            <!-- Period Stats -->
            <div class="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-500/25 space-y-4">
                <h3 class="font-semibold">Period Summary</h3>
                
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                            <Clock class="w-4 h-4" />
                            <span class="text-sm">Total Hours</span>
                        </div>
                        <span class="font-semibold">{formatHours(monthStats().totalHours)}</span>
                    </div>

                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                            <Calendar class="w-4 h-4" />
                            <span class="text-sm">Work Days</span>
                        </div>
                        <span class="font-semibold">{monthStats().workDays}</span>
                    </div>

                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                            <Calendar class="w-4 h-4" />
                            <span class="text-sm">Vacation Days</span>
                        </div>
                        <span class="font-semibold">{monthStats().vacationDays}</span>
                    </div>
                </div>
            </div>

            <!-- Paycheck Card -->
            <div class="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-500/25 space-y-4">
                <div class="flex items-center justify-between">
                    <h3 class="font-semibold">Paycheck</h3>
                    {#if monthPaycheck}
                        <Button variant="ghost" size="sm" onclick={() => isPaycheckModalOpen = true}>Edit</Button>
                    {/if}
                </div>

                {#if monthPaycheck}
                    {@const convertedNet = toSelectedCurrency(monthPaycheck.net_amount, paycheckCurrency)}
                    {@const convertedGross = monthPaycheck.gross_amount ? toSelectedCurrency(monthPaycheck.gross_amount, paycheckCurrency) : null}
                    {@const convertedBonuses = monthPaycheck.bonuses > 0 ? toSelectedCurrency(monthPaycheck.bonuses, paycheckCurrency) : 0}
                    {@const periodHours = monthStats().totalHours}
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-zinc-600 dark:text-zinc-400">Net Amount</span>
                            <span class="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(convertedNet, selectedCurrency)}</span>
                        </div>
                        {#if convertedGross}
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-zinc-600 dark:text-zinc-400">Gross Amount</span>
                                <span class="text-sm">{formatCurrency(convertedGross, selectedCurrency)}</span>
                            </div>
                        {/if}
                        {#if convertedBonuses > 0}
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-zinc-600 dark:text-zinc-400">Bonuses</span>
                                <span class="text-sm text-emerald-600">+{formatCurrency(convertedBonuses, selectedCurrency)}</span>
                            </div>
                        {/if}
                        <div class="pt-3 border-t border-zinc-500/25">
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-zinc-600 dark:text-zinc-400">Hourly Rate</span>
                                <span class="font-semibold">
                                    {periodHours > 0 
                                        ? formatCurrency(convertedNet / periodHours, selectedCurrency) + '/h'
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
            <div class="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-500/25">
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
