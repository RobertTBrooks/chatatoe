import { getAuth } from "@clerk/nextjs/server";
import { db } from "./db";
import { NextApiRequest } from "next";

export const currentProfileMessages = async (req: NextApiRequest) => {
    try {
        const { userId } = await getAuth(req);
        if (!userId) return null;

        // console.log("currentProfile - userId:", userId);

        if (!userId) {
            console.log("currentProfile - No userId found");
            return null;
        }

        const profile = await db.profile.findUnique({
            where: {
                userId: userId,
            },
        });

        if (!profile) {
            console.log(`currentProfile - No profile found for userId: ${userId}`);
        } else {
            console.log(`currentProfile - Profile found for userId: ${userId}`);
        }

        return profile;
    } catch (error) {
        console.error("Error in currentProfile:", error);
        return null;
    }
};