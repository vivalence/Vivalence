<script>
    import Container from "$kit/container/Container.svelte";
    import Arrow from "carbon-icons-svelte/lib/DirectionStraight.svelte";
    import Button from "$kit/button/Button.svelte";
    import { gameStore } from "../store.js";
    const onClick = () => gameStore.requestNextSentence();
</script>

<Container
    classes=" z-10 fixed bottom-0 left-1/2 transform translate-y-1/2 -translate-x-1/2 w-48 h-32 pt-3 bg flex justify-center"
>
    <Button on:click={onClick} IconComponent={Arrow} icon hierarchy="accent" size="md" />
</Container>
