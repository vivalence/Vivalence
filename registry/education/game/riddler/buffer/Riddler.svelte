<script>
  const { terminal, buffer } = $props();

  // O Charlatão — the jester stage. Only the riddle + the character's current
  // line are ever shown; the conversation history stays server-side on the buffer.
  let phase = $state(buffer.data.solved && !buffer.data.resolved ? "solved" : "idle");
  let entry = $state("");
  let line = $state(
    buffer.data.history?.at(-1)?.reply ?? "Aproxima-te… O Charlatão tem um enigma só para ti!",
  );
  let thinking = $state(false);
  let attempts = $state(0);
  let resolvePct = $state(100);
  let metaOpen = $state(false);
  let timer = null;
  let exitTimer = null;

  const riddle = buffer.data.riddle;

  const words = (buffer.literals ?? []).map((literal) => ({
    word: literal.trait?.TRANSLATED?.learning ?? literal.slug ?? "",
    en: literal.trait?.TRANSLATED?.known ?? "",
    width: literal.memory?.strength ?? 0.35,
  }));

  const confetti = Array.from({ length: 18 }, (_, index) => ({
    left: (5 + Math.random() * 90).toFixed(1) + "%",
    color: ["#f0c04a", "#d13a4a", "#2f9e8f", "#f7ecd8"][index % 4],
    dur: (1.6 + Math.random() * 1.4).toFixed(2) + "s",
    delay: (Math.random() * 0.8).toFixed(2) + "s",
    rot: Math.floor(Math.random() * 360) + "deg",
  }));

  // type scales with length — short retorts loom large, long ones settle down
  const fit = (text, max, min) => {
    const len = (text ?? "").trim().length;
    return Math.min(max, Math.max(min, max - (len * (max - min)) / 80)) + "rem";
  };
  const riddleSize = $derived(fit(riddle, 1.6, 1.15));
  const lineSize = $derived(fit(line, 1.5, 1.0));

  const solvedish = $derived(phase === "solved" || phase === "resolving");
  const showInput = $derived(["idle", "wrong", "hint"].includes(phase));
  const lineColor = $derived(phase === "wrong" ? "#e88a72" : "#f0d9a0");
  const fieldBorder = $derived(
    phase === "wrong" ? "#d13a4a" : entry ? "#f0c04a" : "rgba(240,192,74,.22)",
  );

  // the face — one state machine drives brows, eyes, mouth, hat and body
  const face = $derived.by(() => {
    if (thinking)
      return { char: "j-bob 3s ease-in-out infinite", hat: "j-sway 3.6s ease-in-out infinite",
        head: "rotate(-5deg)", browL: "rotate(-8deg) translateY(-4px)", browR: "rotate(4deg)",
        eyes: "open", eyeH: "30px", pupil: "5px", wink: "none", mouth: "grin", grinScale: 0.7 };
    if (phase === "wrong")
      return { char: "j-shake .5s ease", hat: "j-jangle .5s ease",
        head: "scale(1.05) translateY(6px)", browL: "rotate(20deg) translateY(3px)",
        browR: "rotate(-20deg) translateY(3px)", eyes: "open", eyeH: "20px", pupil: "-4px",
        wink: "none", mouth: "cackle", grinScale: 1 };
    if (["solved", "resolving", "gone"].includes(phase))
      return { char: "j-bounce .7s ease", hat: "j-jangle .6s ease",
        head: "translateY(-6px) scale(1.05)", browL: "rotate(-14deg) translateY(-6px)",
        browR: "rotate(14deg) translateY(-6px)", eyes: "happy", eyeH: "30px", pupil: "0px",
        wink: "none", mouth: "grin", grinScale: 1.25 };
    return { char: "j-bob 3.2s ease-in-out infinite", hat: "j-sway 3.6s ease-in-out infinite",
      head: "rotate(0deg)", browL: "rotate(-10deg)", browR: "rotate(6deg)",
      eyes: "open", eyeH: "30px", pupil: "3px", wink: "j-wink 5s ease-in-out infinite",
      mouth: "grin", grinScale: 1 };
  });

  async function ask(message, kind = "answer") {
    if (thinking) return;
    thinking = true;
    line = "Hmm… deixa-me ver…";
    try {
      const verdict = await buffer.mode.connection.call("/assistant/message", {
        buffer: buffer.id,
        message,
      });
      if (verdict.correct || verdict.resolvable) {
        line = verdict.reply || line;
        phase = "solved";
        metaOpen = true;
      } else if (kind === "hint") {
        line = verdict.reply || line;
        phase = "hint";
      } else {
        attempts += 1;
        // cast-generated, riddle-specific mockery as fallback when the judge is terse
        line = verdict.reply || taunt() || line;
        phase = "wrong";
      }
    } finally {
      thinking = false;
    }
  }

  function submit() {
    const value = entry.trim();
    if (!value || thinking || solvedish) return;
    entry = "";
    ask(value);
  }

  function taunt() {
    const taunts = buffer.data.taunts ?? [];
    return taunts.length ? taunts[(attempts - 1) % taunts.length] : null;
  }

  function hint() {
    // cast-generated hint answers instantly, no round trip; else beg the judge
    if (buffer.data.hint) {
      phase = "hint";
      line = buffer.data.hint;
      return;
    }
    ask("Imploro uma pista!", "hint");
  }

  function onkeydown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  // solved → "baixar o pano" starts the curtain; the bar drains ~1.5s to auto-confirm
  function startResolve() {
    phase = "resolving";
    resolvePct = 100;
    clearInterval(timer);
    timer = setInterval(() => {
      resolvePct -= 4;
      if (resolvePct <= 0) finish();
    }, 60);
  }

  function dismiss() {
    clearInterval(timer);
    resolvePct = 100;
    phase = "solved"; // back to the duel — keep messaging
  }

  async function finish() {
    clearInterval(timer);
    resolvePct = 0;
    phase = "gone";
    await buffer.mode.connection.call("/assistant/resolve", { buffer: buffer.id });
    exitTimer = setTimeout(() => (terminal.buffer = null), 1400);
  }

  $effect(() => () => {
    clearInterval(timer);
    clearTimeout(exitTimer);
  });
