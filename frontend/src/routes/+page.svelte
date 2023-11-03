<script>
    import { graphql } from "$houdini";
    import Button from "../components/button/Button.svelte";
    // import Card from "../views/Card.svelte"

    export let data;
    $: ({ CurriculumsRead } = data);
    $: console.log("data",  $CurriculumsRead.data.curriculumsRead);
</script>

<div>
    <div>
        <h1>Curriculums</h1>
        {#each $CurriculumsRead.data.curriculumsRead as curriculum}
            <div>
                <h2>{curriculum.name}</h2>
                {#each curriculum.gameRelations as gameRelation}
                  <div>
                    <h4> {gameRelation.game.typePretty} </h4>
                    <Button label={'Go'} />
                  </div>
                {/each}
            </div>
        {/each}
    </div>
</div>

                <!--         <Button> -->
                <!--             <a href="/games/{game.type.toLowerCase()}/{game.id}">Play</a> -->
                <!--         </Button> -->
