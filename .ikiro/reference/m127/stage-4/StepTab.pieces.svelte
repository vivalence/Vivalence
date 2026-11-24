  {@render heading("pieces")}
  {#if shown("pieces")}
  <div class="looks">
    {#if looks.selected.length}
      <div class="look-head">{looks.selected.length} selected on the stage · at this step only</div>
      <div class="look-row">
        <span class="look-key">show</span>
        <div class="segments">
          <button class:on={!looks.shared.status} onclick={() => ctl.look({ status: null })}>as built</button>
          {#each SHOWN as status (status)}
            <button class:on={looks.shared.status === status} onclick={() => ctl.look({ status })}>{status}</button>
          {/each}
        </div>
      </div>
      <div class="look-row">
        <span class="look-key">colour</span>
        <button title="Its own" class="tint" style="background:{tintVar(null)}" class:ring={!looks.shared.colour} onclick={() => ctl.look({ colour: null })}></button>
        {#each TINTS as role (role)}
          <button title={role} class="tint" style="background:{tintVar(role)}" class:ring={looks.shared.colour === role} onclick={() => ctl.look({ colour: role })}></button>
        {/each}
        <input class="look-hex" type="color" title="Any colour" value={looks.shared.colour?.startsWith("#") ? looks.shared.colour : undefined} onchange={(event) => ctl.look({ colour: event.target.value })} />
      </div>
      <div class="look-row">
        <span class="look-key">label</span>
        <button class="look-toggle" class:on={looks.shared.label} onclick={() => ctl.look({ label: looks.shared.label ? null : true })}>{looks.shared.label ? "named on the stage" : "off"}</button>
      </div>
      {#if looks.selected.length === 1}
        <div class="look-row">
          <span class="look-key">seat</span>
          <input class="look-vector" value={looks.shared.translation ? looks.shared.translation.join(", ") : ""} placeholder={looks.seat.join(", ")} title="x, y, z in metres, in its parent's frame; empty is its own seat" onchange={(event) => ctl.pose(event.target.value)} />
        </div>
      {/if}
    {:else}
      <div class="none">Select pieces on the stage or under Parts to show, hide, colour, name or move them at this step.</div>
    {/if}
    {#each looks.entries as one (one.literal)}
      <div class="item">
        <button class="look-name grow" title="Select it" onclick={() => ctl.pickPiece(one.literal)}>{one.name}</button>
        <span class="meta">{one.summary}</span>
        <button class="x" title="Say nothing about it" onclick={() => ctl.unlook(one.literal)}>×</button>
      </div>
    {/each}
  </div>
  {/if}

