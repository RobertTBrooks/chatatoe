"use client"
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose, DialogFooter } from '../ui/dialog';
import { modalStyles } from './styles';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import FileUpload from "../file-upload";
import axios from "axios"
import { useRouter } from "next/navigation";

interface UploadedFile {
  url: string;
  type?: string;
  name?: string;
}

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

const InitialModal = () => {
    const [isMounted, setIsMounted] = useState(false);

    const router = useRouter()

    useEffect(()=> {
        setIsMounted(true)
    }, []);
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

    type FormValues = z.infer<typeof formSchema>;

    const isLoading = form.formState.isSubmitting;
    

    const onSubmit = async (values: FormValues) => {
    try {
        await axios.post("/api/servers", {
            name: values.name,
            imageUrl: values.imageUrl.url, // send only the URL
        });
        form.reset();
        router.refresh();
        window.location.reload();
    } catch (error) {
        console.log(error);
    }
};
    
    return (
    <Dialog open>
        <DialogClose className="hidden" /> 
        <DialogContent className={modalStyles.content}>
        <DialogHeader className={modalStyles.header}>
            <DialogTitle className={modalStyles.titleFontSize}>
                Customize your Server <hr />
            </DialogTitle>
            <DialogDescription className={modalStyles.description}>
                Give your Server a name and an Image.
                Images can be changed at any time.
            </DialogDescription>
        </DialogHeader>
        <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="space-y-8 px-6">
                        <div className="flex justify-center items-center">
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
                        )}/>
                    </div>
                
                <FormField
                control={form.control} name="name" render={({field}) => (
                    <FormItem>
                        <FormLabel className={modalStyles.labels}> Server Name </FormLabel>
                        <FormControl>
                            <Input disabled={isLoading} className={modalStyles.inputs} placeholder="Enter Server Name" {...field}></Input>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                </div>
                <DialogFooter className="px-6 pb-6">
                    <Button disabled={isLoading} variant="primary">Create</Button>
                </DialogFooter>
            </form>
        </Form>
        </DialogContent>

    </Dialog>
  );
};

export default InitialModal