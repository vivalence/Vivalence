<script>
    import { Meta, Template, Story } from "@storybook/addon-svelte-csf";

    import Input from "./Input.svelte";
    // import Icon from "../icon/Icon.svelte";
</script>

<Meta
    title="Kit/Input"
    component={Input}
    argTypes={{
        value: {
            control: "text"
        },
        tooltip: {
            control: "text"
        },
        label: {
            control: "text"
        },
        theme: {
            control: "inline-radio",
            options: ["dark"]
        }
    }}
/>

<Template let:args>
    <div class="container bg-theme-ui-3 p-12">
        <Input {...args} />
    </div>
</Template>

<Story name="Input" args={{ value: "me llamo finn", tooltip: "Use simple words." }} />
