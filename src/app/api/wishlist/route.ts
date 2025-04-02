import { NextRequest, NextResponse } from "next/server";
import { createWishlistItem, listWishlistItems } from "@/server/wishlistItem";
import { getSessionOnServer } from "@/server/session";

export async function POST(request: NextRequest) {
    const session = await getSessionOnServer(request)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.json();

    try {
        const newItem = await createWishlistItem(formData, session.user.id);
        if (!newItem) {
            return NextResponse.json({ error: "Bad request" }, { status: 400 });
        }

        return NextResponse.json({ success: 'ok' });
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}


// export async function GET(request: NextRequest) {
//     const session = await getSessionOnServer(request)
//     if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     try {
//         const wishlistItems = listWishlistItems(session.user.id)
//         return NextResponse.json(wishlistItems);

//     } catch (error) {
//         console.log(error)
//         return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//     }
// }
