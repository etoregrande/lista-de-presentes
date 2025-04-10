'use server'

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export const getSessionOnServer = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) redirect('/login')
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