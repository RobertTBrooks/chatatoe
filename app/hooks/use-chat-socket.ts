import { useSocket } from "@/components/providers/socket-provider";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

interface ChatSocketProps {
  addKey: string;
  updateKey: string;
  queryKey: string;
}

interface Message {
  id: string;
}

export const useChatSocket = ({
  addKey,
  updateKey,
  queryKey
}: ChatSocketProps) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleNewMessage = (message: Message) => {
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return oldData;
        }

        const newData = {
          ...oldData,
          pages: oldData.pages.map((page: any, i: number) => {
            if (i === 0) {
              return {
                ...page,
                items: [message, ...page.items]
              };
            }
            return page;
          })
        };

        return newData;
      });
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    };

    const handleUpdateMessage = (message: Message) => {
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return oldData;
        }

        const newData = {
          ...oldData,
          pages: oldData.pages.map((page: any) => {
            return {
              ...page,
              items: page.items.map((item: any) =>
                item.id === message.id ? { ...item, ...message } : item
              )
            };
          })
        };

        return newData;
      });
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    };

    socket.on(addKey, handleNewMessage);
    socket.on(updateKey, handleUpdateMessage);

    return () => {
      socket.off(addKey, handleNewMessage);
      socket.off(updateKey, handleUpdateMessage);
    };
  }, [queryClient, addKey, updateKey, queryKey, socket]);
};