<script>
    import { graphql } from "$houdini";
    import Button from "../views/Button.svelte";

    export let data;
    $: ({ CurriculumsRead } = data);
</script>

<div>
    <!-- {JSON.stringify($CurriculumsRead.data.curriculumsRead, null, 2)} -->
    <div>
        <h1>Curriculums</h1>
        {#each $CurriculumsRead.data.curriculumsRead as curriculum}
            <div>
                <h2>{curriculum.name}</h2>
                {#each curriculum.games as game}
                    <div>
                        <h3>{game.typePretty}</h3>
                        <Button>
                            <a href="/games/{game.type.toLowerCase()}/{game.id}">Play</a>
                        </Button>
                    </div>
                {/each}
            </div>
        {/each}
    </div>
</div>
