"use client";

import qs from "query-string";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useModal } from "../../app/hooks/use-modal-store";
import { ServerWithMembersWithProfiles } from "@/types";
import { ScrollArea } from "../ui/scroll-area";
import { UserAvatar } from "../user-avatar";
import { CheckIcon, Gavel, Loader2, MoreVertical, Shield, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { MemberRole } from "@/lib/generated/prisma";
import { Button } from "../ui/button";

const m2_4x4_Style: string = "h-4 w-4 mr-2";

const roleIconMap = {
    "GUEST": <Shield className="h-5 w-5 ml-2 text-green-400"/>,
    "MODERATOR": <ShieldCheck className="h-5 w-5 ml-2 text-indigo-500" />,
    "ADMIN": <ShieldAlert className="h-5 w-5 ml-2 text-rose-400" />,
}

const memberRoleColor = {
    "GUEST": "text-green-400",
    "MODERATOR":"text-indigo-500",
    "ADMIN": "text-rose-400",
}

export const MembersModal = () => {
  const router = useRouter();
  const { isOpen, type, onClose, data, onOpen } = useModal();
  const [ loadingId, setLoadingId ] = useState("");

  const isModalOpen = isOpen && type === "members";
  const { server } = data as { server: ServerWithMembersWithProfiles };


  const onKick = async (memberId: string) => {
    try {
        setLoadingId(memberId);
        const url = qs.stringifyUrl({
            url: `/api/members/${memberId}`,
            query: {
                serverId: server?.id,
            }
        });

        const response = await axios.delete(url);

        router.refresh();
        onOpen("members", { server: response.data });

    } catch (error) {
        console.log(error);
    } finally {
        setLoadingId("");
    }
  }

  const onRefresh = async () => {
  try {
    setLoadingId("refresh");
    const response = await axios.get(`/api/servers/${server?.id}/members`);
    onOpen("members", { server: { ...server, members: response.data } as ServerWithMembersWithProfiles });
  } catch (error) {
    console.error("Error refreshing members:", error);
  } finally {
    setLoadingId("");
  }
};

  const onRoleChange = async (memberId: string, role: MemberRole) => {
    try {
        setLoadingId(memberId);
        const url = qs.stringifyUrl({
            url: `/api/members/${memberId}`,
            query: {
                serverId: server?.id,
            }
        });

        const response = await axios.patch(url, { role });

        router.refresh();
        onOpen("members", { server: response.data });
    } catch (error) {
        console.log(error);
    } finally {
        setLoadingId("");
    }

  }
  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#36454F] text-[#FFFFFA] px-20 pb-5 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Manage Members
          </DialogTitle>
          <DialogDescription className="text-center text-[#FFFFFA]">
            {server?.members?.length} Members
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="mt-8 max-h-[420px] pr-6">
          {server?.members?.map((member) => (
            <div key={member.id} className="flex items-center gap-x-3 mb-6">
              <UserAvatar src={member.profile.imageUrl}/>
              <div className="flex flex-col gap-y-1">
                <div className="font-semibold text-sm flex items-center">
                    {member.profile.name}
                    {roleIconMap[member.role]}
                    <p className={memberRoleColor[member.role]}>
                        {member.role}
                    </p>
                </div>
                <p className="text-xs flex items-center text-[#d1d1d198]">
                    {member.profile.email}
                </p>
              </div>
              {server.profileId !== member.profileId && loadingId !== member.id && (
                <div className="mb-auto ml-auto font-semibold text-[#FFFFFA]">
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <MoreVertical className="h-5 w-5 text-[#FFFFFA]"/>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="left">
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="flex items-center">
                                    <ShieldQuestion className={m2_4x4_Style}/>
                                    <span>Role</span>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                    <DropdownMenuSubContent>
                                        <DropdownMenuItem onClick={() => onRoleChange(member.id, "GUEST")}>
                                            <Shield className={m2_4x4_Style} />
                                            Guest
                                            {member.role === "GUEST" && (<CheckIcon className="h-4 w-4 ml-auto"/>)}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onRoleChange(member.id, "MODERATOR")}>
                                            <ShieldCheck className={m2_4x4_Style} />
                                            Modirator
                                            {member.role === "MODERATOR" && (<CheckIcon className="h-4 w-4 ml-auto"/>)}
                                        </DropdownMenuItem>
                                    </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onKick(member.id)}>
                                <Gavel className={m2_4x4_Style} />
                                Kick
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
              )}  
              {loadingId === member.id && (
                <Loader2 className="animate-spin text-indigo-500 ml-auto h-4 w-4" />
              )}
              {server.profileId === member.profileId && (
                <p className="mb-auto ml-auto font-semibold text-[#FFFFFA]">
                  (You)
                </p>
              )}
            </div>
          ))}
        </ScrollArea>
        <DialogFooter>
          <Button 
          className="bg-indigo-500 text-[#FFFFFA] hover:bg-indigo-600"
          onClick={onRefresh} 
          disabled={loadingId === "refresh"}>
            {loadingId === "refresh" ? (
            <>
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
            Refreshing...
            </>
            ) : (
              "Refresh Members"
          )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};