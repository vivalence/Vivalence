<script>
    import { page } from "$app/stores";
    export let data;
    $: ({ FlashcardsInit } = data);

    // $: console.log("data", $FlashcardsInit);
    // $: console.log("page", $page);
</script>

<h1>hi</h1>

{JSON.stringify($FlashcardsInit, null, 2)}
