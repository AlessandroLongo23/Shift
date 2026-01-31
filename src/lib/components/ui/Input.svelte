<script>
    let { 
        type = 'text',
        label = '',
        placeholder = '',
        value = $bindable(''),
        error = '',
        disabled = false,
        required = false,
        id = crypto.randomUUID(),
        class: className = '',
        ...rest
    } = $props();
</script>

<div class="space-y-1.5">
    {#if label}
        <label for={id} class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {label}
            {#if required}<span class="text-red-500">*</span>{/if}
        </label>
    {/if}
    
    <input
        {id}
        {type}
        {placeholder}
        {disabled}
        {required}
        bind:value
        class="w-full px-3 py-2 rounded-lg border border-zinc-500/25 bg-white dark:bg-zinc-800 
               text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500
               focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent
               disabled:opacity-50 disabled:cursor-not-allowed
               transition-colors {error ? 'border-red-500 focus:ring-red-500' : ''} {className}"
        {...rest}
    />
    
    {#if error}
        <p class="text-sm text-red-500">{error}</p>
    {/if}
</div>
