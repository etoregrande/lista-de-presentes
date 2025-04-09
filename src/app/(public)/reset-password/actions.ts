// Will be usable only to update password. Saving for future reference

// 'use server'

// import { auth } from "@/lib/auth";

// export const updatePassword = async (password: string): Promise<null> => {
//     try {
//         const ctx = await auth.$context;
//         const hash = await ctx.password.hash(password);

//         await ctx.internalAdapter.updatePassword("userId", hash)

//         return
//     } catch (error) {
//         throw new Error('Internal server error')
//     }
// }