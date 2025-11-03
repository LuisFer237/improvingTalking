import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function POST(request, { params }) {

    console.log("Received feedback POST request for message ID:", params.id);

    try {

        const { feedback } = await request.json();
        const { id } = params;

        await prisma.message.update({
            where: { id: id },
            data: {
                feedback: feedback
            }
        })

        return NextResponse.json({ message: "Feedback saved successfully." });
        
    } catch (error) {
        console.error("Error saving feedback:", error);
        return NextResponse.json({ error: "Failed to save feedback." }, { status: 500 });
    }

}