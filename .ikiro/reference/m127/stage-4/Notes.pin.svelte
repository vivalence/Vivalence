      {#if onanchor}
        <div class="pinning">
          {#if note.at}
            <button class="pinner on" title="Take it off the stage" onclick={() => onanchor(k, null)}>⌖ on {(note.at.literals ?? []).length} · ×</button>
          {:else}
            <button class="pinner" disabled={!selected.length} title="Pin this note to the pieces selected on the stage" onclick={() => onanchor(k, selected)}>
              ⌖ {selected.length ? `pin to ${selected.length} selected` : "select pieces to pin"}
            </button>
          {/if}
          <button class="pinner" title="Pictures from the manual" onclick={() => onpicture(k)}>+ picture</button>
        </div>
        {#if note.images?.length}
          <div class="shots">
            {#each note.images as image (image)}
              <button class="shot" title="Remove {image}" onclick={() => onunpicture(k, image)}><img src={asset(image)} alt="" /></button>
            {/each}
          </div>
        {/if}
      {/if}
