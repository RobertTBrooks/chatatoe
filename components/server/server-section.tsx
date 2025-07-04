"use client"

import { ChannelType, MemberRole } from "@/lib/generated/prisma";
import { ServerWithMembersWithProfiles } from "@/types";
import ActionTooltip from "../action-tooltip";
import { Plus, Settings } from "lucide-react";
import { useModal } from "@/app/hooks/use-modal-store";

interface ServerSectionProps {  
    label: string;
    role?: MemberRole;
    sectionType: "channels" | "members";
    channelType?: ChannelType;
    server?: ServerWithMembersWithProfiles;
}

export const ServerSection = ({
    label,
    role,
    sectionType,
    channelType,
    server,
}: ServerSectionProps) => {
    const { onOpen } = useModal();
    return ( 
    <div className="flex items-center justify-between py-2">
        <p className="text-xs uppercase font-semibold text-zinc-400">
            {label}
        </p>
        {role !== MemberRole.GUEST && sectionType === "channels" && (
            <ActionTooltip label="Create Channel" side="top">
                <button 
                onClick={() => onOpen("createChannel", { channelType })}
                className="text-zinc-400 hover:text-zinc-600 transition">
                    <Plus className="h-4 w-4"/>
                </button>

            </ActionTooltip>
        )}
        {role === MemberRole.ADMIN && sectionType === "members" && (
            <ActionTooltip label="Manage Members" side="top" className="bg-zinc-700 text-white">
                <button 
                onClick={() => onOpen("members", { server })}
                className="text-zinc-400 hover:text-zinc-600 transition">
                    <Settings className="h-4 w-4"/>
                </button>

            </ActionTooltip>
        )}
        
    </div>
    )
}