<script>
  import { goto } from "$app/navigation";
  import { Button, Text } from "@vivalence/ui";

  const { data } = $props();
  const { runtime, aperture, locals } = data;

  let installing = $state(false);

  async function installDuplicates() {
    installing = true;
    const result = await locals.call(`/r/${runtime.slug}/units/install`, {
      unit: {
        data: {
          index: null,
          known: "they produce, they cause; you all (formal) produce",
          example: {
            known: null,
            learning: null,
          },
          learning: "producen",
        },
        annotation: {
          pos: "verb",
          mood: "ind",
          lemma: "producir",
          tense: "pres",
          aspect: "imp",
          number: "plur",
          person: "3",
          verbform: "fin",
        },
        slug: "producen:imp-producir-ind-plur-3-verb-pres-fin",
      },
    });
    console.log("called install ", result);
    installing = false;
  }
</script>

<div class="bsp-chain-root">
  <div>
    <Button onclick={installDuplicates}>
      <Text>Install Duplicates {installing ? "active" : "inactive"}</Text>
    </Button>
  </div>
</div>
