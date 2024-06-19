<script>
    import { getStore } from "../store.js";
    const store = getStore();
</script>

<header class="mb-8">
    <h2 class="h1">
        {$store.instruction.verb.learning} - {$store.instruction.verb.spoken}
    </h2>
    <p class="">
        Tense: {$store.instruction.tense}
    </p>
</header>

<!-- <style> -->
<!--     .conjugation-prompt { -->
<!--         text-align: center; -->
<!--         margin-bottom: 1rem; -->
<!--     } -->
<!--     .conjugation-prompt h2 { -->
<!--         margin-bottom: 0.5rem; -->
<!--     } -->
<!-- </style> -->
