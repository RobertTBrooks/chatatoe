import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export type paramsType = Promise<{ serverId: string }>;

export async function DELETE(
    req: Request,
    { params }: { params: paramsType }
) {
    try {
        const profile = await currentProfile();
        const { serverId } = await params;

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const server = await db.server.delete({
            where: {
                id: serverId,
                profileId: profile.id,
            }
        });

        return NextResponse.json(server);
        
    } catch (error) {
        console.log("[SERVER_ID_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}