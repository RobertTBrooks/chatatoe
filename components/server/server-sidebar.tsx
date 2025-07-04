import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ChannelType, MemberRole } from '@/lib/generated/prisma';
import { redirect } from "next/navigation";
import React from "react";
import ServerHeader from "./server-header";
import { ScrollArea } from "../ui/scroll-area";
import { ServerSearch } from "./server-search";
import { Hash, Mic, Shield, Video } from "lucide-react";
import { Separator } from "../ui/separator";
import { ServerSection } from "./server-section";
import { ServerChannel } from "./server-channel";
import { ServerMember } from "./server-member";

interface ServerSidebarProps {
  serverId: string;
}
const iconStyle: string = "mr-2 h-4 w-4"

const iconMap = {
  [ChannelType.TEXT]: <Hash className={iconStyle} />,
  [ChannelType.AUDIO]: <Mic className={iconStyle} />,
  [ChannelType.VIDEO]: <Video className={iconStyle} />,
}

const roleIconMap = {
  [MemberRole.GUEST]: <Shield className={iconStyle + "text-green-400"} />,
  [MemberRole.MODERATOR]: <Shield className={iconStyle + "text-indigo-500"} />,
  [MemberRole.ADMIN]: <Shield className={iconStyle + "text-rose-400"} />,
}

const ServerSidebar = async ({ serverId }: ServerSidebarProps) => {
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/");
  }

  const server = await db.server.findUnique({
    where: {
      id: serverId,
    },
    include: {
      channels: {
        orderBy: {
          createdAt: "asc",
        },
      },
      members: {
        include: {
          profile: true,
        },
        orderBy: {
          role: "asc",
        },
      },
    },
  });

  const textChannels = server?.channels.filter(
    (channel) => channel.type === ChannelType.TEXT
  );

  const audioChannels = server?.channels.filter(
    (channel) => channel.type === ChannelType.AUDIO
  );

  const videoChannels = server?.channels.filter(
    (channel) => channel.type === ChannelType.VIDEO
  );

  const members = server?.members.filter(
    (member) => member.profileId !==profile.id
  );

  if (!server) {
    return redirect("/");
  }

  const role = server.members.find(
    (member) => member.profileId === profile.id
  )?.role;

  return (
    <div
      className="flex flex-col h-full text-primary w-full 
    bg-[#282D31]"
    >
      <ServerHeader server={server} role={role} />
      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          <ServerSearch 
          data={[
            {
              label: "Text Channels",
              type: "channel",
              data: textChannels?.map((channel) => ({
                id: channel.id,
                name: channel.name,
                icon: iconMap[channel.type],
              }))
            },
            {
              label: "Voice Channels",
              type: "channel",
              data: audioChannels?.map((channel) => ({
                id: channel.id,
                name: channel.name,
                icon: iconMap[channel.type],
              }))
            },
            {
              label: "Video Channels",
              type: "channel",
              data: videoChannels?.map((channel) => ({
                id: channel.id,
                name: channel.name,
                icon: iconMap[channel.type],
              }))
            },
            {
              label: "Members",
              type: "member",
              data: members?.map((member) => ({
                id: member.id,
                name: member.profile.name,
                icon: roleIconMap[member.role],
              }))
            }
          ]}
          
          />
        </div>

      <Separator className="bg-zinc-700 rounded-md my-2"/>
      {!!textChannels?.length && (
        <div className="mb-2">
          <ServerSection 
            sectionType="channels"
            channelType={ChannelType.TEXT}
            role={role}
            label="Text Channels"
          />
          <div className="space-y-[2px]">
            {textChannels.map((channel) => (
              <ServerChannel
              key={channel.id} 
              channel={channel}
              role={role}
              server={server}
              />
            ))}
          </div>
        </div>
      )}
      {!!audioChannels?.length && (
        <div className="mb-2">
          <ServerSection 
            sectionType="channels"
            channelType={ChannelType.AUDIO}
            role={role}
            label="Voice Channels"
          />
          <div className="space-y-[2px]">
            {audioChannels.map((channel) => (
              <ServerChannel
              key={channel.id} 
              channel={channel}
              role={role}
              server={server}
              />
            ))}
          </div>
        </div>
      )}
      {!!videoChannels?.length && (
        <div className="mb-2">
          <ServerSection 
            sectionType="channels"
            channelType={ChannelType.VIDEO}
            role={role}
            label="Video Channels"
          />
            <div className="space-y-[2px]">
            {videoChannels.map((channel) => (
              <ServerChannel
              key={channel.id} 
              channel={channel}
              role={role}
              server={server}
              />
            ))}
            </div>
        </div>
      )}
      {!!members?.length && (
        <div className="mb-2">
          <ServerSection 
            sectionType="members"
            server={server}
            role={role}
            label="member"
          />
          <div className="space-y-[2px]">
            {members.map((member) => (
              <ServerMember 
                key={member.id}
                member={member}
                server={server}

              />
            ))}
          </div>
        </div>
      )}
      </ScrollArea>
    </div>
  );
};

export default ServerSidebar;