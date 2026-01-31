<script>
    import { onMount, onDestroy } from 'svelte';
    import { paychecksStore } from '$lib/stores/paychecks.svelte.js';
    import { workLogsStore } from '$lib/stores/workLogs.svelte.js';
    import { positionsStore } from '$lib/stores/positions.svelte.js';
    import { settingsStore } from '$lib/stores/settings.js';
    import { currencyList } from '$lib/stores/currency.js';
    import { exchangeRates, fetchExchangeRates, convertCurrency } from '$lib/stores/exchangeRates.js';
    import { formatCurrency, formatHours } from '$lib/utils/format.js';
    import { 
        getPaycheckPeriodRef, 
        getTotalHoursInPeriod, 
        formatPayPeriod 
    } from '$lib/utils/period.js';
    import { TrendingUp, DollarSign, Clock, Calendar, BarChart3, Info, Table, Building2, ChevronLeft, ChevronRight } from 'lucide-svelte';
    import CustomSelect from '$lib/components/ui/CustomSelect.svelte';
    import ChartTooltip from '$lib/components/ui/ChartTooltip.svelte';
    import { Chart } from 'chart.js/auto';
    import { themeStore } from '$lib/components/theme/theme.js';
    import { Currency } from '$lib/const/currency';

    /** @typedef {{ year: string, value: number, color: string }} TooltipItem */
    /** @typedef {{ title: string, items: TooltipItem[], x: number, y: number }} TooltipData */

    let selectedCurrency = $state(Currency.EURO);
    /** @type {Record<string, number>} */
    let rates = $state({});
    let loadingRates = $state(false);
    let settings = $state({
        useCustomPeriod: false,
        periodStartDay: 16,
        periodEndDay: 15
    });
    let currentTheme = $state('light');

    // Chart references
    /** @type {HTMLCanvasElement | undefined} */
    let hourlyRateCanvas = $state(undefined);
    /** @type {HTMLCanvasElement | undefined} */
    let incomeCanvas = $state(undefined);
    /** @type {Chart | undefined} */
    let hourlyRateChart;
    /** @type {Chart | undefined} */
    let incomeChart;

    // Tooltip state
    let hourlyTooltipVisible = $state(false);
    /** @type {TooltipData} */
    let hourlyTooltipData = $state({ title: '', items: [], x: 0, y: 0 });
    let incomeTooltipVisible = $state(false);
    /** @type {TooltipData} */
    let incomeTooltipData = $state({ title: '', items: [], x: 0, y: 0 });

    // View mode for hourly rate chart
    let viewMode = $state('monthly'); // 'monthly' | 'quarterly' | 'yearly'

    // Pagination state for table
    let currentPage = $state(1);
    const rowsPerPage = 6;

    onMount(async () => {
        paychecksStore.fetch();
        positionsStore.fetch();
        workLogsStore.fetch();
        
        // Fetch exchange rates
        loadingRates = true;
        rates = await fetchExchangeRates();
        loadingRates = false;
    });

    onDestroy(() => {
        if (hourlyRateChart) hourlyRateChart.destroy();
        if (incomeChart) incomeChart.destroy();
    });

    // Subscribe to theme store
    $effect(() => {
        const unsubscribe = themeStore.subscribe(value => {
            currentTheme = value;
        });
        return unsubscribe;
    });

    // Subscribe to settings store
    $effect(() => {
        const unsubscribe = settingsStore.subscribe(value => {
            settings = value;
            if (value.defaultCurrency) {
                selectedCurrency = value.defaultCurrency;
            }
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

    // Get position currency for a paycheck
    /** @param {any} paycheck */
    function getPaycheckCurrency(paycheck) {
        const position = positionsStore.getById(paycheck.position_id);
        return position?.currency || Currency.EURO;
    }

    // Convert amount to selected currency
    /** @param {number} amount @param {string} fromCurrency */
    function toSelectedCurrency(amount, fromCurrency) {
        if (!fromCurrency || fromCurrency === selectedCurrency) return amount;
        return convertCurrency(amount, fromCurrency, selectedCurrency, rates);
    }

    // Get position info for a paycheck
    /** @param {any} paycheck */
    function getPaycheckPosition(paycheck) {
        return positionsStore.getById(paycheck.position_id);
    }

    // Calculate monthly hourly rates using pay period settings
    let hourlyRates = $derived(() => {
        const ratesList = [];
        const sortedPaychecks = [...paychecksStore.paychecks].sort(
            (a, b) => new Date(a.reference_date).getTime() - new Date(b.reference_date).getTime()
        );

        for (const paycheck of sortedPaychecks) {
            const { year, month } = getPaycheckPeriodRef(paycheck);
            const paycheckCurrency = getPaycheckCurrency(paycheck);
            const position = getPaycheckPosition(paycheck);
            
            // Use the centralized function that respects pay period settings
            const totalHours = getTotalHoursInPeriod(workLogsStore.workLogs, year, month, 'work');
            
            const convertedNetAmount = toSelectedCurrency(paycheck.net_amount, paycheckCurrency);
            const hourlyRate = totalHours > 0 ? convertedNetAmount / totalHours : 0;

            const date = new Date(paycheck.reference_date);
            const quarter = Math.floor(date.getMonth() / 3);

            ratesList.push({
                month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                monthShort: date.toLocaleDateString('en-US', { month: 'short' }),
                rate: hourlyRate,
                netAmount: convertedNetAmount,
                hours: totalHours,
                originalCurrency: paycheckCurrency,
                year,
                monthIndex: month,
                quarter,
                position: position ? {
                    jobTitle: position.job_title,
                    company: position.company?.name || 'Unknown',
                    companyLogo: position.company?.logo_url || null,
                    companyColor: position.company?.color_theme || null
                } : null
            });
        }

        return ratesList;
    });

    // Income progression with currency conversion
    let incomeProgression = $derived(() => {
        return [...paychecksStore.paychecks]
            .sort((a, b) => new Date(a.reference_date).getTime() - new Date(b.reference_date).getTime())
            .map(p => {
                const paycheckCurrency = getPaycheckCurrency(p);
                const convertedAmount = toSelectedCurrency(p.net_amount + p.bonuses, paycheckCurrency);
                const date = new Date(p.reference_date);
                return {
                    month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                    monthShort: date.toLocaleDateString('en-US', { month: 'short' }),
                    amount: convertedAmount,
                    originalCurrency: paycheckCurrency,
                    year: date.getFullYear(),
                    monthIndex: date.getMonth(),
                    quarter: Math.floor(date.getMonth() / 3)
                };
            });
    });

    // Summary stats with currency conversion
    let stats = $derived({
        avgHourlyRate: hourlyRates().length > 0 
            ? hourlyRates().reduce((sum, r) => sum + r.rate, 0) / hourlyRates().filter(r => r.rate > 0).length 
            : 0,
        avgMonthlyIncome: incomeProgression().length > 0
            ? incomeProgression().reduce((sum, i) => sum + i.amount, 0) / incomeProgression().length
            : 0,
        totalHoursLogged: workLogsStore.workLogs.reduce((sum, log) => sum + log.hours_worked, 0),
        totalPaychecks: paychecksStore.paychecks.length,
        totalEarnings: paychecksStore.paychecks.reduce((sum, p) => {
            const paycheckCurrency = getPaycheckCurrency(p);
            return sum + toSelectedCurrency(p.net_amount + p.bonuses, paycheckCurrency);
        }, 0)
    });

    // Prepare grouped data for hourly rate chart
    function prepareHourlyRateData() {
        const data = hourlyRates();
        if (!data.length) return { labels: [], datasets: [], years: [] };

        const years = [...new Set(data.map(d => d.year))].sort((a, b) => a - b);
        
        // Color palette
        const colors = [
            'oklch(0.7 0.15 160)', // teal
            'oklch(0.7 0.15 220)', // blue
            'oklch(0.7 0.15 280)', // purple
            'oklch(0.7 0.15 340)', // pink
            'oklch(0.7 0.15 40)',  // orange
        ];

        if (viewMode === 'monthly') {
            const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            const datasets = years.map((year, yearIndex) => {
                const yearData = data.filter(d => d.year === year);
                const monthlyData = monthLabels.map((_, monthIndex) => {
                    const item = yearData.find(d => d.monthIndex === monthIndex);
                    return item ? item.rate : 0;
                });

                return {
                    label: year.toString(),
                    data: monthlyData,
                    backgroundColor: colors[yearIndex % colors.length],
                    borderRadius: 6
                };
            });

            return { labels: monthLabels, datasets, years };
        } else if (viewMode === 'quarterly') {
            const quarterLabels = ['Q1', 'Q2', 'Q3', 'Q4'];
            
            const datasets = years.map((year, yearIndex) => {
                const yearData = data.filter(d => d.year === year);
                const quarterlyData = [0, 1, 2, 3].map(quarter => {
                    const items = yearData.filter(d => d.quarter === quarter);
                    if (items.length === 0) return 0;
                    const totalNet = items.reduce((sum, i) => sum + i.netAmount, 0);
                    const totalHours = items.reduce((sum, i) => sum + i.hours, 0);
                    return totalHours > 0 ? totalNet / totalHours : 0;
                });

                return {
                    label: year.toString(),
                    data: quarterlyData,
                    backgroundColor: colors[yearIndex % colors.length],
                    borderRadius: 6
                };
            });

            return { labels: quarterLabels, datasets, years };
        } else {
            // Yearly view
            const datasets = years.map((year, yearIndex) => {
                const yearData = data.filter(d => d.year === year);
                const totalNet = yearData.reduce((sum, i) => sum + i.netAmount, 0);
                const totalHours = yearData.reduce((sum, i) => sum + i.hours, 0);
                const avgRate = totalHours > 0 ? totalNet / totalHours : 0;

                return {
                    label: year.toString(),
                    data: [avgRate],
                    backgroundColor: colors[yearIndex % colors.length],
                    borderRadius: 6
                };
            });

            return { labels: ['Annual Average'], datasets, years };
        }
    }

    // Prepare data for income chart
    function prepareIncomeData() {
        const data = incomeProgression();
        if (!data.length) return { labels: [], datasets: [], years: [] };

        const years = [...new Set(data.map(d => d.year))].sort((a, b) => a - b);
        
        const colors = [
            'oklch(0.65 0.18 250)', // blue
            'oklch(0.65 0.18 280)', // indigo
            'oklch(0.65 0.18 310)', // purple
            'oklch(0.65 0.18 200)', // cyan
            'oklch(0.65 0.18 340)', // pink
        ];

        const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const datasets = years.map((year, yearIndex) => {
            const yearData = data.filter(d => d.year === year);
            const monthlyData = monthLabels.map((_, monthIndex) => {
                const item = yearData.find(d => d.monthIndex === monthIndex);
                return item ? item.amount : 0;
            });

            return {
                label: year.toString(),
                data: monthlyData,
                backgroundColor: colors[yearIndex % colors.length],
                borderRadius: 6
            };
        });

        return { labels: monthLabels, datasets, years };
    }

    // Render hourly rate chart
    function renderHourlyRateChart() {
        if (!hourlyRateCanvas) return;
        if (hourlyRateChart) hourlyRateChart.destroy();

        const { labels, datasets } = prepareHourlyRateData();
        if (!datasets.length) return;

        const ctx = hourlyRateCanvas.getContext('2d');
        if (!ctx) return;
        
        const gridColor = currentTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        const textColor = currentTheme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)';

        hourlyRateChart = new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        align: 'end',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            color: textColor
                        }
                    },
                    tooltip: {
                        enabled: false,
                        external: ({ tooltip: t }) => {
                            if (!t.opacity) {
                                hourlyTooltipVisible = false;
                                return;
                            }
                            
                            const dataIndex = t.dataPoints[0]?.dataIndex;
                            if (dataIndex === undefined) {
                                hourlyTooltipVisible = false;
                                return;
                            }
                            
                            if (!hourlyRateChart) return;
                            const label = hourlyRateChart.data.labels?.[dataIndex] || '';
                            /** @type {TooltipItem[]} */
                            const items = hourlyRateChart.data.datasets.map((/** @type {any} */ dataset) => ({
                                year: String(dataset.label || ''),
                                value: Number(dataset.data?.[dataIndex] || 0),
                                color: String(dataset.backgroundColor || '')
                            })).filter((/** @type {TooltipItem} */ item) => item.value > 0);
                            
                            hourlyTooltipData = {
                                title: label,
                                items,
                                x: t.caretX + 24,
                                y: t.caretY - 80
                            };
                            hourlyTooltipVisible = true;
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: gridColor },
                        border: { display: false },
                        ticks: { color: textColor }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: gridColor },
                        border: { display: false },
                        ticks: {
                            color: textColor,
                            callback: (value) => formatCurrency(Number(value), selectedCurrency)
                        }
                    }
                }
            }
        });
    }

    // Render income chart
    function renderIncomeChart() {
        if (!incomeCanvas) return;
        if (incomeChart) incomeChart.destroy();

        const { labels, datasets } = prepareIncomeData();
        if (!datasets.length) return;

        const ctx = incomeCanvas.getContext('2d');
        if (!ctx) return;
        
        const gridColor = currentTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        const textColor = currentTheme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)';

        incomeChart = new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        align: 'end',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            color: textColor
                        }
                    },
                    tooltip: {
                        enabled: false,
                        external: ({ tooltip: t }) => {
                            if (!t.opacity) {
                                incomeTooltipVisible = false;
                                return;
                            }
                            
                            const dataIndex = t.dataPoints[0]?.dataIndex;
                            if (dataIndex === undefined) {
                                incomeTooltipVisible = false;
                                return;
                            }
                            
                            if (!incomeChart) return;
                            const label = incomeChart.data.labels?.[dataIndex] || '';
                            /** @type {TooltipItem[]} */
                            const items = incomeChart.data.datasets.map((/** @type {any} */ dataset) => ({
                                year: String(dataset.label || ''),
                                value: Number(dataset.data?.[dataIndex] || 0),
                                color: String(dataset.backgroundColor || '')
                            })).filter((/** @type {TooltipItem} */ item) => item.value > 0);
                            
                            incomeTooltipData = {
                                title: label,
                                items,
                                x: t.caretX + 24,
                                y: t.caretY - 80
                            };
                            incomeTooltipVisible = true;
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: gridColor },
                        border: { display: false },
                        ticks: { color: textColor }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: gridColor },
                        border: { display: false },
                        ticks: {
                            color: textColor,
                            callback: (value) => formatCurrency(Number(value), selectedCurrency)
                        }
                    }
                }
            }
        });
    }

    // Re-render charts when data or settings change
    $effect(() => {
        if (hourlyRates().length > 0 && hourlyRateCanvas) {
            renderHourlyRateChart();
        }
    });

    $effect(() => {
        if (incomeProgression().length > 0 && incomeCanvas) {
            renderIncomeChart();
        }
    });

    // Re-render on view mode change
    $effect(() => {
        if (viewMode && hourlyRateCanvas) {
            renderHourlyRateChart();
        }
    });

    // Re-render on theme change
    $effect(() => {
        if (currentTheme) {
            setTimeout(() => {
                renderHourlyRateChart();
                renderIncomeChart();
            }, 50);
        }
    });

    // Currency options for select
    let currencyOptions = currencyList.map(c => ({
        id: c.code,
        name: `${c.code} (${c.symbol})`
    }));

    // Period info text
    let periodInfoText = $derived(() => {
        if (settings.useCustomPeriod) {
            return `Using custom pay period: ${settings.periodStartDay}th of previous month to ${settings.periodEndDay}th of current month`;
        }
        return 'Using standard period: 1st to last day of each month';
    });

    // Pagination helpers
    let paginatedData = $derived(() => {
        const allData = [...hourlyRates()].reverse();
        const startIndex = (currentPage - 1) * rowsPerPage;
        return allData.slice(startIndex, startIndex + rowsPerPage);
    });

    let totalPages = $derived(Math.ceil(hourlyRates().length / rowsPerPage));

    /** @param {number} page */
    function goToPage(page) {
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
        }
    }

    // Reset page when data changes
    $effect(() => {
        if (hourlyRates().length > 0 && currentPage > totalPages) {
            currentPage = 1;
        }
    });
