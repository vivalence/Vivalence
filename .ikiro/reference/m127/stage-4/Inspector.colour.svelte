        {#if field.key === "colour"}
          <div class="options">
            <button class="swatch own" class:on={!worn} title="its file's own" onclick={() => oncolour(null)}></button>
            {#each rolesOf(schema.properties.colour) as role (role)}
              <button class="swatch" class:on={worn === role} title={role} style="background:var(--tint-{role})" onclick={() => oncolour(role)}></button>
            {/each}
            <input class="hex" type="color" title="any colour" value={worn?.startsWith("#") ? worn : undefined} onchange={(event) => oncolour(event.target.value)} />
          </div>
        {:else if field.kind === "lines"}
