"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useModal } from "../../app/hooks/use-modal-store";
import { ChannelType } from "@/lib/generated/prisma";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import qs from 'query-string'
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";


const formSchema = z.object({
  name: z.string().min(1, {
    message: "Channel name is required",
  }).refine(name => name.toLowerCase() !== "general", {
    message: "Channel name cannot be 'general'"
  }),
  type: z.nativeEnum(ChannelType),
});

export const EditChannelModal = () => {
  const { isOpen, type, onClose, data } = useModal();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isRunLoading, setIsLoading] = useState(false);
  const isModalOpen = isOpen && type === "editChannel";
  const { channel, server } = data;
  const TIMEOUT_DURATION = 10000; // 10 seconds

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: channel?.type || ChannelType.TEXT,
    },
  });

  useEffect(() => {
    if (channel) {
        form.setValue("name", channel.name);
        form.setValue("type", channel.type);
        
    }
  }, [form, channel]);


  const isLoading = form.formState.isSubmitting;


const onSubmit = async (values: z.infer<typeof formSchema>) => {
  try {
    setError(""); // Clear any previous errors
    setIsLoading(true); // Add a loading state

    const url = qs.stringifyUrl({
      url: `/api/channels/${channel?.id}`,
      query: {
        serverId: server?.id
      }
    });

    const source = axios.CancelToken.source();
    const timeout = setTimeout(() => {
      source.cancel('Request timed out');
    }, TIMEOUT_DURATION);

    try {
      await axios.patch(url, values, {
        cancelToken: source.token,
      });

      clearTimeout(timeout);
      form.reset();
      router.refresh();
      onClose();
    } catch (axiosError) {
      clearTimeout(timeout);
      if (axios.isCancel(axiosError)) {
        setError('Request timed out. Please try again.');
      } else if (axios.isAxiosError(axiosError)) {
        if (axiosError.response) {
          setError(axiosError.response.data.error || "An error occurred");
        } else if (axiosError.request) {
          setError("No response received from server");
        } else {
          setError("Error setting up the request");
        }
      } else {
        setError("An unexpected error occurred");
      }
    }
  } catch (error) {
    setError("An unexpected error occurred");
    console.error("Error in onSubmit:", error);
  } finally {
    setIsLoading(false); // Ensure loading state is reset
  }
};

  const handleClose = () => {
    form.reset();
    onClose();
    setError(""); // Clear error when modal is closed
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent
        className="bg-[#36454F] text-[#FFFFFA] p-0 overflow-hidden"
      >
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Edit Channel
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <div className="space-y-8 px-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      className="uppercase text-xs font-bold text-[#FFFFFA]"
                    >
                      Channel Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-white border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
                />
                {error && (
          <div>
            <p className="rounded p-2 font-bold text-white text-sm mt-2 bg-red-500 flex justify-center items-center">
              {error}
            </p>
          </div>
        )}
              <FormField 
                control={form.control}
                name="type"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            Channel Type
                        </FormLabel>
                        <Select
                            disabled={isLoading}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                        >
                            <FormControl>
                                <SelectTrigger className="border-0 focus-visible:ring-0 text-[#FFFFFA] focus-visible:ring-offset-0 capitalize outline-none">
                                    <SelectValue placeholder="Select A Channel Type" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {Object.values(ChannelType).map((type) => (
                                    <SelectItem key={type} value={type} className="capitalize">
                                        {type.toLocaleLowerCase()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
            <DialogFooter className="px-6 pb-4">
              <Button disabled={isLoading} variant="primary">
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
