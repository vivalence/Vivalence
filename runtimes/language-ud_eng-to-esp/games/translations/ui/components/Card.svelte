<script>
    import { Icon, CheckBadge, ArrowRightCircle, QuestionMarkCircle } from "svelte-hero-icons";
    import { popup } from "@skeletonlabs/skeleton";

    export let evaluation;
    export let tags;
    export let token;
    export let spoken;

    let color = {};
    $: switch (evaluation.status) {
        case "KNOWN":
            color.border = "border-success-600";
            color.text = "text-success-700";
            break;
        case "NEUTRAL":
            color.border = "border-gray-400";
            color.text = "text-gray-400";
            break;
        case "UNKNOWN":
            color.border = "border-red-500";
            color.text = "text-red-500";
            break;
    }
    const tooltipSettings = {
        event: "hover",
        target: "feedbackTooltip",
        placement: "top"
    };
</script>

<div class={`p-4 border border-1 ${color.border} bg-surface-100/90 rounded-md h-full relative`}>
    {#if evaluation.feedback}
        <div class="absolute top-2 right-2">
            <button class="[&>*]:pointer-events-none" use:popup={tooltipSettings}>
                <Icon src={QuestionMarkCircle} solid class="h-5 w-5 text-gray-700" />
            </button>
        </div>
        <div class="card p-2 variant-filled-surface max-w-xs w-max" data-popup="feedbackTooltip">
            <p class="text-m">{evaluation.feedback}</p>
            <div class="arrow" />
        </div>
    {/if}

    <h3 class={`text-2xl font-bold ${color.text} mb-1`}>
        {token}
        {#if evaluation.correction && evaluation.status === "UNKNOWN"}
            <Icon src={ArrowRightCircle} solid class={`h-5 w-5  bold inline text-gray-700`} />
            <span class={`font-bold italic text-gray-700`}> {evaluation.correction}</span>
        {:else if evaluation.status === "KNOWN"}
            <Icon src={CheckBadge} solid class={`h-5 w-5 mb-3 bold inline text-success-700/75`} />
        {/if}
    </h3>

    {#if spoken}
        <p class="text-gray-900 mb-2">{spoken}</p>
    {/if}

    {#if tags}
        <div class="flex flex-wrap gap-1 mt-2 max-w-[calc(100%-1rem)]">
            {#each tags.filter((t) => t.name) as tag}
                {#if tag.name}
                    <span
                        class={`flex-grow-0 flex-shrink-0 text-xs px-2 py-1 rounded-full text-gray-700 border ${color.border}`}
                    >
                        {tag.name}
                    </span>
                {/if}
            {/each}
        </div>
    {/if}
</div>
