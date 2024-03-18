<script>
    import { page } from "$app/stores";
    import { onMount } from "svelte";

    import translationsStore from "$games/translations/store.js";
    import TranslationsGame from "$games/translations/translations.svelte";

    onMount(async () => {
        await translationsStore.init({ gameId: $page.params.id });
        await translationsStore.getSentenceToQueue();
    });
</script>

<TranslationsGame />
