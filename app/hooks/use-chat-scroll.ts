import { useEffect, useRef, useState } from "react";

type ChatScrollProps = {
  chatRef: React.RefObject<HTMLDivElement | null>;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  shouldLoadMore: boolean;
  loadMore: () => Promise<any>;
  count: number;
};

export const useChatScroll = ({
  chatRef,
  bottomRef,
  shouldLoadMore,
  loadMore,
  count,
}: ChatScrollProps) => {
  const [hasInitialLoaded, setHasInitialLoaded] = useState(false);
  const prevCountRef = useRef<number>(count);

  // Load more messages when scrolled to top
  useEffect(() => {
    const container = chatRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop === 0 && shouldLoadMore) {
        const previousHeight = container.scrollHeight;
        loadMore().then(() => {
          requestAnimationFrame(() => {
            const newHeight = container.scrollHeight;
            container.scrollTop = newHeight - previousHeight;
          });
        });
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [chatRef, shouldLoadMore, loadMore]);

  // Scroll to bottom when new message arrives or on first load
  useEffect(() => {
    const container = chatRef.current;
    const bottomDiv = bottomRef.current;
    const prevCount = prevCountRef.current;

    const isAtBottom = () => {
      if (!container) return false;
      const distance =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      return distance < 200;
    };

    const shouldScroll =
      !hasInitialLoaded || count > prevCount || isAtBottom();

    if (shouldScroll && bottomDiv) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          bottomDiv.scrollIntoView({ behavior: hasInitialLoaded ? "smooth" : "auto" });
        });
      });
    }

    if (!hasInitialLoaded) setHasInitialLoaded(true);
    prevCountRef.current = count;
  }, [count, chatRef, bottomRef, hasInitialLoaded]);
};