</script>

<svelte:head>
    <title>Analytics | Shift</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold">Analytics</h1>
            <p class="text-zinc-600 dark:text-zinc-400">Insights into your career earnings and performance</p>
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
        </div>
    </div>

    <!-- Period Info Banner -->
    <div class="flex items-center gap-3 p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 text-sm text-zinc-600 dark:text-zinc-400">
        <Info class="w-4 h-4 shrink-0" />
        <span>{periodInfoText()}</span>
        <a href="/app/settings" class="ml-auto text-zinc-900 dark:text-zinc-100 hover:underline">
            Change in Settings
        </a>
    </div>

    <!-- Summary Stats -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-500/25">
            <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <DollarSign class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span class="text-sm text-zinc-600 dark:text-zinc-400">Avg Hourly Rate</span>
            </div>
            <p class="text-2xl font-bold">{formatCurrency(stats.avgHourlyRate, selectedCurrency)}/h</p>
        </div>

        <div class="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-500/25">
            <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <TrendingUp class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span class="text-sm text-zinc-600 dark:text-zinc-400">Avg Monthly Income</span>
            </div>
            <p class="text-2xl font-bold">{formatCurrency(stats.avgMonthlyIncome, selectedCurrency)}</p>
        </div>

        <div class="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-500/25">
            <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Clock class="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span class="text-sm text-zinc-600 dark:text-zinc-400">Total Hours Logged</span>
            </div>
            <p class="text-2xl font-bold">{formatHours(stats.totalHoursLogged)}</p>
        </div>

        <div class="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-500/25">
            <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Calendar class="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <span class="text-sm text-zinc-600 dark:text-zinc-400">Total Earnings</span>
            </div>
            <p class="text-2xl font-bold">{formatCurrency(stats.totalEarnings, selectedCurrency)}</p>
        </div>
    </div>

    <!-- Charts -->
    <div class="grid lg:grid-cols-2 gap-6">
        <!-- Real Hourly Rate Chart -->
        <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-500/25 overflow-hidden">
            <div class="p-5 border-b border-zinc-500/25 flex flex-col sm:flex-row sm:items-center gap-4">
                <div class="flex items-center gap-3 flex-1">
                    <div class="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                        <DollarSign class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h3 class="font-semibold">Real Hourly Rate</h3>
                        <p class="text-xs text-zinc-500">
                            {viewMode === 'monthly' ? 'Grouped by month' : viewMode === 'quarterly' ? 'Grouped by quarter' : 'Annual average'}
                        </p>
                    </div>
                </div>
                
                <div class="flex rounded-lg border border-zinc-500/25 overflow-hidden">
                    <button 
                        class="px-3 py-1.5 text-xs font-medium transition-colors
                            {viewMode === 'monthly' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-white dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'}"
                        onclick={() => viewMode = 'monthly'}
                    >
                        Monthly
                    </button>
                    <button 
                        class="px-3 py-1.5 text-xs font-medium transition-colors border-l border-zinc-500/25
                            {viewMode === 'quarterly' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-white dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'}"
                        onclick={() => viewMode = 'quarterly'}
                    >
                        Quarterly
                    </button>
                    <button 
                        class="px-3 py-1.5 text-xs font-medium transition-colors border-l border-zinc-500/25
                            {viewMode === 'yearly' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-white dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'}"
                        onclick={() => viewMode = 'yearly'}
                    >
                        Yearly
                    </button>
                </div>
            </div>

            <div class="p-5 relative">
                {#if hourlyRates().length === 0}
                    <div class="flex flex-col items-center justify-center py-12 text-zinc-500">
                        <BarChart3 class="w-12 h-12 mb-4" />
                        <p>No data available yet</p>
                        <p class="text-sm">Add paychecks and work logs to see your hourly rate</p>
                    </div>
                {:else}
                    <div class="h-72">
                        <canvas bind:this={hourlyRateCanvas}></canvas>
                    </div>
                    <p class="mt-3 text-xs text-zinc-500">
                        Calculated as Net Pay / Hours Worked per pay period
                    </p>
                {/if}
                
                <ChartTooltip visible={hourlyTooltipVisible} x={hourlyTooltipData.x} y={hourlyTooltipData.y} position="top">
                    <div class="p-3">
                        <p class="text-sm font-medium">{hourlyTooltipData.title}</p>
                    </div>
                    <hr class="border-zinc-500/25"/>
                    <div class="flex flex-col gap-2 p-3">
                        {#each hourlyTooltipData.items as item}
                            <div class="flex items-center gap-2">
                                <div class="size-2 rounded-full" style="background-color: {item.color};"></div>
                                <span class="text-xs text-zinc-500">{item.year}:</span>
                                <span class="text-sm font-medium">{formatCurrency(item.value, selectedCurrency)}/h</span>
                            </div>
                        {/each}
                    </div>
                </ChartTooltip>
            </div>
        </div>

        <!-- Income Progression Chart -->
        <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-500/25 overflow-hidden">
            <div class="p-5 border-b border-zinc-500/25 flex items-center gap-3">
                <div class="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <TrendingUp class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h3 class="font-semibold">Income Progression</h3>
                    <p class="text-xs text-zinc-500">Grouped by month across years</p>
                </div>
            </div>

            <div class="p-5 relative">
                {#if incomeProgression().length === 0}
                    <div class="flex flex-col items-center justify-center py-12 text-zinc-500">
                        <TrendingUp class="w-12 h-12 mb-4" />
                        <p>No data available yet</p>
                        <p class="text-sm">Add paychecks to see your income progression</p>
                    </div>
                {:else}
                    <div class="h-72">
                        <canvas bind:this={incomeCanvas}></canvas>
                    </div>
                    <p class="mt-3 text-xs text-zinc-500">
                        Net amount + bonuses per month
                    </p>
                {/if}
                
                <ChartTooltip visible={incomeTooltipVisible} x={incomeTooltipData.x} y={incomeTooltipData.y} position="top">
                    <div class="p-3">
                        <p class="text-sm font-medium">{incomeTooltipData.title}</p>
                    </div>
                    <hr class="border-zinc-500/25"/>
                    <div class="flex flex-col gap-2 p-3">
                        {#each incomeTooltipData.items as item}
                            <div class="flex items-center gap-2">
                                <div class="size-2 rounded-full" style="background-color: {item.color};"></div>
                                <span class="text-xs text-zinc-500">{item.year}:</span>
                                <span class="text-sm font-medium">{formatCurrency(item.value, selectedCurrency)}</span>
                            </div>
                        {/each}
                    </div>
                </ChartTooltip>
            </div>
        </div>
    </div>

    <!-- Detailed Table -->
    <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-500/25 overflow-hidden">
        <div class="p-5 border-b border-zinc-500/25 flex items-center gap-3">
            <div class="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Table class="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
                <h3 class="font-semibold">Monthly Breakdown</h3>
                {#if settings.useCustomPeriod}
                    <p class="text-xs text-zinc-500">Hours calculated using custom pay period</p>
                {:else}
                    <p class="text-xs text-zinc-500">Detailed view of earnings per month</p>
                {/if}
            </div>
        </div>
        
        {#if hourlyRates().length === 0}
            <div class="p-12 text-center text-zinc-500">
                <Table class="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No paychecks recorded yet</p>
                <p class="text-sm mt-1">Add paychecks to see your monthly breakdown</p>
            </div>
        {:else}
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-zinc-500/25">
                            <th class="text-left px-5 py-3 text-sm font-medium text-zinc-500">Month</th>
                            <th class="text-left px-5 py-3 text-sm font-medium text-zinc-500">Position</th>
                            {#if settings.useCustomPeriod}
                                <th class="text-left px-5 py-3 text-sm font-medium text-zinc-500">Pay Period</th>
                            {/if}
                            <th class="text-right px-5 py-3 text-sm font-medium text-zinc-500">Hours</th>
                            <th class="text-right px-5 py-3 text-sm font-medium text-zinc-500">Net Pay</th>
                            <th class="text-right px-5 py-3 text-sm font-medium text-zinc-500">Hourly Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each paginatedData() as item}
                            <tr class="border-b border-zinc-500/15 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 h-16">
                                <td class="px-5 py-3 text-sm">{item.month}</td>
                                <td class="px-5 py-3">
                                    {#if item.position}
                                        <div class="flex items-center gap-2.5">
                                            {#if item.position.companyLogo}
                                                <img 
                                                    src={item.position.companyLogo} 
                                                    alt={item.position.company}
                                                    class="w-8 h-8 rounded-lg object-cover"
                                                />
                                            {:else if item.position.companyColor}
                                                <div 
                                                    class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                                                    style="background-color: {item.position.companyColor}"
                                                >
                                                    {item.position.company.charAt(0).toUpperCase()}
                                                </div>
                                            {:else}
                                                <div class="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                                    <Building2 class="w-4 h-4 text-zinc-400" />
                                                </div>
                                            {/if}
                                            <div class="min-w-0">
                                                <p class="text-sm font-medium truncate">{item.position.jobTitle}</p>
                                                <p class="text-xs text-zinc-500 truncate">{item.position.company}</p>
                                            </div>
                                        </div>
                                    {:else}
                                        <span class="text-sm text-zinc-400">—</span>
                                    {/if}
                                </td>
                                {#if settings.useCustomPeriod}
                                    <td class="px-5 py-3 text-sm text-zinc-500">{formatPayPeriod(item.year, item.monthIndex, { showYear: false })}</td>
                                {/if}
                                <td class="px-5 py-3 text-sm text-right">{formatHours(item.hours)}</td>
                                <td class="px-5 py-3 text-sm text-right">{formatCurrency(item.netAmount, selectedCurrency)}</td>
                                <td class="px-5 py-3 text-sm text-right font-medium {item.rate > stats.avgHourlyRate ? 'text-emerald-600 dark:text-emerald-400' : ''}">
                                    {item.rate > 0 ? formatCurrency(item.rate, selectedCurrency) + '/h' : '—'}
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            {#if totalPages > 1}
                <div class="px-5 py-4 border-t border-zinc-500/25 flex items-center justify-between">
                    <p class="text-sm text-zinc-500">
                        Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, hourlyRates().length)} of {hourlyRates().length} entries
                    </p>
                    <div class="flex items-center gap-1">
                        <button
                            type="button"
                            onclick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            class="p-2 rounded-lg border border-zinc-500/25 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft class="w-4 h-4" />
                        </button>
                        
                        {#each Array.from({ length: totalPages }, (_, i) => i + 1) as page}
                            {#if page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)}
                                <button
                                    type="button"
                                    onclick={() => goToPage(page)}
                                    class="w-9 h-9 rounded-lg text-sm font-medium transition-colors
                                        {page === currentPage 
                                            ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' 
                                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}"
                                >
                                    {page}
                                </button>
                            {:else if page === currentPage - 2 || page === currentPage + 2}
                                <span class="px-1 text-zinc-400">...</span>
                            {/if}
                        {/each}
                        
                        <button
                            type="button"
                            onclick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            class="p-2 rounded-lg border border-zinc-500/25 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronRight class="w-4 h-4" />
                        </button>
                    </div>
                </div>
            {/if}
        {/if}
    </div>
</div>
