<script>
  import { chain, loudest, roster } from "@vivalence/anima";
  import { Key, Pip, Row } from "@vivalence/drapes";

  let { terminal, selected = false, onactivate, onremove } = $props();

  const thread = chain(terminal, "$thread");
  const label = chain(terminal, "$thread", "$label");
  const settling = chain(terminal, "$settling");

  let activities = $state([]);
  $effect(() => {
    if (!$thread) return void (activities = []);
    return roster($thread).subscribe((rows) => (activities = rows));
  });

  const running = $derived(loudest(activities) === "RUNNING");
  const tone = $derived(running ? "primary" : $thread ? "contrast" : "muted");
  const name = $derived($thread ? ($label?.name ?? "thread") : $settling ? "restoring…" : "empty terminal");
  const seat = $derived(
    [terminal.id, [$thread?.daemon?.slug, $thread?.mode?.slug].filter(Boolean).join(" › ")].filter(Boolean).join(" · "),
  );

  const remove = (event) => {
    event.stopPropagation();
    onremove();
  };
</script>

<Row {selected} title={seat} onclick={onactivate}>
  <Pip size={6} {tone} pulse={running} />
  <span class="name" class:selected class:vacant={!$thread}>{name}</span>
  <span class="seat">{seat}</span>
  <Key size="mini" tone="ghost" square label="✕" title="close terminal" onclick={remove} />
</Row>

<style>
  .name {
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-strong);
  }
  .name.selected {
    font-weight: 600;
  }
  .name.vacant {
    color: var(--text-light);
  }
  .seat {
    flex: 1 1 0;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-light);
  }
</style>
