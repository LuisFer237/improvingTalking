import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(request) {
    try{
    const { email, password } = await request.json()

    if (!email || !password) {
        return NextResponse.json(
            { error: "MISSING_CREDENTIALS" },
            { status: 400 })
    }

    const exisitingUser = await prisma.user.findUnique({
        where: { email }
    })

    if (exisitingUser) {
        return NextResponse.json(
            {error: "USER_ALREADY_EXISTS"},
            { status: 400 }
        )
    }

    const hashedPassword = await bcrypt.hash(password,10)

    const newUser = await prisma.user.create({
        data: {
            email,
            password: hashedPassword
        }
    })

    return NextResponse.json(
        { message : "USER_CREATED_SUCCESSFULLY", userId : newUser.id},
        { status: 201 }
    )

    } catch (error) {
        return NextResponse.json(
            { error: "INTERNAL_SERVER_ERROR"},
            { status: 500 },
            { information : error.message },
        )
    }

}