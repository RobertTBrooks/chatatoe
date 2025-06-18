// pages/api/socket/io.ts

import { Server as NetServer } from "http";
import { Server as ServerIO } from "socket.io";
import { NextApiRequest } from "next";
import { NextApiResponseServerIo } from "@/types";

export const config = {
    api: {
        bodyParser: false,
    },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
    if (!res.socket.server.io) {
        console.log("Socket is initializing");
        const httpServer: NetServer = res.socket.server as unknown as NetServer;
        const io = new ServerIO(httpServer, {
            path: "/api/socket/io",
            addTrailingSlash: false,
        });

        io.on("connection", (socket) => {
            console.log(`Socket connected: ${socket.id}`);

            socket.on("join-channel", (channelId: string) => {
                socket.join(channelId);
            });

            socket.on("leave-channel", (channelId: string) => {
                socket.leave(channelId);
            });

            socket.on("new-message", (message: any) => {
                io.to(message.channelId).emit(`chat:${message.channelId}:messages`, message);
            });

            socket.on("update-message", (message: any) => {
                io.to(message.channelId).emit(`chat:${message.channelId}:messages:update`, message);
            });

            socket.on("disconnect", () => {
                console.log(`Socket disconnected: ${socket.id}`);
            });
        });

        res.socket.server.io = io;
    }

    res.end();
};

export default ioHandler;