</script>

<div class="stage">
  <!-- curtain side drapes + harlequin floor -->
  <div class="drape left"></div>
  <div class="drape right"></div>
  <div class="floor"></div>

  <!-- meta gate toggle -->
  <button class="meta-toggle" title="detalhes" onclick={() => (metaOpen = !metaOpen)}>
    {metaOpen ? "✕" : "i"}
  </button>

  <div class="scene">
    <!-- confetti -->
    {#if solvedish}
      <div class="confetti">
        {#each confetti as piece}
          <span
            style:left={piece.left}
            style:background={piece.color}
            style:animation="j-confetti {piece.dur} linear {piece.delay} infinite"
            style:transform="rotate({piece.rot})"></span>
        {/each}
      </div>
    {/if}

    <!-- character bust -->
    <div class="bust">
      {#if phase === "wrong"}
        <div class="ha">Há! Há!</div>
      {/if}

      <div style:animation={face.char}>
        <div class="head" style:transform={face.head}>
          <!-- hat -->
          <div class="hat-mount">
            <div class="hat" style:animation={face.hat}>
              <div class="point tilt-left">
                <div class="cone red"></div>
                <div class="pom gold"></div>
              </div>
              <div class="point center">
                <div class="cone gold"></div>
                <div class="pom red"></div>
              </div>
              <div class="point tilt-right">
                <div class="cone teal"></div>
                <div class="pom gold"></div>
              </div>
            </div>
          </div>

          <div class="headband"></div>

          <!-- face -->
          <div class="face">
            <div class="brow left-brow" style:transform={face.browL}></div>
            <div class="brow right-brow" style:transform={face.browR}></div>

            {#if face.eyes === "open"}
              <div class="eyes">
                <div class="eye" style:height={face.eyeH} style:animation={face.wink}>
                  <div class="pupil" style:transform="translateX({face.pupil})"></div>
                </div>
                <div class="eye" style:height={face.eyeH}>
                  <div class="pupil" style:transform="translateX({face.pupil})"></div>
                </div>
              </div>
            {:else}
              <div class="eyes happy">
                <div class="arc"></div>
                <div class="arc"></div>
              </div>
            {/if}

            <div class="cheek left-cheek"></div>
            <div class="cheek right-cheek"></div>
            <div class="nose"></div>

            {#if face.mouth === "grin"}
              <div class="grin" style:transform="translateX(-50%) scale({face.grinScale})">
                <div class="tongue"></div>
              </div>
            {:else}
              <div class="cackle">
                <div class="tongue round"></div>
              </div>
            {/if}
          </div>

          <!-- ruffled collar -->
          <div class="collar">
            <div class="ruff red"></div>
            <div class="ruff gold tall"></div>
            <div class="ruff teal taller"></div>
            <div class="ruff gold tall"></div>
            <div class="ruff red"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- the riddle (persists, dims once solved) -->
    {#if phase !== "gone"}
      <div class="riddle" class:dim={solvedish} style:font-size={riddleSize}>« {riddle} »</div>
      <div class="line" style:font-size={lineSize} style:color={lineColor}>{line}</div>
    {/if}

    <!-- input -->
    {#if showInput}
      <div class="entry">
        <div class="field" style:border-color={fieldBorder}>
          <input
            bind:value={entry}
            placeholder="lança a tua resposta…"
            disabled={thinking}
            {onkeydown} />
          <button class="throw" onclick={submit} aria-label="responder">▸</button>
        </div>
        <span class="beg" onclick={hint} role="button" tabindex="-1">implorar uma pista</span>
      </div>
    {/if}

    <!-- solved -->
    {#if phase === "solved"}
      <div class="solved">
        <button class="curtain-call" onclick={startResolve}>baixar o pano</button>
        <button class="stay" onclick={() => (phase = "idle")} title="continuar">✕</button>
      </div>
    {/if}

    <!-- resolving -->
    {#if phase === "resolving"}
      <div class="resolving">
        <div class="descend">o pano desce…</div>
        <div class="bar"><div style:width="{resolvePct}%"></div></div>
        <div class="bar-actions">
          <span class="confirm" onclick={finish} role="button" tabindex="-1">confirmar agora</span>
          <span class="back" onclick={dismiss} role="button" tabindex="-1">✕ voltar</span>
        </div>
      </div>
    {/if}

    <!-- gone -->
    {#if phase === "gone"}
      <div class="gone">
        <div class="fim">Fim do ato</div>
        <div class="returning"><span class="spinner"></span>voltando ao painel…</div>
      </div>
    {/if}
  </div>

  <!-- meta panel: words in play + strength -->
  {#if metaOpen}
    <div class="meta">
      <div class="meta-head">
        <span class="meta-title">O Charlatão</span>
        <span class="meta-close" onclick={() => (metaOpen = false)} role="button" tabindex="-1">✕</span>
      </div>
      <div class="meta-difficulty">{words.length} palavras em jogo</div>
      <div class="meta-rule"></div>
      <div class="meta-label">{solvedish ? "Palavras exercitadas" : "Palavras em jogo"}</div>
      <div class="meta-words">
        {#each words as word}
          <div class="meta-word">
            <div class="meta-word-name">
              <div class="pt">{word.word}</div>
              <div class="en">{word.en}</div>
            </div>
            <div class="meta-bar">
              <div style:transform="scaleX({word.width})"></div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- curtain drop -->
  <div
    class="curtain"
    style:transform="translateY({phase === 'resolving' || phase === 'gone' ? '0%' : '-100%'})">
  </div>
</div>

<style>
  @keyframes j-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
  @keyframes j-bounce { 0% { transform: translateY(0); } 28% { transform: translateY(-22px); } 52% { transform: translateY(0); } 72% { transform: translateY(-9px); } 100% { transform: translateY(0); } }
  @keyframes j-shake { 0%, 100% { transform: translateX(0); } 16% { transform: translateX(-9px) rotate(-1.5deg); } 38% { transform: translateX(9px) rotate(1.5deg); } 60% { transform: translateX(-6px); } 82% { transform: translateX(6px); } }
  @keyframes j-sway { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
  @keyframes j-jangle { 0%, 100% { transform: rotate(0); } 20% { transform: rotate(-11deg); } 45% { transform: rotate(9deg); } 70% { transform: rotate(-6deg); } 88% { transform: rotate(4deg); } }
  @keyframes j-wink { 0%, 90%, 100% { transform: scaleY(1); } 95% { transform: scaleY(0.12); } }
  @keyframes j-pop { 0% { transform: scale(0.4) rotate(-8deg); opacity: 0; } 60% { transform: scale(1.15) rotate(3deg); opacity: 1; } 100% { transform: scale(1) rotate(-2deg); opacity: 1; } }
  @keyframes j-confetti { 0% { transform: translateY(-30px) rotate(0); opacity: 1; } 100% { transform: translateY(760px) rotate(660deg); opacity: 0.15; } }
  @keyframes j-rise { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
  @keyframes j-spin { to { transform: rotate(360deg); } }

  .stage {
    position: relative;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background:
      radial-gradient(75% 46% at 50% -4%, rgba(255, 224, 150, 0.18), transparent 55%),
      linear-gradient(#3c0e1f 0%, #250913 58%, #150407 100%);
    color: #f7ecd8;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .drape {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 46px;
    pointer-events: none;
  }
  .drape.left {
    left: 0;
    background: repeating-linear-gradient(90deg, #4a0f1e, #4a0f1e 10px, #38091a 10px, #38091a 20px);
    box-shadow: inset -14px 0 26px rgba(0, 0, 0, 0.55);
  }
  .drape.right {
    right: 0;
    background: repeating-linear-gradient(90deg, #38091a, #38091a 10px, #4a0f1e 10px, #4a0f1e 20px);
    box-shadow: inset 14px 0 26px rgba(0, 0, 0, 0.55);
  }
  .floor {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 200px;
    background-image: repeating-conic-gradient(from 45deg, rgba(240, 192, 74, 0.05) 0deg 90deg, transparent 90deg 180deg);
    background-size: 44px 44px;
    mask-image: linear-gradient(transparent, #000);
    pointer-events: none;
  }

  .meta-toggle {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 26;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 1px solid rgba(240, 192, 74, 0.3);
    background: rgba(255, 246, 230, 0.06);
    color: #e4b34a;
    font-family: var(--font-family-code, monospace);
    font-size: 14px;
    font-style: italic;
    cursor: pointer;
    display: grid;
    place-items: center;
  }

  .scene {
    position: relative;
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 36px 40px 22px;
    text-align: center;
    overflow: hidden;
  }

  .confetti {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }
  .confetti span {
    position: absolute;
    top: -20px;
    width: 9px;
    height: 13px;
    border-radius: 2px;
  }

  /* ── the jester ── */
  .bust {
    position: relative;
    flex: 0 0 auto;
    margin-top: 6px;
    height: 270px;
    display: flex;
    align-items: flex-start;
    justify-content: center;
  }
  .ha {
    position: absolute;
    right: 6px;
    top: 18px;
    z-index: 5;
    font-family: var(--font-family-display, Georgia, serif);
    font-size: 30px;
    color: #d13a4a;
    text-shadow: 0 2px 0 #6b0f16;
    animation: j-pop 0.4s ease both;
  }
  .head {
    position: relative;
    width: 240px;
    transition: transform 0.45s cubic-bezier(0.2, 0.9, 0.3, 1);
  }

  .hat-mount {
    position: absolute;
    left: 50%;
    top: -6px;
    transform: translateX(-50%);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    transform-origin: bottom center;
  }
  .hat {
    transform-origin: bottom center;
    display: flex;
    align-items: flex-end;
  }
  .point {
    position: relative;
    transform-origin: bottom center;
  }
  .point.tilt-left { transform: rotate(-34deg); }
  .point.center { transform: translateY(6px); z-index: 2; }
  .point.tilt-right { transform: rotate(34deg); }
  .cone {
    width: 0;
    height: 0;
    border-left: 24px solid transparent;
    border-right: 24px solid transparent;
    border-bottom: 64px solid #d13a4a;
  }
  .point.center .cone {
    border-left-width: 26px;
    border-right-width: 26px;
    border-bottom-width: 72px;
  }
  .cone.gold { border-bottom-color: #f0c04a; }
  .cone.teal { border-bottom-color: #2f9e8f; }
  .cone.red { border-bottom-color: #d13a4a; }
  .pom {
    position: absolute;
    top: -9px;
    left: 50%;
    transform: translateX(-50%);
    width: 15px;
    height: 15px;
    border-radius: 50%;
  }
  .point.center .pom { top: -10px; width: 16px; height: 16px; }
  .pom.gold { background: #f0c04a; box-shadow: inset -2px -2px 3px #b5852a; }
  .pom.red { background: #d13a4a; box-shadow: inset -2px -2px 3px #8f1420; }

  .headband {
    position: absolute;
    left: 50%;
    top: 52px;
    transform: translateX(-50%);
    width: 158px;
    height: 26px;
    border-radius: 14px;
    background: repeating-linear-gradient(66deg, #f0c04a, #f0c04a 15px, #d13a4a 15px, #d13a4a 30px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);
    z-index: 3;
  }

  .face {
    position: absolute;
    left: 50%;
    top: 64px;
    transform: translateX(-50%);
    width: 158px;
    height: 170px;
    border-radius: 50% 50% 48% 48%;
    background: radial-gradient(70% 65% at 50% 38%, #f7ecd6, #ecdcbc);
    box-shadow: 0 14px 30px rgba(0, 0, 0, 0.4), inset 0 -10px 20px rgba(180, 140, 90, 0.25);
  }
  .brow {
    position: absolute;
    top: 52px;
    width: 34px;
    height: 7px;
    border-radius: 5px;
    background: #3a2416;
    transition: transform 0.4s;
  }
  .left-brow { left: 34px; }
  .right-brow { right: 34px; }

  .eyes {
    position: absolute;
    left: 0;
    right: 0;
    top: 66px;
    display: flex;
    justify-content: center;
    gap: 26px;
  }
  .eyes.happy { top: 70px; }
  .eye {
    width: 30px;
    border-radius: 50%;
    background: #fff;
    box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.2);
    display: grid;
    place-items: center;
    transform-origin: center;
  }
  .pupil {
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: #241a12;
  }
  .arc {
    width: 30px;
    height: 16px;
    border: 4px solid #241a12;
    border-bottom: none;
    border-radius: 30px 30px 0 0;
  }

  .cheek {
    position: absolute;
    top: 96px;
    width: 16px;
    height: 16px;
    transform: rotate(45deg);
    background: #e0768a;
    opacity: 0.7;
    border-radius: 3px;
  }
  .left-cheek { left: 16px; }
  .right-cheek { right: 16px; }
  .nose {
    position: absolute;
    left: 50%;
    top: 92px;
    transform: translateX(-50%);
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #e8b7a0;
  }

  .grin {
    position: absolute;
    left: 50%;
    bottom: 20px;
    width: 76px;
    height: 40px;
    background: #5a1220;
    border-radius: 0 0 76px 76px;
    box-shadow: inset 0 6px 0 #fff, inset 0 -8px 10px rgba(0, 0, 0, 0.4);
    overflow: hidden;
  }
  .grin .tongue {
    position: absolute;
    left: 50%;
    bottom: 4px;
    transform: translateX(-50%);
    width: 30px;
    height: 14px;
    background: #d13a4a;
    border-radius: 30px 30px 8px 8px;
  }
  .cackle {
    position: absolute;
    left: 50%;
    bottom: 14px;
    transform: translateX(-50%);
    width: 58px;
    height: 56px;
    background: #4a0d18;
    border-radius: 50%;
    box-shadow: inset 0 6px 0 #fff, inset 0 -6px 0 #fff;
    overflow: hidden;
  }
  .cackle .tongue.round {
    position: absolute;
    left: 50%;
    bottom: 6px;
    transform: translateX(-50%);
    width: 26px;
    height: 20px;
    background: #d13a4a;
    border-radius: 50%;
  }

  .collar {
    position: absolute;
    left: 50%;
    top: 224px;
    transform: translateX(-50%);
    display: flex;
    z-index: 2;
  }
  .ruff {
    width: 0;
    height: 0;
    border-left: 16px solid transparent;
    border-right: 16px solid transparent;
    border-top: 30px solid #d13a4a;
  }
  .ruff.gold { border-top-color: #f0c04a; }
  .ruff.teal { border-top-color: #2f9e8f; }
  .ruff.tall { border-top-width: 34px; }
  .ruff.taller { border-top-width: 38px; }

  /* ── text ── */
  .riddle {
    margin-top: 16px;
    max-width: 26rem;
    font-family: var(--font-family-display, Georgia, serif);
    font-style: italic;
    line-height: 1.25;
    color: #f7ecd8;
    text-wrap: balance;
    transition: opacity 0.3s;
  }
  .riddle.dim { opacity: 0.45; }
  .line {
    margin-top: 8px;
    min-height: 1.2em;
    max-width: 24rem;
    font-family: var(--font-family-display, Georgia, serif);
    font-style: italic;
    line-height: 1.3;
    text-wrap: balance;
    opacity: 0.82;
    transition: color 0.3s;
  }

  /* ── input ── */
  .entry {
    margin-top: 22px;
    width: 100%;
    max-width: 24rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  .field {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 6px 6px 18px;
    background: rgba(255, 246, 230, 0.06);
    border: 1px solid rgba(240, 192, 74, 0.22);
    border-radius: 12px;
    transition: border-color 0.25s;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  }
  .field input {
    flex: 1;
    min-width: 0;
    padding: 8px 0;
    font-family: var(--font-family-display, Georgia, serif);
    font-size: 1.3rem;
    color: #f7ecd8;
    background: transparent;
    border: none;
    outline: none;
  }
  .field input::placeholder {
    color: rgba(247, 236, 216, 0.35);
    font-style: italic;
  }
  .throw {
    flex: 0 0 auto;
    width: 42px;
    height: 42px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    background: #f0c04a;
    color: #3c0e1f;
    font-size: 15px;
    display: grid;
    place-items: center;
    box-shadow: 0 0 18px rgba(240, 192, 74, 0.4);
  }
  .beg {
    font-family: var(--font-family-code, monospace);
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #b98a94;
    cursor: pointer;
    border-bottom: 1px dotted rgba(185, 138, 148, 0.5);
  }

  /* ── solved / resolving / gone ── */
  .solved {
    margin-top: 22px;
    display: flex;
    align-items: center;
    gap: 12px;
    animation: j-rise 0.5s ease both;
  }
  .curtain-call {
    padding: 11px 22px;
    border: none;
    cursor: pointer;
    border-radius: 8px;
    font-family: var(--font-family-display, Georgia, serif);
    font-style: italic;
    font-size: 1.05rem;
    color: #3c0e1f;
    background: #f0c04a;
    box-shadow: 0 0 24px rgba(240, 192, 74, 0.4);
  }
  .stay {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 1px solid rgba(240, 192, 74, 0.25);
    background: transparent;
    color: #c98a8f;
    cursor: pointer;
    font-size: 13px;
  }

  .resolving {
    margin-top: 16px;
    width: 100%;
    max-width: 20rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .descend {
    font-family: var(--font-family-display, Georgia, serif);
    font-style: italic;
    font-size: 1.15rem;
    color: #f7ecd8;
  }
  .bar {
    width: 100%;
    height: 5px;
    border-radius: 99px;
    background: rgba(255, 255, 255, 0.1);
    overflow: hidden;
  }
  .bar div {
    height: 100%;
    background: #f0c04a;
    transition: width 0.06s linear;
  }
  .bar-actions {
    display: flex;
    gap: 14px;
    font-family: var(--font-family-code, monospace);
    font-size: 11px;
  }
  .confirm { cursor: pointer; color: #f0c04a; }
  .back { cursor: pointer; color: #c98a8f; }

  .gone {
    margin-top: 26px;
    width: 100%;
    max-width: 22rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    animation: j-rise 0.5s ease both;
  }
  .fim {
    font-family: var(--font-family-display, Georgia, serif);
    font-size: 26px;
    color: #f0c04a;
    text-shadow: 0 2px 0 #a5391f;
  }
  .returning {
    font-family: var(--font-family-code, monospace);
    font-size: 11px;
    letter-spacing: 0.06em;
    color: #c98a8f;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .spinner {
    width: 12px;
    height: 12px;
    border: 1.5px solid #c98a8f;
    border-top-color: #f0c04a;
    border-radius: 50%;
    animation: j-spin 0.8s linear infinite;
    display: inline-block;
  }

  /* ── meta panel ── */
  .meta {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(20rem, 84%);
    z-index: 24;
    background: rgba(28, 8, 16, 0.95);
    backdrop-filter: blur(6px);
    border-left: 1px solid rgba(240, 192, 74, 0.2);
    box-shadow: -20px 0 50px rgba(0, 0, 0, 0.5);
    padding: 26px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    animation: j-rise 0.3s ease both;
  }
  .meta-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .meta-title {
    font-family: var(--font-family-display, Georgia, serif);
    font-size: 18px;
    color: #f0c04a;
  }
  .meta-close {
    cursor: pointer;
    color: #c98a8f;
    font-family: var(--font-family-code, monospace);
    font-size: 14px;
  }
  .meta-difficulty {
    font-family: var(--font-family-code, monospace);
    font-size: 11px;
    color: #b98a94;
    letter-spacing: 0.06em;
  }
  .meta-rule {
    height: 1px;
    background: rgba(240, 192, 74, 0.15);
  }
  .meta-label {
    font-family: var(--font-family-code, monospace);
    font-size: 9px;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: #8f6a70;
  }
  .meta-words {
    display: flex;
    flex-direction: column;
    gap: 11px;
  }
  .meta-word {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .meta-word-name {
    flex: 0 0 5rem;
    text-align: right;
  }
  .meta-word-name .pt {
    font-family: var(--font-family-display, Georgia, serif);
    font-size: 1rem;
    line-height: 1;
    color: #f7ecd8;
  }
  .meta-word-name .en {
    font-family: var(--font-family-code, monospace);
    font-size: 8px;
    color: #b98a94;
    margin-top: 2px;
  }
  .meta-bar {
    flex: 1;
    height: 6px;
    border-radius: 99px;
    background: rgba(255, 255, 255, 0.09);
    position: relative;
    overflow: hidden;
  }
  .meta-bar div {
    position: absolute;
    inset: 0;
    transform-origin: left;
    transition: transform 1s cubic-bezier(0.2, 0.8, 0.3, 1);
    background: linear-gradient(90deg, #8a5a1e, #f0c04a);
  }

  /* ── curtain drop ── */
  .curtain {
    position: absolute;
    inset: 0;
    z-index: 20;
    pointer-events: none;
    display: flex;
    transition: transform 1s cubic-bezier(0.6, 0, 0.3, 1);
  }
  .curtain::before {
    content: "";
    flex: 1;
    background: repeating-linear-gradient(90deg, #5a1120, #5a1120 26px, #460d19 26px, #460d19 52px);
    box-shadow: inset 0 -30px 60px rgba(0, 0, 0, 0.5);
    border-bottom: 6px solid #f0c04a;
  }
</style>
