<script>
    import { onMount } from 'svelte';
    import { paychecksStore } from '$lib/stores/paychecks.svelte.js';
    import { workLogsStore } from '$lib/stores/workLogs.svelte.js';
    import { positionsStore } from '$lib/stores/positions.svelte.js';
    import { formatCurrency, formatHours } from '$lib/utils/format.js';
    import { TrendingUp, TrendingDown, DollarSign, Clock, Calendar, BarChart3 } from 'lucide-svelte';

    onMount(() => {
        paychecksStore.fetch();
        positionsStore.fetch();
        // Fetch all work logs (no month filter)
        workLogsStore.fetch();
    });

    // Calculate monthly hourly rates
    let hourlyRates = $derived(() => {
        const rates = [];
        const sortedPaychecks = [...paychecksStore.paychecks].sort(
            (a, b) => new Date(a.reference_date).getTime() - new Date(b.reference_date).getTime()
        );

        for (const paycheck of sortedPaychecks.slice(-12)) {
            const date = new Date(paycheck.reference_date);
            const year = date.getFullYear();
            const month = date.getMonth();
            
            const monthLogs = workLogsStore.workLogs.filter(log => {
                const logDate = new Date(log.date);
                return logDate.getFullYear() === year && logDate.getMonth() === month && log.type === 'work';
            });
            
            const totalHours = monthLogs.reduce((sum, log) => sum + log.hours_worked, 0);
            const hourlyRate = totalHours > 0 ? paycheck.net_amount / totalHours : 0;

            rates.push({
                month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                rate: hourlyRate,
                netAmount: paycheck.net_amount,
                hours: totalHours
            });
        }

        return rates;
    });

    // Income progression
    let incomeProgression = $derived(() => {
        return [...paychecksStore.paychecks]
            .sort((a, b) => new Date(a.reference_date).getTime() - new Date(b.reference_date).getTime())
            .slice(-12)
            .map(p => ({
                month: new Date(p.reference_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                amount: p.net_amount + p.bonuses
            }));
    });

    // Summary stats
    let stats = $derived({
        avgHourlyRate: hourlyRates().length > 0 
            ? hourlyRates().reduce((sum, r) => sum + r.rate, 0) / hourlyRates().filter(r => r.rate > 0).length 
            : 0,
        avgMonthlyIncome: incomeProgression().length > 0
            ? incomeProgression().reduce((sum, i) => sum + i.amount, 0) / incomeProgression().length
            : 0,
        totalHoursLogged: workLogsStore.workLogs.reduce((sum, log) => sum + log.hours_worked, 0),
        totalPaychecks: paychecksStore.paychecks.length
    });

    // Calculate max for scaling
    let maxRate = $derived(Math.max(...hourlyRates().map(r => r.rate), 1));
    let maxIncome = $derived(Math.max(...incomeProgression().map(i => i.amount), 1));
</script>

<svelte:head>
    <title>Analytics | Shift</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
    <!-- Header -->
    <div>
        <h1 class="text-2xl font-bold">Analytics</h1>
        <p class="text-zinc-600 dark:text-zinc-400">Insights into your career earnings and performance</p>
    </div>

    <!-- Summary Stats -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <DollarSign class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span class="text-sm text-zinc-600 dark:text-zinc-400">Avg Hourly Rate</span>
            </div>
            <p class="text-2xl font-bold">{formatCurrency(stats.avgHourlyRate)}/h</p>
        </div>

        <div class="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <TrendingUp class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span class="text-sm text-zinc-600 dark:text-zinc-400">Avg Monthly Income</span>
            </div>
            <p class="text-2xl font-bold">{formatCurrency(stats.avgMonthlyIncome)}</p>
        </div>

        <div class="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Clock class="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span class="text-sm text-zinc-600 dark:text-zinc-400">Total Hours Logged</span>
            </div>
            <p class="text-2xl font-bold">{formatHours(stats.totalHoursLogged)}</p>
        </div>

        <div class="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Calendar class="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <span class="text-sm text-zinc-600 dark:text-zinc-400">Paychecks Recorded</span>
            </div>
            <p class="text-2xl font-bold">{stats.totalPaychecks}</p>
        </div>
    </div>

    <!-- Charts -->
    <div class="grid lg:grid-cols-2 gap-6">
        <!-- Real Hourly Rate Chart -->
        <div class="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <h3 class="font-semibold mb-6">Real Hourly Rate</h3>
            
            {#if hourlyRates().length === 0}
                <div class="flex flex-col items-center justify-center py-12 text-zinc-500">
                    <BarChart3 class="w-12 h-12 mb-4" />
                    <p>No data available yet</p>
                    <p class="text-sm">Add paychecks and work logs to see your hourly rate</p>
                </div>
            {:else}
                <div class="space-y-3">
                    {#each hourlyRates() as item}
                        <div class="flex items-center gap-4">
                            <span class="w-16 text-sm text-zinc-500">{item.month}</span>
                            <div class="flex-1 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden">
                                <div 
                                    class="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg transition-all duration-500"
                                    style="width: {(item.rate / maxRate) * 100}%"
                                ></div>
                            </div>
                            <span class="w-20 text-right font-medium">
                                {item.rate > 0 ? formatCurrency(item.rate) : '—'}
                            </span>
                        </div>
                    {/each}
                </div>
                <p class="mt-4 text-xs text-zinc-500">
                    Calculated as Net Pay / Hours Worked per month
                </p>
            {/if}
        </div>

        <!-- Income Progression Chart -->
        <div class="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <h3 class="font-semibold mb-6">Income Progression</h3>
            
            {#if incomeProgression().length === 0}
                <div class="flex flex-col items-center justify-center py-12 text-zinc-500">
                    <TrendingUp class="w-12 h-12 mb-4" />
                    <p>No data available yet</p>
                    <p class="text-sm">Add paychecks to see your income progression</p>
                </div>
            {:else}
                <div class="space-y-3">
                    {#each incomeProgression() as item}
                        <div class="flex items-center gap-4">
                            <span class="w-16 text-sm text-zinc-500">{item.month}</span>
                            <div class="flex-1 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden">
                                <div 
                                    class="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg transition-all duration-500"
                                    style="width: {(item.amount / maxIncome) * 100}%"
                                ></div>
                            </div>
                            <span class="w-20 text-right font-medium">
                                {formatCurrency(item.amount)}
                            </span>
                        </div>
                    {/each}
                </div>
                <p class="mt-4 text-xs text-zinc-500">
                    Net amount + bonuses per month
                </p>
            {/if}
        </div>
    </div>

    <!-- Detailed Table -->
    <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div class="p-6 border-b border-zinc-200 dark:border-zinc-800">
            <h3 class="font-semibold">Monthly Breakdown</h3>
        </div>
        
        {#if hourlyRates().length === 0}
            <div class="p-12 text-center text-zinc-500">
                No paychecks recorded yet
            </div>
        {:else}
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-zinc-200 dark:border-zinc-800">
                            <th class="text-left px-6 py-3 text-sm font-medium text-zinc-500">Month</th>
                            <th class="text-right px-6 py-3 text-sm font-medium text-zinc-500">Hours</th>
                            <th class="text-right px-6 py-3 text-sm font-medium text-zinc-500">Net Pay</th>
                            <th class="text-right px-6 py-3 text-sm font-medium text-zinc-500">Hourly Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each [...hourlyRates()].reverse() as item}
                            <tr class="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                <td class="px-6 py-4 text-sm">{item.month}</td>
                                <td class="px-6 py-4 text-sm text-right">{formatHours(item.hours)}</td>
                                <td class="px-6 py-4 text-sm text-right">{formatCurrency(item.netAmount)}</td>
                                <td class="px-6 py-4 text-sm text-right font-medium {item.rate > stats.avgHourlyRate ? 'text-emerald-600 dark:text-emerald-400' : ''}">
                                    {item.rate > 0 ? formatCurrency(item.rate) + '/h' : '—'}
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    </div>
</div>
