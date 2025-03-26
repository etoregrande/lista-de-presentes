"use server";

import { auth } from "@/lib/auth";
import { signInFormData, SignUpFormData } from "@/types/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";


export const signUp = async (payload: SignUpFormData) => {
    const { name, email, password } = payload;
    // const passwordHash = await bcrypt.hash(password, 10);

    const response: Response = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password,
        },
        asResponse: true,
    });
    console.log(response)
    return response.json();
}


export const signIn = async (payload: signInFormData) => {
    const { email, password } = payload;

    const response: Response = await auth.api.signInEmail({
        body: {
            email,
            password,
        },
        asResponse: true,
    });

    return response.json();
}

export const signOut = async () => {
    await auth.api.signOut({
        headers: await headers(),
    });
    return redirect("/login");
}