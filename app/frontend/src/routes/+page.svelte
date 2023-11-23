<script>
    import { goto } from "$app/navigation";

    import Container from "../kit/container/Container.svelte";
    import GameCard from "../kit/card/GameCard.svelte";

    export let data;
    $: ({ CurriculumsRead } = data);

    const playGame = (game) => () => {
        goto(`/games/${game.type.toLowerCase()}/${game.id}`);
    };
    $: console.log("$CurriculumsRead.data", $CurriculumsRead);
</script>

<div class="pt-6 px-4">
    {#if $CurriculumsRead.errors}
        <div class="text-palette-white">{JSON.stringify($CurriculumsRead.errors, null, 2)}</div>
    {:else if $CurriculumsRead.data}
        {#each $CurriculumsRead.data.curriculumsRead as curriculum}
            <Container title={curriculum.name} classes="mx-auto max-w-4xl mb-12">
                {#each curriculum.gameRelations as gameRelation}
                    <GameCard
                        icon={gameRelation.game.type}
                        title={gameRelation.game.typePretty}
                        buttonText="Play"
                        on:primaryButtonClick={playGame(gameRelation.game)}
                    />
                {/each}
            </Container>
        {/each}
    {/if}
</div>
