"use client";

import { Member, MemberRole, Profile, Server } from "@/lib/generated/prisma";
import { cn } from "@/lib/utils";
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { UserAvatar } from "../user-avatar";


interface ServerMembersProps {
    member: Member & { profile: Profile };
    server: Server;

}


const roleIconMap = {
    [MemberRole.GUEST]: <Shield className="h-5 w-5 ml-2 text-green-400"/>,
    [MemberRole.MODERATOR]: <ShieldCheck className="h-5 w-5 ml-2 text-indigo-500" />,
    [MemberRole.ADMIN]: <ShieldAlert className="h-5 w-5 ml-2 text-rose-400" />,
}

export const ServerMember = ({
    member,
    server,
}:ServerMembersProps) => {
    const params = useParams();
    const router = useRouter();

    const icon = roleIconMap[member.role];

    const onClick = () => {
        router.push(`/servers/${params?.serverId}/conversations/${member.id}`);
    }

    return (
        <button
            onClick={onClick}
            className={cn(
                "group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/50 transition mb-1",
                params?.memberId === member.id && "bg-zinc-700"
            )}
        >
            <UserAvatar 
                src={member.profile.imageUrl} 
                className="h-8 w-8 md:h-8 md:w-8"
            />
            <p 
                className={cn(
                "font-semibold text-sm text-zinc-400 group-hover:text-zinc-300 transition",
                params?.memberId === member.id && "text-zinc-200 group-hover:text-white"
                )}
            >
                {member.profile.name}
            </p>
            {icon}
        </button>
    )
}