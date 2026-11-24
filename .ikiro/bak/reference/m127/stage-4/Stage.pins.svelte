  {#if drawn.length}
    <svg class="pin-lines">
      {#each drawn as one (one.id)}
        <line x1={one.x} y1={one.y} x2={one.bx} y2={one.by} />
        <circle cx={one.x} cy={one.y} r="3" />
      {/each}
    </svg>
    {#each drawn as one (one.id)}
      <div class="pin {one.pin.tone}" style="left:{one.bx}px;top:{one.by}px">
        <span class="pin-text">{one.pin.text}</span>
        {#if one.pin.images?.length}
          <span class="pin-thumbs">
            {#each one.pin.images as image, k (image)}
              <button class="pin-thumb" title="Open the picture" onclick={() => onimage(one.pin.images, k)}>
                <img src={asset(image)} alt="" />
              </button>
            {/each}
          </span>
        {/if}
      </div>
    {/each}
  {/if}
