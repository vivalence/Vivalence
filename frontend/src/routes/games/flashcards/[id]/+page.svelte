<script>
    import { page } from "$app/stores";
    export let data;
    $: ({ GameRead } = data);

    $: console.log("data", $GameRead);
    $: console.log("page", $page);
</script>

<h1>hi</h1>

{JSON.stringify($GameRead, null, 2)}
