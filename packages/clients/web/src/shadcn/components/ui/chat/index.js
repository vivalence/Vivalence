// chat/index.js
import Root from "./chat-bubble.svelte";
import Avatar from "./chat-bubble-avatar.svelte";
import Message from "./chat-bubble-message.svelte";
import Timestamp from "./chat-bubble-timestamp.svelte";
import Action from "./chat-bubble-action.svelte";
import ActionWrapper from "./chat-bubble-action-wrapper.svelte";
import {
  chatBubbleVariant,
  chatBubbleMessageVariants,
} from "./chat-bubble-variants.js";

import Input from "./chat-input.svelte";
import MessageList from "./chat-message-list.svelte";
import MessageLoading from "./message-loading.svelte";

import ExpandableChat from "./expandable-chat.svelte";
import ExpandableChatHeader from "./expandable-chat-header.svelte";
import ExpandableChatBody from "./expandable-chat-body.svelte";
import ExpandableChatFooter from "./expandable-chat-footer.svelte";

export {
  // Chat Bubble components
  Root,
  Avatar,
  Message,
  Timestamp,
  Action,
  ActionWrapper,
  chatBubbleVariant,
  chatBubbleMessageVariants,

  // Chat Input
  Input,

  // Message List
  MessageList,
  MessageLoading,

  // Expandable Chat
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,

  // Aliases with more intuitive names
  Root as ChatBubble,
  Avatar as ChatBubbleAvatar,
  Message as ChatBubbleMessage,
  Timestamp as ChatBubbleTimestamp,
  Action as ChatBubbleAction,
  ActionWrapper as ChatBubbleActionWrapper,
  Input as ChatInput,
  MessageList as ChatMessageList,
};
