import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { GithubIcon } from "lucide-react";

const LoginPage = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Welcome Back!</CardTitle>
        <CardDescription>Login with your Githup Email Account </CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full" variant="outline">
          <GithubIcon className="size-4" />
          Sign in with your Githup
        </Button>
      </CardContent>
    </Card>
  );
};

export default LoginPage;
