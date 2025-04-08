import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export const getSessionOnServer = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    return session
}

export const getServerUserId = async (request: NextRequest) => {
    const session = await auth.api.getSession({
        headers: request.headers,
    });
    if (!session) {
        throw new Error('Unable to get user data')
    }
    return session.user.id
}