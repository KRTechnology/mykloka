import { NextResponse } from "next/server";
import { db } from "@/lib/db/config";
import { roles } from "@/lib/db/schema";

export async function GET() {
  try {
    const allRoles = await db.select().from(roles);

    return NextResponse.json(allRoles, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Failed to fetch roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 500 }
    );
  }
}
