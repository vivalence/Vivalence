variants Text (default) | $reactive | span | trace | object | ...

<div>
  text - text
  $reactive -> map(r => <Paragraph header={} variant={castType(r.type)})
  span -> span.$reactive...
  trace ->  <Paragraph header={trace.absolute/nature} variant{castType(trace)}
  object ->  some (interactive?) Json rendering. 
</div>
