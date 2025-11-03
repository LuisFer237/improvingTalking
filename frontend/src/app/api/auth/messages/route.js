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

export async function GET(request) {
    try {
        const session = await getSession();

        const { searchParams } = new URL(request.url);
        const conversationId = searchParams.get("conversationId");

        if (!conversationId) {
            return NextResponse.json({
                error: "BAD_REQUEST",
                message: "conversationId is required",
            }, { status: 400 });
        }

        const messages = await prisma.message.findMany({
            where: {
                conversationId: conversationId,
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        // console.log("Retrieved messages:", messages);

        return NextResponse.json({ messages: messages }, { status: 200 });
    } catch (error) {
        return NextResponse.json({
            error: "INTERNAL_SERVER_ERROR",
            message: error.message,
        }, { status: 500 });
    }
}

export async function POST(request) {

    try {

        const session = await getSession();

        const { conversationId, content, sender } = await request.json();

        const newMessage = await prisma.message.create({
            data: {
                conversationId: conversationId,
                sender: sender,
                content: content,
                numberInOrder: 0,
                createdAt: new Date(),
            }
        });

        return NextResponse.json({ message: newMessage }, { status: 201 });

    } catch (error) {
        console.error("Error creating message:", error);
        return NextResponse.json({
            error: "INTERNAL_SERVER_ERROR",
            message: error.message,
        }, { status: 500 });

        
    }

}