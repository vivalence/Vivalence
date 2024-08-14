<script>
  import '../app.css';
  import { page } from '$app/stores';
  import { onMount } from "svelte";

  import matrix from "$matrix";
  import * as keyboard from "$signals/keyboard.js";
  import Menu from '$components/menu/Menu.svelte'

  onMount(() => {
    matrix.initialize($page.data.locals)
    matrix.root()
    keyboard.initialize()
  })
  // onMount(() => {const simulateKeyPress = (key) => {if (document && KeyboardEvent) {const event = new KeyboardEvent("keydown", {key, code: `Key${key.toUpperCase()}`, keyCode: key.charCodeAt(0), charCode: key.charCodeAt(0), bubbles: true,}); document.dispatchEvent(event);}}; simulateKeyPress('c');});

</script> 

<slot />

{#if !$page.url.pathname.startsWith('/auth')}
    <Menu />
{/if}

<!--     import { setContext, onMount } from "svelte";
<!-- 	 import { writable } from "svelte/store"; -->
<!--     import { afterNavigate, invalidate } from "$app/navigation"; -->
<!--     import { AppShell, AppBar } from "@skeletonlabs/skeleton"; -->
<!--     import { dev } from "$app/environment"; -->
<!--     import { computePosition, autoUpdate, offset, shift, flip, arrow } from "@floating-ui/dom"; -->
<!--     import { storePopup, initializeStores  } from "@skeletonlabs/skeleton"; -->
<!--     import DebugTool from "$components/_debug/DebugTool.svelte"; -->

<!--     import "../app.pcss"; -->
<!--     initializeStores(); -->
<!--     storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow }); -->

<!--     export let data; -->
<!--     let { locals } = data; -->
<!--     let session; -->

<!--     const FooterComponent = writable(null); -->
<!--     setContext("page-footer", FooterComponent); -->

<!--     afterNavigate((params) => { -->
<!--         const isNewPage = params.from?.url.pathname !== params.to?.url.pathname; -->
<!--         const elemPage = document.querySelector("#page"); -->
<!--         if (isNewPage && elemPage !== null) { -->
<!--             elemPage.scrollTop = 0; -->
<!--         } -->
<!--     }); -->

<!--     onMount(async () => { -->
<!--         session = await locals.getSession(); -->
<!--         const { data } = locals.supabase.auth.onAuthStateChange((event, _session) => { -->
<!--             if (_session?.expires_at !== session?.expires_at) { -->
<!--                 invalidate("supabase:auth"); -->
<!--             } -->
<!--         }); -->
<!--         return () => data.subscription.unsubscribe(); -->
<!--     }); -->

<!-- <AppShell> -->
<!--     <svelte:fragment slot="header"> -->
<!--         <AppBar -->
<!--             gridColumns="grid-cols-3" -->
<!--             slotDefault="place-self-center" -->
<!--             slotTrail="place-content-end" -->
<!--             background="bg-surface-900" -->
<!--         > -->
<!--             <svelte:fragment slot="lead">{" "}</svelte:fragment> -->

<!--             <a href="/"> -->
<!--                 <img src={"/logo/vivalence-white.svg"} alt="Logo" class="h-8 mx-auto" /> -->
<!--             </a> -->

<!--             <svelte:fragment slot="trail"> -->
<!--                 {#if session} -->
<!--                     <form method="POST" action="auth?/signout"> -->
<!--                         <button>Logout</button> -->
<!--                     </form> -->
<!--                 {:else} -->
<!--                     <a href="/auth">Login</a> -->
<!--                 {/if} -->
<!--             </svelte:fragment> -->
<!--         </AppBar> -->
<!--     </svelte:fragment> -->

<!--     <slot /> -->

<!--     <svelte:fragment slot="footer"> -->
<!--         {#if typeof $FooterComponent === "string"} -->
<!--             {@html $FooterComponent} -->
<!--         {:else if typeof $FooterComponent === "function"} -->
<!--             <svelte:component this={$FooterComponent} /> -->
<!--         {/if} -->
<!--     </svelte:fragment> -->
<!-- </AppShell> -->

<!-- {#if dev} -->
<!--     <DebugTool {locals} /> -->
<!-- {/if} -->
