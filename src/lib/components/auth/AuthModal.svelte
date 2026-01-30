<script>
    import { goto, invalidateAll } from '$app/navigation';
    import Modal from '$lib/components/ui/Modal.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Input from '$lib/components/ui/Input.svelte';

    let { isOpen = $bindable(false), onClose = () => {} } = $props();

    let email = $state('');
    let password = $state('');
    let loading = $state(false);
    let error = $state('');

    async function handleLogin(e) {
        e.preventDefault();
        loading = true;
        error = '';

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (result.success) {
                await invalidateAll();
                isOpen = false;
                goto('/app/timeline');
            } else {
                error = result.error;
            }
        } catch (err) {
            error = 'An error occurred. Please try again.';
        } finally {
            loading = false;
        }
    }
</script>

<Modal bind:isOpen title="Sign In" {onClose}>
    <form onsubmit={handleLogin} class="space-y-4">
        {#if error}
            <div class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                {error}
            </div>
        {/if}

        <Input
            type="email"
            label="Email"
            placeholder="you@example.com"
            bind:value={email}
            required
        />

        <Input
            type="password"
            label="Password"
            placeholder="••••••••"
            bind:value={password}
            required
        />

        <Button type="submit" variant="primary" class="w-full" {loading}>
            {loading ? 'Signing in...' : 'Sign In'}
        </Button>
    </form>
</Modal>
