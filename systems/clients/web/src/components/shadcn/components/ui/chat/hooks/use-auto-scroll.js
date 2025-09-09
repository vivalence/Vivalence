// Convert this from a hook to a standard function that returns values
export function useAutoScroll(node, options = {}) {
  const { offset = 20, smooth = false } = options;

  // Use regular variables instead of reactive ones
  let isAtBottom = true;
  let autoScrollEnabled = true;
  let lastContentHeight = 0;
  let userHasScrolled = false;
  let resizeObserver;
  let state = { isAtBottom, autoScrollEnabled };

  // Create a custom store for state
  const getState = {
    subscribe(callback) {
      callback(state);
      return () => {}; // Return unsubscribe function
    },
  };

  function updateState() {
    state = { isAtBottom, autoScrollEnabled };
  }

  function checkIsAtBottom(element) {
    const { scrollTop, scrollHeight, clientHeight } = element;
    const distanceToBottom = Math.abs(scrollHeight - scrollTop - clientHeight);
    return distanceToBottom <= offset;
  }

  function scrollToBottom(instant = false) {
    if (!node) return;
    const targetScrollTop = node.scrollHeight - node.clientHeight;
    if (instant) {
      node.scrollTop = targetScrollTop;
    } else {
      node.scrollTo({
        top: targetScrollTop,
        behavior: smooth ? "smooth" : "auto",
      });
    }
    isAtBottom = true;
    autoScrollEnabled = true;
    userHasScrolled = false;
    updateState();
  }

  function handleScroll() {
    if (!node) return;
    const atBottom = checkIsAtBottom(node);

    isAtBottom = atBottom;
    // Re-enable auto-scroll if at the bottom
    if (atBottom) {
      autoScrollEnabled = true;
    }
    updateState();
  }

  function disableAutoScroll() {
    const atBottom = node ? checkIsAtBottom(node) : false;
    // Only disable if not at bottom
    if (!atBottom) {
      userHasScrolled = true;
      autoScrollEnabled = false;
      updateState();
    }
  }

  function handleContentChange() {
    if (!node) return;
    const currentHeight = node.scrollHeight;
    const hasNewContent = currentHeight !== lastContentHeight;
    if (hasNewContent) {
      if (autoScrollEnabled) {
        requestAnimationFrame(() => {
          scrollToBottom(lastContentHeight === 0);
        });
      }
      lastContentHeight = currentHeight;
    }
  }

  // Initialize immediately instead of in onMount
  if (node) {
    node.addEventListener("scroll", handleScroll, { passive: true });

    resizeObserver = new ResizeObserver(() => {
      if (autoScrollEnabled) {
        scrollToBottom(true);
      }
    });

    resizeObserver.observe(node);
    lastContentHeight = node.scrollHeight;

    // Create mutation observer to replace afterUpdate
    const mutationObserver = new MutationObserver(handleContentChange);
    mutationObserver.observe(node, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    // Setup cleanup - this will be used in the component
    const cleanup = () => {
      if (node) {
        node.removeEventListener("scroll", handleScroll);
      }

      if (resizeObserver) {
        resizeObserver.disconnect();
      }

      if (mutationObserver) {
        mutationObserver.disconnect();
      }
    };

    return {
      scrollToBottom: () => scrollToBottom(false),
      disableAutoScroll,
      getState,
      cleanup,
    };
  }

  return {
    scrollToBottom: () => {},
    disableAutoScroll: () => {},
    getState,
    cleanup: () => {},
  };
} // import { onMount, afterUpdate, onDestroy } from 'svelte';

// export function useAutoScroll(node, options = {}) {
//   const { offset = 20, smooth = false } = options;

//   let isAtBottom = true;
//   let autoScrollEnabled = true;
//   let lastContentHeight = 0;
//   let userHasScrolled = false;
//   let resizeObserver;

//   function checkIsAtBottom(element) {
//     const { scrollTop, scrollHeight, clientHeight } = element;
//     const distanceToBottom = Math.abs(scrollHeight - scrollTop - clientHeight);
//     return distanceToBottom <= offset;
//   }

//   function scrollToBottom(instant = false) {
//     if (!node) return;

//     const targetScrollTop = node.scrollHeight - node.clientHeight;

//     if (instant) {
//       node.scrollTop = targetScrollTop;
//     } else {
//       node.scrollTo({
//         top: targetScrollTop,
//         behavior: smooth ? 'smooth' : 'auto'
//       });
//     }

//     isAtBottom = true;
//     autoScrollEnabled = true;
//     userHasScrolled = false;
//   }

//   function handleScroll() {
//     if (!node) return;

//     const atBottom = checkIsAtBottom(node);

//     isAtBottom = atBottom;
//     // Re-enable auto-scroll if at the bottom
//     if (atBottom) {
//       autoScrollEnabled = true;
//     }
//   }

//   function disableAutoScroll() {
//     const atBottom = node ? checkIsAtBottom(node) : false;

//     // Only disable if not at bottom
//     if (!atBottom) {
//       userHasScrolled = true;
//       autoScrollEnabled = false;
//     }
//   }

//   function handleContentChange() {
//     if (!node) return;

//     const currentHeight = node.scrollHeight;
//     const hasNewContent = currentHeight !== lastContentHeight;

//     if (hasNewContent) {
//       if (autoScrollEnabled) {
//         requestAnimationFrame(() => {
//           scrollToBottom(lastContentHeight === 0);
//         });
//       }
//       lastContentHeight = currentHeight;
//     }
//   }

//   onMount(() => {
//     if (!node) return;

//     node.addEventListener('scroll', handleScroll, { passive: true });

//     resizeObserver = new ResizeObserver(() => {
//       if (autoScrollEnabled) {
//         scrollToBottom(true);
//       }
//     });

//     resizeObserver.observe(node);
//     lastContentHeight = node.scrollHeight;
//   });

//   afterUpdate(() => {
//     handleContentChange();
//   });

//   onDestroy(() => {
//     if (node) {
//       node.removeEventListener('scroll', handleScroll);
//     }

//     if (resizeObserver) {
//       resizeObserver.disconnect();
//     }
//   });

//   return {
//     scrollToBottom: () => scrollToBottom(false),
//     disableAutoScroll,
//     getState: () => ({ isAtBottom, autoScrollEnabled })
//   };
// }
