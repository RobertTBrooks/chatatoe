import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const currentProfile = async () => {
  const { userId }: any = await auth();

  console.log("userId", userId);

  if (!userId) {
    return null;
  }

  const profile = await db.profile.findUnique({
    where: {
      userId: userId,
    },
  });

  return profile;
};
