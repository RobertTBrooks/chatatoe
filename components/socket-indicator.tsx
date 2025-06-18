"use client";

import { useSocket } from "@/components/providers/socket-provider";
import { Badge } from "./ui/badge";

export const SocketIndicator = () => {
    const { isConnected } = useSocket();

    return (
        <Badge
            variant="outline"
            className={`text-white border-none ${isConnected ? "bg-emerald-600" : "bg-yellow-600"}`}
        >
            {isConnected ? "Live: Real-time Updates" : "fallback: Polling every 1 second"}
        </Badge>
    );
};