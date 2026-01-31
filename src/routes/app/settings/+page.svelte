<script>
    import { settingsStore } from '$lib/stores/settings.js';
    import { currencyList } from '$lib/stores/currency.js';
    import { Currency } from '$lib/const/currency';
    import { Settings, Calendar, Banknote, RotateCcw } from 'lucide-svelte';

    import CustomSelect from '$lib/components/ui/CustomSelect.svelte';

    // Local state bound to the store
    let weekStartsOnMonday = $state(true);
    let useCustomPeriod = $state(false);
    let periodStartDay = $state('16');
    let periodEndDay = $state('15');
    let defaultCurrency = $state(Currency.EURO);

    // Sync with store on mount
    $effect(() => {
        const unsubscribe = settingsStore.subscribe(settings => {
            weekStartsOnMonday = settings.weekStartsOnMonday;
            useCustomPeriod = settings.useCustomPeriod;
            periodStartDay = settings.periodStartDay.toString();
            periodEndDay = settings.periodEndDay.toString();
            defaultCurrency = settings.defaultCurrency;
        });
        return unsubscribe;
    });

    function saveWeekStart(value) {
        weekStartsOnMonday = value;
        settingsStore.setSetting('weekStartsOnMonday', value);
    }

    function saveUseCustomPeriod(value) {
        useCustomPeriod = value;
        settingsStore.setSetting('useCustomPeriod', value);
    }

    function savePeriodStartDay() {
        const day = parseInt(periodStartDay) || 1;
        const clamped = Math.max(1, Math.min(28, day));
        periodStartDay = clamped.toString();
        settingsStore.setSetting('periodStartDay', clamped);
    }

    function savePeriodEndDay() {
        const day = parseInt(periodEndDay) || 28;
        const clamped = Math.max(1, Math.min(28, day));
        periodEndDay = clamped.toString();
        settingsStore.setSetting('periodEndDay', clamped);
    }

    function saveDefaultCurrency(value) {
        defaultCurrency = value;
        settingsStore.setSetting('defaultCurrency', value);
    }

    function resetSettings() {
        if (confirm('Reset all settings to defaults?')) {
            settingsStore.reset();
        }
    }

    // Generate day options (1-28 to be safe for all months)
    const dayOptions = Array.from({ length: 28 }, (_, i) => ({
        id: (i + 1).toString(),
        name: `${i + 1}${getOrdinalSuffix(i + 1)}`
    }));

    function getOrdinalSuffix(n) {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    }

    // Currency options
    let currencyOptions = currencyList.map(c => ({
        id: c.code,
        name: `${c.code} (${c.symbol}) - ${c.name}`
    }));

    // Preview of the pay period
    let periodPreview = $derived(() => {
        if (!useCustomPeriod) {
            return 'Standard: 1st to last day of each month';
        }
        return `Custom: ${periodStartDay}${getOrdinalSuffix(parseInt(periodStartDay))} of previous month to ${periodEndDay}${getOrdinalSuffix(parseInt(periodEndDay))} of current month`;
    });
</script>

<svelte:head>
    <title>Settings | Shift</title>
</svelte:head>

