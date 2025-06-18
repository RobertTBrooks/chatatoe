"use client";

import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "../ui/textarea";
import { useEffect, useRef } from "react";
import { EmojiPicker } from '../emoji-picker';
import { useSocket } from "@/components/providers/socket-provider";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Button } from "../ui/button";
import qs from "query-string";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useModal } from "@/app/hooks/use-modal-store";
import { Plus, Router, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  apiUrl: string;
  query: Record<string, any>;
  name: string;
  type: "conversation" | "channel";
}

const formSchema = z.object({
  content: z.string().min(1),
});

export const ChatInput = ({
  apiUrl,
  query,
  name,
  type,
}: ChatInputProps) => {
    const router = useRouter();
    const { onOpen } = useModal();
    const { socket } = useSocket();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const isLoading = form.formState.isSubmitting;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      const maxHeight = 200;
      if (textareaRef.current.scrollHeight > maxHeight) {
        textareaRef.current.style.height = `${maxHeight}px`;
        textareaRef.current.style.overflowY = "auto";
      } else {
        textareaRef.current.style.overflowY = "hidden";
      }
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [form.watch("content")]);

  useEffect(() => {
    adjustTextareaHeight();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
  try {
    const url = qs.stringifyUrl({
      url: apiUrl,
      query,
    });
    const response = await axios.post(url, values);
    
    // Emit the new message to all clients
    if (socket) {
      socket.emit('new-message', {
        ...response.data,
        channelId: query.channelId || query.conversationId
      });
    }

    form.reset();
  } catch (error) {
    console.log(error);
  }
};

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full flex items-center"
      >
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <div className="flex items-center space-x-2 w-full px-4 py-2">
                  <div className="relative flex-grow min-w-0">
                    <button
                      type="button"
                      onClick={() => onOpen("messageFile", { apiUrl, query })}
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-[24px] w-[24px] bg-zinc-400 text-zinc-900 rounded-full flex items-center justify-center z-10"
                    >
                      <Plus className="text-[#313338]" />
                    </button>
                    <Textarea
                      ref={textareaRef}
                      className={cn(
                        "w-full resize-none overflow-hidden",
                        "pl-10 pr-10",
                        "text-[14px] leading-tight",
                        "min-h-[40px] max-h-[200px]",
                        "box-border"
                      )}
                      style={{
                        paddingTop: "14.125px",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                      disabled={isLoading}
                      placeholder={`Send a message to ${type === "conversation" ? name : "#" + name}`}
                      onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          form.handleSubmit(onSubmit)();
                        }
                      }}
                      onChange={(e) => {
                        field.onChange(e);
                        adjustTextareaHeight();
                      }}
                      value={field.value}
                    />
                    <div
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-[24px] w-[24px] bg-transparent text-zinc-500 dark:text-zinc-400 flex items-center justify-center z-10"
                    >
                      <EmojiPicker   
                      onChange={emoji => field.onChange(`${field.value} ${emoji}`)}
                      />
                    </div>
                  </div>
                  <Button
                    className="flex-shrink-0 h-12 w-22"
                    type="submit"
                    disabled={isLoading}
                    size="sm"
                    variant="primary"
                  >
                    Send
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};