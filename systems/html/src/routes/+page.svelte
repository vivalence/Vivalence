<script>
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { Login } from "@vivalence/html/surface";

  let lighthouse = $state(null);

  onMount(async () => {
    const client = await import("$client");
    lighthouse = client.lighthouse;

    lighthouse.$isIdentified.subscribe((identified) => {
      if (identified) goto("/viva");
    });
  });
</script>

<div class="login-shell">
  <video
    class="login-background"
    src="/static/videos/720x480p-flight10-seldoncrisis-entry-vhs-16fps.mp4"
    autoplay
    loop
    muted
    playsinline
  ></video>

  <div class="login-overlay"></div>

  <div class="login-center">
    <div class="login-card">
      {#if lighthouse}
        <Login {lighthouse} />
      {/if}
    </div>
  </div>
</div>

<style>
  .login-shell {
    position: relative;
    display: grid;
    height: 100svh;
    overflow: hidden;
    background: black;
  }

  @media (display-mode: standalone) {
    .login-shell {
      padding-top: env(safe-area-inset-top, 0px);
    }
  }

  .login-background {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.1;
  }

  .login-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.2);
  }

  .login-center {
    position: relative;
    display: grid;
    place-items: center;
    padding: 24px;
  }

  .login-card {
    width: 100%;
    max-width: 360px;
    padding: 32px;
    /* background: rgba(0, 0, 0, 0.6); */
    backdrop-filter: blur(2px);
    /* border: 1px solid var(--colors-skeleton-1-boundary); */
    border-radius: 8px;
  }
</style>
