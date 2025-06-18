"use client";

import * as z from "zod";
import axios from "axios";
import qs from "query-string";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, use } from 'react';
import { Member, MemberRole, Profile } from "@/lib/generated/prisma/client";
import {
    Edit,
  FileIcon,
  FileTextIcon,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash,
} from "lucide-react";
import { UserAvatar } from "../user-avatar";
import ActionTooltip from "../action-tooltip";
import Image from 'next/image';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
} from '../ui/form';
import { useModal } from "@/app/hooks/use-modal-store";
import { useParams, useRouter } from "next/navigation";


interface ChatMessagesProps {
  id: string;
  content: string;
  member: Member & {
    profile: Profile;
  };
  timestamp: string;
  fileUrl: string | null;
  deleted: boolean;
  currentMember: Member;
  isUpdated: boolean;
  socketUrl: string;
  socketQuery: Record<string, string>;
}

const roleIconMap = {
  GUEST: <Shield className="h-5 w-5 ml-2 text-green-400" />,
  MODERATOR: <ShieldCheck className="h-5 w-5 ml-2 text-indigo-500" />,
  ADMIN: <ShieldAlert className="h-5 w-5 ml-2 text-rose-400" />,
};

const formSchema = z.object({
  content: z.string().min(1),
});

async function fetchContentType(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.headers.get("content-type");
  } catch (err) {
    console.error("Failed to fetch content-type", err);
    return null;
  }
}

export const ChatItem = ({
  id,
  content,
  member,
  timestamp,
  fileUrl,
  deleted,
  currentMember,
  isUpdated,
  socketUrl,
  socketQuery,
}: ChatMessagesProps) => {
  const [resolvedType, setResolvedType] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { onOpen } = useModal();
  const params = useParams();
  const router = useRouter();

  const onMemberClick = () => {
    if (member.id === currentMember.id) {
      return;
    } 

    router.push(`/servers/${params?.serverId}/conversations/${member.id}`);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: content,
    },
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Esc' || event.keyCode === 27) {
        setIsEditing(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    form.reset({
      content: content,
    });
  }, [content]);


  const isAdmin = currentMember.role === MemberRole.ADMIN;
  const isModerator = currentMember.role === MemberRole.MODERATOR;
  const isOwner = member.id === currentMember.id;
  const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner);
  const canEditMessage = !deleted && isOwner && !fileUrl;

  const extractFileUrl = (text: string) => {
    const match = text.match(/(https:\/\/utfs\.io\/f\/[a-zA-Z0-9-_]+)/);
    return match ? match[0] : null;
  };

  const fileUrlToUse = fileUrl || extractFileUrl(content);

  const cleanContent =
    fileUrlToUse && content.includes(fileUrlToUse)
      ? content.replace(fileUrlToUse, "").trim()
      : content;

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = qs.stringifyUrl({
        url: `${socketUrl}/${id}`,
        query: socketQuery,
      });
      await axios.patch(url, values);
      form.reset();
      setIsEditing(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (fileUrlToUse && !resolvedType) {
      fetchContentType(fileUrlToUse).then(setResolvedType);
    }
  }, [fileUrlToUse, resolvedType]);

  const renderFileContent = () => {
    if (!fileUrlToUse) return null;

    const isImage = resolvedType?.startsWith('image/');
    const isPDF = resolvedType === 'application/pdf';

    let fileName = fileUrlToUse.split('/').pop() || 'Attached File';
    if (isPDF) fileName = 'PDF File';

    return (
      <div className="mt-2">
        {isImage ? (
          <div className="relative h-48 w-48">
            <Image
            src={fileUrlToUse}
            alt={fileName}
            fill
            className="rounded-md object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ) : (
          <div className="flex items-center p-2 rounded-md bg-background/10">
            {isPDF ? (
              <FileTextIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
            ) : (
              <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
            )}
            <a
              href={fileUrlToUse}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
            >
                {fileName}
            </a>
          </div>
        )}
        
      </div>
    );
  };

  return (
    <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
      <div className="group flex gap-x-2 items-start w-full">
        <div onClick={onMemberClick} className="cursor-pointer hover:drop-shadow-md transition">
          <UserAvatar
            src={member.profile.imageUrl}
            className="h-8 w-8 md:h-8 md:w-8"
          />
        </div>
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-x-2 w-full">
            <div className="flex items-center">
              <p onClick={onMemberClick} className="text-sm md:text-md font-semibold text-zinc-400 hover:underline cursor-pointer">
                {member.profile.name}
              </p>
              <ActionTooltip label={member.role} side="top">
                {roleIconMap[member.role]}
              </ActionTooltip>
              <span className="text-xs text-zinc-400 ml-2">{timestamp}</span>
            </div>
          </div>
          {renderFileContent()}
          {canEditMessage && (
          <div className="hidden group-hover:flex items-center gap-x-2 absolute p-1 -top-2 right-5 bg-zinc-800 border rounded-sm">
            {canEditMessage && !fileUrlToUse && (
              <ActionTooltip label="Edit">
                <Edit
                  onClick={() => setIsEditing(true)}
                  className="cursor-pointer ml-auto w-4 h-4 text-zinc-400 hover:text-zinc-300 transition"
                />
              </ActionTooltip>
            )}
            {canDeleteMessage && (
              <ActionTooltip label="Delete">
                <Trash
                  onClick={() => onOpen("deleteMessage", {
                    apiUrl: `${socketUrl}/${id}`,
                    query: socketQuery
                  })}
                  className="cursor-pointer ml-auto w-4 h-4 text-zinc-400 hover:text-zinc-300 transition"
                />
              </ActionTooltip>
            )}
          </div>
        )}
          {cleanContent && (
            <p className="text-sm text-zinc-400 mt-2">
              {cleanContent}
              {isUpdated && !deleted && (
                <span className="text-[10px] mx-2 text-zinc-500">
                  (edited)
                </span>
              )}
            </p>
          )}
        {cleanContent && isEditing && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex items-center w-full gap-x-2 pt-2"
              >
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <div className="relative w-full">
                            <Input
                            disabled={isLoading}
                            className="p-2 bg-zinc-700/50 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-400"
                            placeholder="Edited message"
                            {...field}
                            />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button 
                disabled={isLoading}
                size="sm" 
                variant="primary">
                  Save
                </Button>
              </form>
              <span className="text-[10px] mt-1 text-zinc-400">
                Press escape to cancel, enter to save
              </span>
            </Form>
        )}
        </div>
      </div>
    </div>
  );
};