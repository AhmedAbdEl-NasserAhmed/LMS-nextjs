"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { GithubIcon, Loader, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

const LoginForm = () => {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [emailPending, startEmailTransition] = useTransition();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  function signInWithGithub() {
    startTransition(async () => {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed in with Github , you will be redirected");
          },
          onError: () => {
            toast.error("Internal server Error");
          }
        }
      });
    });
  }

  function signInWithEmail() {
    startEmailTransition(async () => {
      try {
        await authClient.signIn.email({
          email,
          password
        });
        toast.success("Logged in");
        router.push("/");
      } catch {
        toast.error("Login failed");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Welcome Back!</CardTitle>
        <CardDescription>
          Login with your Githup or Email Account{" "}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button
          onClick={signInWithGithub}
          className="w-full"
          variant="outline"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader className="size-4 animate-spin" />
              <span>Loading....</span>
            </>
          ) : (
            <>
              <GithubIcon className="size-4" />
              Sign in with your Githup
            </>
          )}
        </Button>

        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="e@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="write your password"
              required
            />
          </div>
          <Button onClick={signInWithEmail} disabled={emailPending}>
            {emailPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Loading....</span>
              </>
            ) : (
              <>
                <Send className="size-4" />
                <span>Continue with Email</span>
              </>
            )}
          </Button>
          <Link
            href="./login/signup"
            className={buttonVariants({
              variant: "outline"
            })}
          >
            Sign Up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
