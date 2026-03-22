
      <div class="bsp-node overflow-y-auto p-4 space-y-2">
        {#each $products as product (product.id)}
          {#if product.type === "MESSAGE"}
            <div class="max-w-lg" class:ml-auto={product.traits?.includes("USER")}>
              <p class="text-xs text-skeleton-2-contrast">
                {product.traits?.includes("USER") ? "you" : "agent"}
              </p>
              <p class="p-3 rounded bg-skeleton-2-surface">
                {product.data?.[product.traits?.includes("USER") ? "USER" : "AGENT"]?.content}
              </p>
            </div>
          {:else if product.type === "MODAL"}
            <div class="max-w-lg p-4 border border-skeleton-1-boundary rounded">
              <pre class="text-xs">{JSON.stringify(product.data?.MODAL, null, 2)}</pre>
            </div>
          {/if}
        {/each}
      </div>
