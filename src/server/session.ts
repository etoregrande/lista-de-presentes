import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export const getSessionOnServer = async (request: NextRequest) => {
    const session = await auth.api.getSession({
        headers: request.headers,
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