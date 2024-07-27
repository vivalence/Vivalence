<script lang="ts">
    export let form;
</script>

<div class="flex justify-center items-center h-screen ">
    <form method="POST" action="?/signin">
        <input class="input border mb-3" name="email" placeholder="email" type="email" value={form?.data?.email ?? ""} />
        <br />
        <input class="input border" name="password" placeholder="password" type="password" />
        <br />
        <button style="margin-top: 12px;">Login</button>
    </form>

    {#if form?.message}
        <p>{form.message}</p>
    {/if}
    {#if form?.error}
        <p>{form.error}</p>
    {/if}
</div>
