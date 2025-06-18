"use client";

import { Member, Message, Profile } from "@/lib/generated/prisma/client";
import { ChatWelcome } from "./chat-welcome";
import { useChatQuery } from "@/app/hooks/use-chat-query";
import { Loader2, ServerCrash } from "lucide-react";
import { Fragment, useRef, ElementRef, useState, useEffect } from "react";
import { ChatItem } from "./chat-item";
import { format } from "date-fns";
import { useChatSocket } from "@/app/hooks/use-chat-socket";
import { useChatScroll } from "@/app/hooks/use-chat-scroll";
import React from "react";
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from "@/components/providers/socket-provider";
import { UseInfiniteQueryResult } from '@tanstack/react-query';

const DATE_FORMAT = "d MMM yyyy, HH:mm";

type MessageWithMemberWithProfile = Message & {
    member: Member & {
        profile: Profile;
    };
}

interface ChatQueryResult {
    pages: {
        items: MessageWithMemberWithProfile[];
        nextCursor: string | null;
    }[];
    pageParams: any[];
}

interface ChatMessagesProps {
    name: string;
    member: Member;
    chatId: string;
    apiUrl: string;
    socketUrl: string;
    socketQuery: Record<string, string>;
    paramKey: "channelId" | "conversationId";
    paramValue: string;
    type: "channel" | "conversation";    
}

export const ChatMessages = React.memo(({
    name,
    member,
    chatId,
    apiUrl,
    socketUrl,
    socketQuery,
    paramKey,
    paramValue,
    type,
}: ChatMessagesProps) => {
    const { socket } = useSocket();
    const queryKey = `chat:${chatId}`;
    const addKey = `chat:${chatId}:messages`;
    const updateKey = `chat:${chatId}:messages:update`;
    
    const chatRef = useRef<ElementRef<"div">>(null);
    const bottomRef = useRef<ElementRef<"div">>(null);
    const [lastMessageTimestamp, setLastMessageTimestamp] = useState(Date.now());

    const {
      data,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      status,
    } = useChatQuery({
      queryKey,
      apiUrl,
      paramKey,
      paramValue,
    }) as UseInfiniteQueryResult<ChatQueryResult, Error>;

    useEffect(() => {
        if (socket) {
            console.log(`Joining channel ${chatId}`);
            socket.emit('join-channel', chatId);
        }
        return () => {
            if (socket) {
                console.log(`Leaving channel ${chatId}`);
                socket.emit('leave-channel', chatId);
            }
        };
    }, [socket, chatId]);

    useChatSocket({
        queryKey,
        addKey,
        updateKey,
    });

    useEffect(() => {
        setLastMessageTimestamp(Date.now());
    }, [data]);

    useChatScroll({
        chatRef,
        bottomRef,
        loadMore: fetchNextPage,
        shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
        count: data?.pages?.flatMap(p => p.items).length ?? 0
    });

    if (status === "error") {
        return (
            <div className="flex-1 flex flex-col justify-center items-center">
                <ServerCrash className="h-7 w-7 text-zinc-500 my-4" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Something went wrong!
                </p>
            </div>
        );
    }

    if (status === "pending") {
        return (
            <div className="flex-1 flex flex-col justify-center items-center">
                <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Loading...
                </p>
            </div>
        );
    }

    return (
        <div ref={chatRef} className="flex-1 flex flex-col py-0 overflow-y-auto">
            {hasNextPage && (
                <div className="flex justify-center">
                    {isFetchingNextPage ? (
                        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin my-4" />
                    ) : (
                        <button
                            onClick={() => fetchNextPage()}
                            className="text-zinc-400 text-xs my-4 hover:text-zinc-300 transition"
                        >
                            Load previous messages
                        </button>
                    )}
                </div>
            )}

            {!hasNextPage && <ChatWelcome name={name} type={type} />}
            <div className="flex-1 flex flex-col-reverse py-0 overflow-y-auto">
                {data?.pages?.map((group, i) => (
                    <Fragment key={i}>
                        {group.items.map((message: MessageWithMemberWithProfile) => (
                            <ChatItem
                                key={message.id}
                                id={message.id}
                                currentMember={member}
                                member={message.member}
                                content={message.content}
                                fileUrl={message.fileUrl}
                                deleted={message.deleted}
                                timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
                                isUpdated={message.updatedAt !== message.createdAt}
                                socketUrl={socketUrl}
                                socketQuery={socketQuery}
                            />
                        ))}
                    </Fragment>
                ))}
            </div>
            <div ref={bottomRef} />
        </div>
    );
});