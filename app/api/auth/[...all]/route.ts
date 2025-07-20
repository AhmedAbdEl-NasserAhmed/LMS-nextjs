// import arcjet from "@/lib/arcjet";
// import { protectSignup } from "@arcjet/next";
import arcjet, { protectSignup } from "@arcjet/next";
import { NextRequest, NextResponse } from "next/server";

// const emailOptions = {
//   mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
//   // Block emails that are disposable, invalid, or have no MX records
//   block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"]
// } satisfies EmailOptions;

// const botOptions = {
//   mode: "LIVE",
//   // configured with a list of bots to allow from
//   // https://arcjet.com/bot-list
//   allow: [] // prevents bots from submitting the form
// } satisfies BotOptions;

// const rateLimitOptions = {
//   mode: "LIVE",
//   interval: "2m", // counts requests over a 2 minute sliding window
//   max: 5 // allows 5 submissions within the window
// } satisfies SlidingWindowRateLimitOptions<[]>;

// const signupOptions = {
//   email: emailOptions,
//   // uses a sliding window rate limit
//   bots: botOptions,
//   // It would be unusual for a form to be submitted more than 5 times in 10
//   // minutes from the same IP address
//   rateLimit: rateLimitOptions
// } satisfies ProtectSignupOptions<[]>;

// async function protect(req: NextRequest): Promise<ArcjetDecision> {
//   const session = await auth.api.getSession({
//     headers: req.headers
//   });

//   // If the user is logged in we'll use their ID as the identifier. This
//   // allows limits to be applied across all devices and sessions (you could
//   // also use the session ID). Otherwise, fall back to the IP address.
//   let userId: string;
//   if (session?.user.id) {
//     userId = session.user.id;
//   } else {
//     userId = ip(req) || "127.0.0.1"; // Fall back to local IP if none
//   }

//   // If this is a signup then use the special protectSignup rule
//   // See https://docs.arcjet.com/signup-protection/quick-start
//   if (req.nextUrl.pathname.startsWith("/api/auth/sign-up")) {
//     // Better-Auth reads the body, so we need to clone the request preemptively
//     const body = await req.clone().json();

//     // If the email is in the body of the request then we can run
//     // the email validation checks as well. See
//     // https://www.better-auth.com/docs/concepts/hooks#example-enforce-email-domain-restriction
//     if (typeof body.email === "string") {
//       return arcjet
//         .withRule(protectSignup(signupOptions))
//         .protect(req, { email: body.email, fingerprint: userId });
//     } else {
//       // Otherwise use rate limit and detect bot
//       return arcjet
//         .withRule(detectBot(botOptions))
//         .withRule(slidingWindow(rateLimitOptions))
//         .protect(req, { fingerprint: userId });
//     }
//   } else {
//     // For all other auth requests
//     return arcjet
//       .withRule(detectBot(botOptions))
//       .protect(req, { fingerprint: userId });
//   }
// }

// const authHandlers = toNextJsHandler(auth.handler);

// export const { GET } = authHandlers;

const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    protectSignup({
      email: {
        mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
        // Block emails that are disposable, invalid, or have no MX records
        block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"]
      },
      bots: {
        mode: "LIVE",
        // configured with a list of bots to allow from
        // https://arcjet.com/bot-list
        allow: [] // "allow none" will block all detected bots
      },
      // It would be unusual for a form to be submitted more than 5 times in 10
      // minutes from the same IP address
      rateLimit: {
        // uses a sliding window rate limit
        mode: "LIVE",
        interval: "10m", // counts requests over a 10 minute sliding window
        max: 5 // allows 5 submissions within the window
      }
    })
  ]
});

// Wrap the POST handler with Arcjet protections
export const POST = async (req: NextRequest) => {
  const data = await req.json();
  const email = data.email;

  const decision = await aj.protect(req, {
    email
  });

  console.log("Arcjet decision: ", decision);

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
  } else {
    return NextResponse.json({
      message: "Hello world"
    });
  }
};
