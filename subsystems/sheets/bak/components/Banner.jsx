import React from "react";
import { Box, Text } from "ink";

const palette = { info: "cyan", success: "green", warning: "yellow", error: "red" };

export function Banner({ variant = "info", headline, body, nextSteps = [] }) {
  const color = palette[variant] ?? "cyan";
  return (
    <Box flexDirection="column" borderStyle="round" borderColor={color} paddingX={1}>
      {headline ? <Text color={color} bold>{headline}</Text> : null}
      {body ? <Text>{body}</Text> : null}
      {nextSteps.length ? (
        <Box flexDirection="column" marginTop={1}>
          <Text color="gray">next steps</Text>
          {nextSteps.map((step, index) => (
            <Text key={index}>
              {"  "}
              {index + 1}. {step}
            </Text>
          ))}
        </Box>
      ) : null}
    </Box>
  );
}
