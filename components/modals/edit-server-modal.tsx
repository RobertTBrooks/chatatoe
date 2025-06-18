"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import FileUpload from "../file-upload";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useModal } from "../../app/hooks/use-modal-store";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Server name is required",
  }),
  imageUrl: z.object({
    url: z.string().min(1, { message: "Image is required" }),
    type: z.string().optional(),
    name: z.string().optional(),
  }),
});

export const EditServerModal = () => {
  const { isOpen, type, onClose, data } = useModal();
  const router = useRouter();

  const isModalOpen = isOpen && type === "editServer";
  const { server } = data;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: {
        url: "",
        type: "",
        name: "",
      },
    },
  });

  useEffect(() => {
    if (server) {
      form.setValue("name", server.name);
      form.setValue("imageUrl", {
        url: server.imageUrl,
        type: "image/png", // or guess from extension or leave undefined
        name: "server-image.png",
      });
    }
  }, [form, server]);

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/servers/${server?.id}`, {
        name: values.name,
        imageUrl: values.imageUrl.url, // send only the URL
      });
      form.reset();
      router.refresh();
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent 
      onKeyDown={handleKeyDown}
      className="bg-[#36454F] text-[#FFFFFA] max-w-md w-full h-[450px] p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Edit server
          </DialogTitle>
          <DialogDescription className="text-center text-[#FFFFFA]">
            Give your server a personality with a name and an image. You can
            always change it later.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form  onSubmit={(e) => e.preventDefault()} className="space-y-8">
            <div className="space-y-8 px-6">
              <div className="flex justify-center items-center w-full h-[90px]">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          endpoint="serverImage"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-[#FFFFFA]">
                      Server Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-white border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                        placeholder="Enter Server Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="px-5 pb-5">
              <Button 
              disabled={isLoading} 
              variant="primary"
              onClick={form.handleSubmit(onSubmit)}
            >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

