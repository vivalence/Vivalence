<script>
  import { Shelve, Box, Text } from "@vivalence/drapes";
</script>

<Shelve down classes={["debug"]}>
  <Box><Text>// box</Text></Box>
  <Box><Text>// box</Text></Box>
</Shelve>

<style>
  .debug {
    border: 1px solid red;
    > * {
	border: 1px solid red;
    }
  }
</style>
