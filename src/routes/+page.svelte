<script>
    import { goto } from '$app/navigation';
    import { Briefcase, Calendar, TrendingUp, Clock, Shield, Zap, ChevronRight } from 'lucide-svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import AuthModal from '$lib/components/auth/AuthModal.svelte';
    import ThemeToggle from '$lib/components/theme/ThemeToggle.svelte';

    let { data } = $props();
    let { session } = $derived(data);

    let isAuthModalOpen = $state(false);

    $effect(() => {
        if (session) {
            goto('/app/timeline');
        }
    });

    const features = [
        {
            icon: Briefcase,
            title: 'Career Timeline',
            description: 'Visualize your entire career journey with an interactive timeline of all positions held.'
        },
        {
            icon: Calendar,
            title: 'Work Logging',
            description: 'Track daily hours, vacation days, sick leave, and your mood with an intuitive calendar interface.'
        },
        {
            icon: TrendingUp,
            title: 'Analytics',
            description: 'Understand your real hourly rate and income progression with powerful visualizations.'
        },
        {
            icon: Clock,
            title: 'Time Tracking',
            description: 'Log your work hours daily and see exactly how much time you invest in your career.'
        },
        {
            icon: Shield,
            title: 'Private & Secure',
            description: 'Your career data is encrypted and only accessible to you. No sharing, no compromises.'
        },
        {
            icon: Zap,
            title: 'FinTrack Integration',
            description: 'Sync your paychecks directly to your budget tracker for seamless financial management.'
        }
    ];
</script>

<svelte:head>
    <title>Shift - Career & Job Tracking</title>
    <meta name="description" content="Track your entire career journey. Log work hours, manage paychecks, and gain insights into your professional growth." />
</svelte:head>

<AuthModal bind:isOpen={isAuthModalOpen} />

<!-- Header -->
<header class="fixed top-0 left-0 right-0 z-40 bg-zinc-50/80 dark:bg-zinc-925/80 backdrop-blur-md border-b border-zinc-500/25">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
            <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
                    <Briefcase class="w-4 h-4 text-white dark:text-zinc-900" />
                </div>
                <span class="text-xl font-bold">Shift</span>
            </div>

            <div class="flex items-center gap-3">
                <ThemeToggle />
                <Button onclick={() => isAuthModalOpen = true}>
                    Sign In
                </Button>
            </div>
        </div>
    </div>
</header>

<!-- Hero Section -->
<section class="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Your Career,
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
                Organized
            </span>
        </h1>
        <p class="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-8">
            Track your entire career journey. Log work hours, manage paychecks, and gain insights into your professional growth with a personal Career CRM.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onclick={() => isAuthModalOpen = true} size="lg" class="gap-2">
                Get Started
                <ChevronRight class="w-4 h-4" />
            </Button>
            <Button variant="outline" size="lg" onclick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                Learn More
            </Button>
        </div>
    </div>
</section>

<!-- Features Section -->
<section id="features" class="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-zinc-900">
    <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
            <h2 class="text-3xl sm:text-4xl font-bold mb-4">Everything you need to track your career</h2>
            <p class="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                From daily work logs to long-term career insights, Shift helps you understand and optimize your professional journey.
            </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {#each features as feature}
                <div class="p-6 rounded-xl border border-zinc-500/25 hover:border-zinc-500/40 transition-colors bg-zinc-50 dark:bg-zinc-800/50">
                    <div class="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                        <feature.icon class="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 class="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p class="text-zinc-600 dark:text-zinc-400 text-sm">{feature.description}</p>
                </div>
            {/each}
        </div>
    </div>
</section>

<!-- Stats Preview Section -->
<section class="py-20 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
        <div class="grid sm:grid-cols-3 gap-8 text-center">
            <div class="p-6">
                <div class="text-4xl font-bold text-emerald-500 mb-2">100%</div>
                <div class="text-zinc-600 dark:text-zinc-400">Private & Secure</div>
            </div>
            <div class="p-6">
                <div class="text-4xl font-bold text-emerald-500 mb-2">Real-time</div>
                <div class="text-zinc-600 dark:text-zinc-400">Hourly Rate Insights</div>
            </div>
            <div class="p-6">
                <div class="text-4xl font-bold text-emerald-500 mb-2">Seamless</div>
                <div class="text-zinc-600 dark:text-zinc-400">Budget Integration</div>
            </div>
        </div>
    </div>
</section>

<!-- CTA Section -->
<section class="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900 dark:bg-zinc-800">
    <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to take control of your career?</h2>
        <p class="text-zinc-400 mb-8">Start tracking your professional journey today.</p>
        <Button onclick={() => isAuthModalOpen = true} size="lg" variant="success" class="gap-2">
            Sign In to Get Started
            <ChevronRight class="w-4 h-4" />
        </Button>
    </div>
</section>

<!-- Footer -->
<footer class="py-8 px-4 sm:px-6 lg:px-8 border-t border-zinc-500/25">
    <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
                <Briefcase class="w-3 h-3 text-white dark:text-zinc-900" />
            </div>
            <span class="font-semibold">Shift</span>
        </div>
        <p class="text-sm text-zinc-500">A personal career tracking application.</p>
    </div>
</footer>
