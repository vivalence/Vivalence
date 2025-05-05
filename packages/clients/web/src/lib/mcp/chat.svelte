<script>
  import { onMount } from "svelte";
  import { Text, Button, Icon } from "@vivalence/interface";
  import { mcpClient, chatHistory, currentRuntime, isProcessing } from "../../../lib/mcp/client.js";
  import { intentResolver } from "../../../lib/mcp/intent.js";
  
  let inputValue = "";
  
  onMount(async () => {
    // Connect to MCP server on component mount
    try {
      await mcpClient.connect();
      
      // Add welcome message
      chatHistory.update(history => [
        ...history,
        {
          role: "assistant",
          content: "Welcome! How can I help you today?"
        }
      ]);
    } catch (error) {
      chatHistory.update(history => [
        ...history,
        {
          role: "system",
          content: `Error connecting to server: ${error.message}`,
          error: true
        }
      ]);
    }
  });
  
  async function handleSubmit() {
    if (!inputValue.trim() || $isProcessing) return;
    
    // Add user message to history
    chatHistory.update(history => [
      ...history,
      {
        role: "user",
        content: inputValue
      }
    ]);
    
    const message = inputValue;
    inputValue = "";
    
    try {
      // Add thinking indicator
      const thinkingIndex = $chatHistory.length;
      chatHistory.update(history => [
        ...history,
        {
          role: "assistant",
          content: "Thinking...",
          thinking: true
        }
      ]);
      
      // Resolve intent
      const intent = await intentResolver.resolveIntent(message);
      
      // Handle the intent
      await handleIntent(intent, thinkingIndex);
    } catch (error) {
      chatHistory.update(history => {
        const newHistory = [...history];
        
        // Replace thinking message or add new error
        if (newHistory[newHistory.length - 1]?.thinking) {
          newHistory[newHistory.length - 1] = {
            role: "system",
            content: `Error: ${error.message}`,
            error: true
          };
        } else {
          newHistory.push({
            role: "system",
            content: `Error: ${error.message}`,
            error: true
          });
        }
        
        return newHistory;
      });
    }
  }
  
  async function handleIntent(intent, thinkingIndex) {
    switch (intent.type) {
      case "runtime_selection":
        // Switch to the selected runtime
        await mcpClient.selectRuntime(intent.runtimeId);
        
        // Update message
        chatHistory.update(history => {
          const newHistory = [...history];
          newHistory[thinkingIndex] = {
            role: "assistant",
            content: intent.message
          };
          return newHistory;
        });
        break;
        
      case "tool_execution":
        // Execute the tool
        try {
          const result = await mcpClient.executeTool(intent.tool, intent.args);
          
          // Update message with result
          chatHistory.update(history => {
            const newHistory = [...history];
            newHistory[thinkingIndex] = {
              role: "assistant",
              content: formatToolResult(intent.tool, result),
              result
            };
            return newHistory;
          });
        } catch (error) {
          chatHistory.update(history => {
            const newHistory = [...history];
            newHistory[thinkingIndex] = {
              role: "system",
              content: `Error executing ${intent.tool}: ${error.message}`,
              error: true
            };
            return newHistory;
          });
        }
        break;
        
      case "no_runtime":
      case "general_message":
      default:
        // Just update the message
        chatHistory.update(history => {
          const newHistory = [...history];
          newHistory[thinkingIndex] = {
            role: "assistant",
            content: intent.message
          };
          return newHistory;
        });
        break;
    }
  }
  
  function formatToolResult(tool, result) {
    // Format result based on tool type
    if (tool.includes("search")) {
      return `Search results: ${JSON.stringify(result, null, 2)}`;
    }
    
    // Default formatting
    return `Result: ${JSON.stringify(result, null, 2)}`;
  }
</script>

<div class="chat-container">
  <div class="messages">
    {#each $chatHistory as message}
      <div class="message {message.role} {message.error ? 'error' : ''} {message.thinking ? 'thinking' : ''}">
        <div class="avatar">
          {#if message.role === 'user'}
            <Icon carbon="User" size="md" />
          {:else if message.role === 'assistant'}
            <Icon carbon="Bot" size="md" />
          {:else}
            <Icon carbon="Information" size="md" />
          {/if}
        </div>
        
        <div class="content">
          {#if message.thinking}
            <div class="thinking-indicator">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          {:else}
            <Text>{message.content}</Text>
          {/if}
          
          {#if message.result}
            <div class="result">
              <pre>{JSON.stringify(message.result, null, 2)}</pre>
            </div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
  
  <div class="input-area">
    <form on:submit|preventDefault={handleSubmit}>
      <input
        type="text"
        bind:value={inputValue}
        disabled={$isProcessing}
        placeholder="Type a message..."
      />
      <Button
        variant="primary"
        type="submit"
        disabled={$isProcessing}
      >
        <Icon carbon="SendAlt" size="sm" />
      </Button>
    </form>
  </div>
</div>

<style>
  .chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 1rem;
  }
  
  .messages {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .message {
    display: flex;
    gap: 0.5rem;
    max-width: 80%;
  }
  
  .message.user {
    align-self: flex-end;
  }
  
  .message.assistant, .message.system {
    align-self: flex-start;
  }
  
  .message.error .content {
    background-color: var(--system-error-surface, #ffecec);
    border-color: var(--system-error-boundary, #ff0000);
  }
  
  .avatar {
    display: flex;
    align-items: flex-start;
    padding-top: 0.5rem;
  }
  
  .content {
    background-color: var(--skeleton-surface-1, #f0f0f0);
    border: 1px solid var(--skeleton-boundary-1, #e0e0e0);
    border-radius: 0.5rem;
    padding: 0.75rem;
  }
  
  .message.user .content {
    background-color: var(--theme-primary-surface, #e0f7fa);
    border-color: var(--theme-primary-boundary, #b2ebf2);
  }
  
  .result {
    margin-top: 0.5rem;
    border-top: 1px solid var(--skeleton-boundary-1, #e0e0e0);
    padding-top: 0.5rem;
  }
  
  .result pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 0.85rem;
  }
  
  .thinking-indicator {
    display: flex;
    gap: 0.25rem;
    align-items: center;
    height: 1.5rem;
  }
  
  .dot {
    width: 0.5rem;
    height: 0.5rem;
    background-color: var(--skeleton-contrast-1, #666);
    border-radius: 50%;
    animation: pulse 1.5s infinite ease-in-out;
  }
  
  .dot:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  .dot:nth-child(3) {
    animation-delay: 0.4s;
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(0.5);
      opacity: 0.5;
    }
    50% {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  .input-area {
    margin-top: auto;
  }
  
  .input-area form {
    display: flex;
    gap: 0.5rem;
  }
  
  .input-area input {
    flex: 1;
    padding: 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid var(--skeleton-boundary-1, #e0e0e0);
  }
</style>
