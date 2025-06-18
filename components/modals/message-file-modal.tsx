"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "../ui/dialog";
import { modalStyles } from "./styles";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { Button } from "../ui/button";
import FileUpload from "../file-upload";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useModal } from "@/app/hooks/use-modal-store";
import { useSocket } from "@/components/providers/socket-provider";
import qs from "query-string";

const formSchema = z.object({
  fileUrl: z.object({
    url: z.string().min(1, { message: "Attachment is required" }),
    type: z.string(),
    name: z.string(),
  }),
});

const MessageFileModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();
  const { socket } = useSocket();

  const isModalOpen = isOpen && type === "messageFile";
  const { apiUrl, query } = data || {};

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fileUrl: {
        type: "",
        url: "",
        name: "",
      },
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  type FormValues = z.infer<typeof formSchema>;
  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: FormValues) => {
    try {
      const url = qs.stringifyUrl({
        url: apiUrl || "",
        query: query || {},
      });

      console.log("Submitting to URL:", url);
      console.log("Submitting values:", values);

      const response = await axios.post(url, {
        content: values.fileUrl.url,
        fileUrl: values.fileUrl.url,
        name: values.fileUrl.name,
        type: values.fileUrl.type,
      });

      // Emit the new message to all clients
      if (socket) {
        socket.emit('new-message', {
          ...response.data,
          channelId: query?.channelId || query?.conversationId
        });
      }

      form.reset();
      router.refresh();
      handleClose();
    } catch (error) {
      console.error("Error submitting message:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Response data:", error.response.data);
      }
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogClose className="hidden" />
      <DialogContent className="bg-[#36454F] text-[#FFFFFA] max-w-md w-full h-[350px] p-0 overflow-hidden">
        <DialogHeader className={modalStyles.header}>
          <DialogTitle className={modalStyles.titleFontSize}>
            Add an attachment
          </DialogTitle>
          <DialogDescription className={modalStyles.description}>
            Send a file as a message
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
            <div className="space-y-8 px-6">
              <div className="flex justify-center items-center">
                <FormField
                  control={form.control}
                  name="fileUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          endpoint="messageFile"
                          value={field.value}
                          onChange={(value) => field.onChange(value ?? null)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter className="px-6 pb-6">
              <Button 
                disabled={isLoading} 
                variant="primary"
                className="w-full"
                onClick={form.handleSubmit(onSubmit)}
              >
                Send
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MessageFileModal;