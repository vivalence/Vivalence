<script>
  import { onMount } from "svelte";
  import {
    ChatBubble,
    ChatBubbleMessage,
    ChatMessageList,
    ChatInput,
  } from "@client/shadcn/components/ui/chat/index.js";
  import { Button } from "@client/shadcn/components/ui/button/index.js";
  import { Icon } from "@vivalence/surface";

  let { ctx } = $props();

  let messages = [{ role: "assistant", content: "What do you want to do?" }];
  let userInput = "";
  let isLoading = false;

  // Available tools in the client
  const clientTools = {
    getCurrentTime: () => {
      return { time: new Date().toLocaleTimeString() };
    },
    getLocation: () => {
      return { location: "Client Location" };
    },
  };

  // Handle submission of a new message
  async function handleSubmit() {
    // console.log("handleSubmit", userInput);
    // if (!userInput.trim()) return;

    messages = [...messages, { role: "user", content: 'hi' }];

    const currentInput = userInput;
    userInput = "";
    isLoading = true;

    try {
      const data = await ctx.mcp("/chat", {
        messages: messages,
        tools: Object.keys(clientTools).map((name) => ({
          name,
          description: `Call the ${name} function`,
        })),
      });
      console.log("response", data);

      // Handle tool calls from the MCP server
      if (data.tool_calls && data.tool_calls.length > 0) {
        for (const toolCall of data.tool_calls) {
          if (clientTools[toolCall.name]) {
            // Execute the tool on the client side
            const result = clientTools[toolCall.name](...(toolCall.arguments || []));

            // Send the tool result back to the server
            const toolResponse = await fetch("http://localhost:3000/mcp", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                messages: messages,
                tool_results: {
                  id: toolCall.id,
                  result,
                },
              }),
            });

            const toolData = await toolResponse.json();

            // Add the assistant's response with the tool result
            messages = [...messages, { role: "assistant", content: toolData.content }];
          }
        }
      } else if (data.content) {
        // Regular text response
        messages = [...messages, { role: "assistant", content: data.content }];
      }
    } catch (error) {
      console.error("Error communicating with MCP server:", error);
      messages = [
        ...messages,
        {
          role: "assistant",
          content: "Sorry, I encountered an error connecting to the server.",
        },
      ];
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="chat-container border rw-full h-full flex flex-col">
  <ChatMessageList class="flex-1 overflow-y-auto mb-4">
    {#each messages as message}
      <ChatBubble variant={message.role === "user" ? "sent" : "received"}>
        <ChatBubbleMessage>
          {message.content}
        </ChatBubbleMessage>
      </ChatBubble>
    {/each}

    {#if isLoading}
      <ChatBubble variant="received">
        <ChatBubbleMessage isLoading={true} />
      </ChatBubble>
    {/if}
  </ChatMessageList>

  <div class="input-container">
    <form on:submit|preventDefault={handleSubmit} class="flex gap-2">
      <ChatInput
        bind:value={userInput}
        placeholder="Type your message..."
        disabled={isLoading}
        class="flex-1" />
      <Button type="submit" disabled={isLoading}>
        <Icon carbon="SendAlt" size="sm" />
      </Button>
    </form>
  </div>
</div>
