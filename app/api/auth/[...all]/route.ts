import arcjet, { protectSignup } from "@arcjet/next";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Arcjet instance
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    protectSignup({
      email: {
        mode: "LIVE",
        block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"]
      },
      bots: {
        mode: "LIVE",
        allow: []
      },
      rateLimit: {
        mode: "LIVE",
        interval: "10m",
        max: 5
      }
    })
  ]
});

export const { GET } = toNextJsHandler(auth.handler);

// ✅ POST: Arcjet-protected signup
export const POST = async (req: NextRequest) => {
  const data = await req.json();
  const email = data.email;

  const decision = await aj.protect(req, { email });

  if (decision.isDenied()) {
    if (decision.reason.isEmail()) {
      return NextResponse.json(
        {
          message: "Invalid email",
          reason: decision.reason
        },
        { status: 400 }
      );
    } else {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.json({ message: "Signup accepted" });
};