<div class="max-w-2xl mx-auto space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold">Settings</h1>
            <p class="text-zinc-600 dark:text-zinc-400">Customize your Shift experience</p>
        </div>
        <button
            type="button"
            onclick={resetSettings}
            class="p-2 rounded-lg border border-zinc-500/25 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500"
            title="Reset to defaults"
        >
            <RotateCcw class="w-5 h-5" />
        </button>
    </div>

    <!-- Calendar Settings -->
    <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-500/25 overflow-hidden">
        <div class="px-6 py-4 border-b border-zinc-500/25 flex items-center gap-3">
            <Calendar class="w-5 h-5 text-zinc-500" />
            <h2 class="font-semibold">Calendar</h2>
        </div>
        
        <div class="p-6 space-y-6">
            <!-- Week Start Day -->
            <div>
                <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                    Week starts on
                </label>
                <div class="flex gap-3">
                    <button
                        type="button"
                        onclick={() => saveWeekStart(true)}
                        class="flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-colors
                            {weekStartsOnMonday 
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' 
                                : 'border-zinc-500/25 hover:bg-zinc-50 dark:hover:bg-zinc-800'}"
                    >
                        Monday
                    </button>
                    <button
                        type="button"
                        onclick={() => saveWeekStart(false)}
                        class="flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-colors
                            {!weekStartsOnMonday 
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' 
                                : 'border-zinc-500/25 hover:bg-zinc-50 dark:hover:bg-zinc-800'}"
                    >
                        Sunday
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Pay Period Settings -->
    <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-500/25 overflow-hidden">
        <div class="px-6 py-4 border-b border-zinc-500/25 flex items-center gap-3">
            <Banknote class="w-5 h-5 text-zinc-500" />
            <h2 class="font-semibold">Pay Period</h2>
        </div>
        
        <div class="p-6 space-y-6">
            <!-- Period Type -->
            <div>
                <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                    How hours are calculated for paychecks
                </label>
                <div class="space-y-3">
                    <button
                        type="button"
                        onclick={() => saveUseCustomPeriod(false)}
                        class="w-full px-4 py-3 rounded-lg border text-left transition-colors
                            {!useCustomPeriod 
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                                : 'border-zinc-500/25 hover:bg-zinc-50 dark:hover:bg-zinc-800'}"
                    >
                        <span class="block font-medium {!useCustomPeriod ? 'text-emerald-700 dark:text-emerald-400' : ''}">
                            Standard (Calendar Month)
                        </span>
                        <span class="block text-sm text-zinc-500 mt-1">
                            Hours from 1st to last day of the month
                        </span>
                    </button>
                    <button
                        type="button"
                        onclick={() => saveUseCustomPeriod(true)}
                        class="w-full px-4 py-3 rounded-lg border text-left transition-colors
                            {useCustomPeriod 
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                                : 'border-zinc-500/25 hover:bg-zinc-50 dark:hover:bg-zinc-800'}"
                    >
                        <span class="block font-medium {useCustomPeriod ? 'text-emerald-700 dark:text-emerald-400' : ''}">
                            Custom Period
                        </span>
                        <span class="block text-sm text-zinc-500 mt-1">
                            Set custom start and end days (e.g., 16th to 15th)
                        </span>
                    </button>
                </div>
            </div>

            <!-- Custom Period Days -->
            {#if useCustomPeriod}
                <div class="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Period starts on
                            </label>
                            <div class="flex items-center gap-2">
                                <CustomSelect
                                    bind:value={periodStartDay}
                                    options={dayOptions}
                                    labelKey="name"
                                    valueKey="id"
                                    searchable={false}
                                    classes="flex-1"
                                    onchange={savePeriodStartDay}
                                />
                                <span class="text-sm text-zinc-500">of prev. month</span>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Period ends on
                            </label>
                            <div class="flex items-center gap-2">
                                <CustomSelect
                                    bind:value={periodEndDay}
                                    options={dayOptions}
                                    labelKey="name"
                                    valueKey="id"
                                    searchable={false}
                                    classes="flex-1"
                                    onchange={savePeriodEndDay}
                                />
                                <span class="text-sm text-zinc-500">of curr. month</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="pt-3 border-t border-zinc-500/25">
                        <p class="text-sm text-zinc-600 dark:text-zinc-400">
                            <strong>Example for January 2026:</strong><br>
                            Hours from December {periodStartDay}, 2025 to January {periodEndDay}, 2026
                        </p>
                    </div>
                </div>
            {/if}
        </div>
    </div>

    <!-- Display Settings -->
    <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-500/25 overflow-hidden">
        <div class="px-6 py-4 border-b border-zinc-500/25 flex items-center gap-3">
            <Settings class="w-5 h-5 text-zinc-500" />
            <h2 class="font-semibold">Display</h2>
        </div>
        
        <div class="p-6 space-y-6">
            <!-- Default Currency -->
            <div>
                <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Default currency
                </label>
                <CustomSelect
                    bind:value={defaultCurrency}
                    options={currencyOptions}
                    labelKey="name"
                    valueKey="id"
                    searchable={true}
                    classes="w-full"
                    onchange={() => saveDefaultCurrency(defaultCurrency)}
                />
                <p class="text-sm text-zinc-500 mt-2">
                    This will be the default currency when viewing analytics and totals
                </p>
            </div>
        </div>
    </div>

    <!-- Info -->
    <div class="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p class="text-sm text-blue-700 dark:text-blue-300">
            <strong>Note:</strong> Settings are stored locally in your browser and will persist across sessions.
        </p>
    </div>
</div>
