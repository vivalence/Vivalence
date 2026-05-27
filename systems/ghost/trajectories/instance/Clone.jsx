import { Box, Confirm, React, Select, Text, TextInput, useState } from "@vivalence/sheets";

export function SlugPicker({ options, buffer }) {
  return (
    <Box flexDirection="column">
      <Text>variant?</Text>
      <Select items={options} onSelect={(item) => buffer.release(item.value ?? item)} />
    </Box>
  );
}

export function TargetPicker({ initial, buffer }) {
  const [value, setValue] = useState(initial);
  return (
    <Box flexDirection="column">
      <Text>path?</Text>
      <TextInput value={value} onChange={setValue} onSubmit={buffer.release} />
    </Box>
  );
}

export function CloneConfirm({ source, target, identifier, buffer }) {
  return (
    <Box flexDirection="column">
      <Text bold>clone</Text>
      <Row label="variant" value={identifier} valueColor="cyan" />
      <Row label="source" value={source} />
      <Row label="target" value={target} />
      <Box marginTop={1}>
        <Confirm label="proceed?" onSubmit={buffer.release} />
      </Box>
    </Box>
  );
}

function Row({ label, value, valueColor }) {
  return (
    <Box>
      <Box width={10} flexShrink={0}>
        <Text color="gray">  {label}</Text>
      </Box>
      <Text color={valueColor}>{value}</Text>
    </Box>
  );
}
