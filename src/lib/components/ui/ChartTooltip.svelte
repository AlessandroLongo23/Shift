<script>
    let { 
        visible = false,
        x = 0,
        y = 0,
        position = 'top',
        children,
        classes = ''
    } = $props();

    let tooltipStyles = $derived.by(() => {
        let translate = '';
        let style = '';
        let indicator = '';
        let offset = 12;

        if (position === 'top') {
            translate = '-translate-x-1/2';
            style = `left: ${x}px; top: ${y - offset}px;`;
            indicator = 'left-1/2 bottom-0 translate-y-1.5 -translate-x-1.5 rotate-45';
        } else if (position === 'bottom') {
            translate = '-translate-x-1/2 translate-y-full';
            style = `left: ${x}px; top: ${y + offset}px;`;
            indicator = 'left-1/2 top-0 -translate-y-1.5 -translate-x-1.5 -rotate-[135deg]';
        } else if (position === 'left') {
            translate = 'left-0 top-1/2 translate-y-1/2 -translate-x-full';
            style = `left: ${x - offset}px; top: ${y}px;`;
            indicator = 'right-0 top-1/2 -translate-y-1.5 translate-x-1.5 -rotate-45';
        } else if (position === 'right') {
            translate = 'left-0 top-1/2 translate-y-1/2 translate-x-1.5';
            style = `left: ${x + offset}px; top: ${y}px;`;
            indicator = 'left-0 top-1/2 -translate-y-1.5 -translate-x-1.5 rotate-[135deg]';
        }

        return {
            translate,
            style,
            indicator
        };
    });
</script>

{#if visible}
    <div 
        class="{tooltipStyles.translate} {classes} absolute flex flex-col z-50 bg-white dark:bg-zinc-900 min-w-52 border border-zinc-500/25 rounded-lg shadow-md transform transition-all duration-100 pointer-events-none"
        style={tooltipStyles.style}
    >
        {@render children()}

        <div class="{tooltipStyles.indicator} absolute size-3 bg-white dark:bg-zinc-900 border-b border-r border-zinc-500/25 transform"></div>
    </div>
{/if}
