"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import axios from "axios";
import { useModal } from "../../app/hooks/use-modal-store";
import { Button } from "../ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export const DeleteServerModal = () => {
  const { isOpen, type, onClose, data } = useModal();
  const router = useRouter();

  const isModalOpen = isOpen && type === "deleteServer";
  const { server } = data;

  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
        setIsLoading(true);

        await axios.delete(`/api/servers/${server?.id}/delete`);
        onClose();
        router.refresh();
        router.push("/");
    } catch (error) {
        console.log(error);
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#36454F] text-[#FFFFFA] p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Delete Server
          </DialogTitle>
          <DialogDescription className="text-center text-[#FFFFFA]">
            Would you like to Delete your server : <span className="font-semibold text-rose-400">{server?.name}</span> ?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="px-15 py-6">
            <div className="flex items-center justify-between w-full">
                <Button 
                onClick={onClick}
                disabled={isLoading}
                className="bg-green-700 hover:bg-green-300 hover:text-black text-white w-32 h-10 font-bold">
                    Confirm
                </Button>
                <Button 
                onClick={onClose}
                disabled={isLoading}
                className="bg-[#A61C3C] hover:bg-red-300 hover:text-black text-white w-32 h-10 font-bold">
                    Cancel
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

