import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const getSession = async () => {
    const session = await auth();
    if (!session) {
        throw new Error("UNAUTHORIZED");
    }
    return session;
}

export async function GET(request, { params }) {

    try {

        const session = await getSession();

        const conversation = await prisma.conversation.findFirst({
            where: {
                id: params.id,
                userId: session.user.id,
            }
        })

        if (!conversation) {
            return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
        }

        return NextResponse.json({ conversation });
        
    } catch (error) {
        return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
    }

}

export async function DELETE(request, { params }) {

    // console.log("DELETE request received for conversation ID:", params.id);

    try {

        const session = await getSession();

        const { id: conversationId } = await params;


        await prisma.message.deleteMany({
            where: {
                conversationId: conversationId,
            }
        })

        await prisma.conversation.deleteMany({
            where: {
                id: conversationId,
                userId: session.user.id,
            },
        })

        return NextResponse.json({
            message: "Conversation deleted successfully.",
            status: 200
        })

    } catch (error) {

        // console.error("Error deleting conversation:", error);

        return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
    }

}