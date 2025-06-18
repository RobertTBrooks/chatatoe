import qs from "query-string";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSocket } from "@/components/providers/socket-provider";

interface ChatQueryProps {
    queryKey: string;
    apiUrl: string;
    paramKey: "channelId" | "conversationId";
    paramValue: string;
}

export const useChatQuery = ({ 
    apiUrl, 
    queryKey, 
    paramKey, 
    paramValue 
}: ChatQueryProps) => {
    const { isConnected } = useSocket();

    const fetchMessages = async ({ pageParam = undefined }) => {
        const url = qs.stringifyUrl({
            url: apiUrl,
            query: {
                cursor: pageParam,
                [paramKey]: paramValue,
            }
        }, { skipNull: true });

        console.log(`Fetching messages from: ${url}`);
        const response = await fetch(url);
        const data = await response.json();
        console.log(`Fetched messages:`, data);
        return data;
    };

    return useInfiniteQuery({
        queryKey: [queryKey],
        queryFn: fetchMessages,
        initialPageParam: undefined,
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
        refetchInterval: isConnected ? false : 1000,
        staleTime: 0,
        gcTime: 0,
    });
}