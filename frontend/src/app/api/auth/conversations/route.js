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

export async function GET() {
    try {

        const session = await getSession();

        const conversations = await prisma.conversation.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                title: true,
            },
        });

        return NextResponse.json({ conversations });
    } catch (err) {

        return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
    }
}

export async function POST(request) {

    try {

        const session = await getSession();

        const { title = "New Conversation", summary = "This is a new conversation." } = await request.json();

        const newConversation = await prisma.conversation.create({
            data: {
                title,
                summary,
                userId: session.user.id,
            },
        });

        return NextResponse.json({ conversation: newConversation });

    } catch (error) {
        console.error("Error creating conversation:", error);
        return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
    }
}