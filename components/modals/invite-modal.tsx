"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import axios from "axios";
import { useModal } from "../../app/hooks/use-modal-store";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useOrigin } from "../../app/hooks/use-origin";
import { Button } from "../ui/button";
import { useState } from "react";
import { Check, Copy, RefreshCw } from "lucide-react";

export const InviteModal = () => {
  const { isOpen, type, onClose, data, onOpen } = useModal();
  const origin = useOrigin();

  const isModalOpen = isOpen && type === "invite";
  const { server } = data;

  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const inviteUrl = `${origin}/invite/${server?.inviteCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const handleNewInvite = async () => {
    try {
      setIsLoading(true);
      const response = await axios.patch(
        `/api/servers/${server?.id}/invite-code`
      );
      onOpen("invite", { server: response.data });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#36454F] text-[#FFFFFA] p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Invite Friends
          </DialogTitle>
          <DialogDescription className="text-center text-[#FFFFFA]">
            Invite your friends to keep your discord much more fun &
            interesting.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6">
          <Label className="uppercase text-xs font-bold text-[#FFFFFA]">
            Server Invite Link
          </Label>
          <div className="flex items-center mt-2 gap-x-2">
            <Input
              className="bg-white border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
              value={inviteUrl}
              onChange={() => {/* Handle change if needed */}}
              disabled={isLoading}
            />
            <Button
              disabled={isLoading}
              onClick={handleCopy}
              size="icon"
              className="text-black bg-white hover:bg-green-300 active:bg-green-500"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className=" w-4 h-4" />}
            </Button>
          </div>
          <Button
            onClick={handleNewInvite}
            disabled={isLoading}
            size="sm"
            variant="link"
            className="text-xs text-[#72dcfc] mt-4 cursor-pointer font-bold"
          >
            Generate a new link <RefreshCw className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

