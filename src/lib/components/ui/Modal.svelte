<script>
    import { X } from 'lucide-svelte';
    import { fade, scale } from 'svelte/transition';

    let { 
        isOpen = $bindable(false), 
        title = '', 
        size = 'md',
        onClose = () => {} 
    } = $props();

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl'
    };

    function handleClose() {
        isOpen = false;
        onClose();
    }

    function handleKeydown(e) {
        if (e.key === 'Escape') handleClose();
    }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
    <div 
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        transition:fade={{ duration: 150 }}
    >
        <!-- Backdrop -->
        <button 
            type="button"
            class="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onclick={handleClose}
            aria-label="Close modal"
        ></button>

        <!-- Modal Content -->
        <div 
            class="relative bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full {sizeClasses[size]} max-h-[90vh] overflow-hidden"
            transition:scale={{ duration: 150, start: 0.95 }}
        >
            <!-- Header -->
            {#if title}
                <div class="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                    <h2 class="text-lg font-semibold">{title}</h2>
                    <button 
                        type="button"
                        onclick={handleClose}
                        class="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        aria-label="Close"
                    >
                        <X class="w-5 h-5" />
                    </button>
                </div>
            {/if}

            <!-- Body -->
            <div class="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
                <slot />
            </div>
        </div>
    </div>
{/if}
