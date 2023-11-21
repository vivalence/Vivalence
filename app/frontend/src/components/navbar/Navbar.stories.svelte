<script>
    import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
    import Navbar from "./Navbar.svelte";
</script>

<Meta title="Components/Navbar" component={Navbar} />

<Template let:args>
    <Navbar ></Navbar>
</Template>

<Story name="Navbar"></Story>
