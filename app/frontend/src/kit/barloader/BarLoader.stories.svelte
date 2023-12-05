<script>
    import { Meta, Template, Story } from "@storybook/addon-svelte-csf";

    import BarLoader from "./BarLoader.svelte";
    // import Icon from "../icon/Icon.svelte";
</script>

<Meta
    title="Kit/BarLoader"
    component={BarLoader}
    argTypes={{
        color: {
            control: "text"
        },
        size: {
            control: "number"
        }
    }}
/>

<Template let:args>
        <BarLoader {...args} />
</Template>

<Story name="BarLoader" args={{ size: 100 }} />
