      <div class="bsp-node overflow-y-auto p-4 space-y-3">
        {#each $products as product (product.id)}
          <div class="p-4 border border-skeleton-1-boundary rounded">
            <pre class="text-xs">{JSON.stringify(product.data, null, 2)}</pre>
          </div>
        {/each}
      </div>
