import { ChatHeader } from '@/components/chat/chat-header';
import { ChatInput } from '@/components/chat/chat-input';
import { ChatMessages } from '@/components/chat/chat-messages';
import { getOrCreateConversation } from '@/lib/conversation';
import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { RedirectToSignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import React from 'react'

export type paramsType = Promise<{ memberId: string; serverId: string }>;

const MemberIdPage = async (props: { params: paramsType }) => {
  const profile = await currentProfile();

  if (!profile) {
    return <RedirectToSignIn />
  }

  const { serverId, memberId } = await props.params;

  const currentMember = await db.member.findFirst({
    where: {
      serverId: serverId,
      profileId: profile.id
    }
  });

  if (!currentMember) {
    return redirect("/")
  }

  const conversations = await getOrCreateConversation(currentMember.id, memberId);

  if (!conversations) {
    return redirect(`/servers/${serverId}`);
  }

  const { memberOne, memberTwo } = conversations;

  if (!memberOne || !memberTwo) {
    return redirect(`/servers/${serverId}`);
  }

  const otherMember = memberOne.profileId === profile.id ? memberTwo : memberOne;

  return (
    <div className="bg-[#313338] flex flex-col h-full">
      <ChatHeader 
      imageUrl={otherMember.profile.imageUrl}
      name={otherMember.profile.name}
      serverId={serverId}
      type="conversation"
      />
      <ChatMessages
        name={otherMember.profile.name}
        member={currentMember}
        chatId={conversations.id}
        type="conversation"
        apiUrl="/api/direct-messages"
        paramKey="conversationId"
        paramValue={conversations.id}
        socketUrl="/api/socket/direct-messages"
        socketQuery={{ conversationId: conversations.id, serverId: serverId }}
      />
      <ChatInput
        name={otherMember.profile.name}
        type="conversation"
        apiUrl="/api/direct-messages"
        query={{
          conversationId: conversations.id
        }}
      />
    </div>
  );
}

export default MemberIdPage;