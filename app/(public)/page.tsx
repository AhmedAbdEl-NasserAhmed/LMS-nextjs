"use client";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

import Link from "next/link";

interface featureProps {
  title: string;
  description: string;
  icon: string;
}

const features: featureProps[] = [
  {
    title: "Comprehensive Courses",
    description:
      "Access a wide range of carefully curated courses designed by industry experts.",
    icon: "📚"
  },
  {
    title: "Interactive Learning",
    description:
      "Engage with interactive content, quizzes, and assignments to enhance your learning experience.",
    icon: "🕹️"
  },
  {
    title: "Progress Tracking",
    description:
      "Monitor your progress and achievements with detailed analytics and personalized dashboards.",
    icon: "📊"
  },
  {
    title: "Community Support",
    description:
      "Join a vibrant community of learners and instructors to collaborate and share knowledge.",
    icon: "👥"
  }
];

export default function Home() {
  const { data: session } = authClient.useSession();

  return (
    <>
      <section className="reltive py-20">
        <div className="flex flex-col items-center justify-center text-center space-y-8">
          <Badge variant="outline">The Future of Online Eductioan</Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight ">
            Elevate your Learning Expereince
          </h1>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            Discover a new way to learn with our modern, interactive learning
            managment system. Access high-quality courses anytime, anywhere.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link
              href="/courses"
              className={buttonVariants({
                size: "lg"
              })}
            >
              Explore Courses
            </Link>
            {!session && (
              <Link
                href="/login"
                className={buttonVariants({
                  size: "lg",
                  variant: "outline"
                })}
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </section>
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
        {features.map((feature) => {
          return (
            <Card
              key={feature.title}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="text-4xl mb-4">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </section>
    </>
  );
}
