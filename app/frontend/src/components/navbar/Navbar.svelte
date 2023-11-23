<script>
    import FlexContainer from "../../kit/flex/Container.svelte";
    import FlexItem from "../../kit/flex/Item.svelte";
    import logo from "../../../static/vivalence-white.svg";
</script>

<nav class="bg-theme-ui-1 p-4 fixed top-0 w-full right-0 h-16 z-10 border-b border-theme-border-1">
    <FlexContainer items="center">
        <FlexItem shrink="shrink-1" classes="content-center">
            <a href="/">
                <img src={logo} alt="Logo" class="h-8 mx-auto" />
            </a>
        </FlexItem>
        <FlexItem grow="grow-[3]" classes=""></FlexItem>
        <FlexItem shrink="shrink=1"></FlexItem>
    </FlexContainer>
</nav>
