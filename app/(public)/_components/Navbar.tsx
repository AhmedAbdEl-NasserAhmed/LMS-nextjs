"use client";
import { buttonVariants } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/modeToggle";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import Image from "next/image";
import DropDownMenuComponent from "./DropDownMenu";

const navigationItems = [
  { name: "Home", href: "/" },
  { name: "Courses", href: "/courses" },
  { name: "Dashboard", href: "/dashboard" }
];

export function Navbar() {
  const { data: session, isPending } = authClient.useSession();
  

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-[backdrop-filter]:bg-background/60">
      <div className="container flex min-h-16 items-center mx-auto px-4 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2 mr-4">
          <Image
            src="/icon.png"
            alt="Logo"
            className="size-9"
            width={36}
            height={36}
          />
          <span className="font-bold">LMS.</span>
        </Link>
        {/* Desktop navigation */}
        <nav className=" hidden  md:flex md:flex-1 md:items-center md:justify-between">
          <div className="flex items-center space-x-2">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center space-x-4 ">
            {isPending ? null : session ? (
              <>
                <DropDownMenuComponent
                  email={session.user.email}
                  userName={
                    session?.user.name && session.user.name.length > 0
                      ? session?.user.name
                      : session?.user.email.split("@")[0]
                  }
                  image={
                    session.user.image ||
                    `https://avatar.vercel.sh/${session?.user.email}`
                  }
                />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={buttonVariants({ variant: "secondary" })}
                >
                  Login
                </Link>
                <Link href="/login" className={buttonVariants()}>
                  Get Started
                </Link>
              </>
            )}
            <ModeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
