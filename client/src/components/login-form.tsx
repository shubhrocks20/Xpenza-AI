import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { Github, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { githubAuth, googleAuth, login } from "@/http";
import { OrbitingCirclesDemo } from "./Demo";
import { toast } from "sonner";



export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });
  const loginMutation = useMutation({
    mutationFn: login, 
    onSuccess: (data) => {
      toast(data.success, {
        description: data.message
      })
      setTimeout(() => {

        window.location.reload()
      }, 1000)
    },
    onError: (err : any) => {
      console.log(err)
      toast(err.response.data.error.message, {
        description: err.response.data.message,
      })

    }
  })
  const googleMutation = useMutation({
    mutationFn: googleAuth,
    onSuccess: (data) => {
      console.log(data);
      window.location.reload();
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loginMutation.mutate(formData)
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      googleMutation.mutate(response.access_token);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const handleGithubLogin = () => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${
      import.meta.env.VITE_GITHUB_CLIENT_ID
    }&redirect_uri=${window.location.origin}/login&scope=user`;
    window.location.href = githubAuthUrl;
  };
  const githubMutation = useMutation({
    mutationFn: githubAuth,
    onSuccess: () => {
      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      window.location.reload();
    },
    onError: (err) => {
      console.error("GitHub Auth Error:", err);
    },
  });
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      githubMutation.mutate(code);
    }
  }, []);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your GitHub or Google account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {githubMutation.isPending || googleMutation.isPending ? (
            <>
              <OrbitingCirclesDemo />
            </>
          ) : (
            <form onSubmit={handleLogin}>
              <div className="grid gap-6">
                <div className="flex flex-col gap-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    type="button"
                    onClick={handleGithubLogin}
                  >
                    <Github className="size-4" />
                    Login with GitHub
                  </Button>
                  <Button
                    variant="outline"
                    type={"button"}
                    className="w-full"
                    // @ts-ignore
                    onClick={handleGoogleLogin}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    Login with Google
                  </Button>
                </div>
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="relative z-10 bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="emailOrUsername">Email Or Username</Label>
                    <Input
                      id="emailOrUsername"
                      type="text"
                      placeholder="m@example.com"
                      required
                      value={formData.emailOrUsername}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <a
                        href="#"
                        className="ml-auto text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </a>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                   {loginMutation.isPending ? <Loader2 className="animate-spin" /> : 'Login'} 
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <a href="#" className="underline underline-offset-4">
                    Sign up
                  </a>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    
    </div>
  );
}
