import { db } from '@/lib/db';
import { Profile, Server } from '@/lib/generated/prisma';
import { initialProfile } from '@/lib/initial-profile'
import { redirect } from 'next/navigation';
import React from 'react';
import InitialModal from "@/components/modals/initial-modal";

const SetupPage = async () => {
    const profile: Profile | any = await initialProfile();

    const server: Server | any = await db.server.findFirst({
        where: {
            members: {
                some: {
                    profileId: profile.id,
                },
            },
        },
    });

    if (server) {
        return redirect(`/servers/${server.id}`);
    }
  return <InitialModal />;
};

export default SetupPage;