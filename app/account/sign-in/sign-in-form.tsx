"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import signin from "@/actions/auth/sign-in";
import Link from "next/link";
import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { ReloadIcon } from "@radix-ui/react-icons";

function FormButton({ children }: { children?: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit">
      { pending ? <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> : children }
    </Button>
  );
}

export default function SignInForm({ returnUrl }: { returnUrl?: string }) {
  const [state, formAction] = useFormState(signin, { errors: {} });

  useEffect(() => {
    if (state.errors.username) {
      toast({
        title: "Form error",
        description: state.errors.username[0],
        variant: "destructive"
      });
      
      return;
    }

    if (state.errors.password) {
      toast({
        title: "Form error",
        description: state.errors.password[0],
        variant: "destructive"
      });

      return;
    }

    if (state.errors.authentication) {
      toast({
        title: "Authentication error",
        description: state.errors.authentication[0],
        variant: "destructive"
      });

      return;
    }

    if (state.errors.other) {
      toast({
        title: "Error",
        description: state.errors.other,
        variant: "destructive"
      });
    }
  }, [state.errors.username, state.errors.password, state.errors.authentication, state.errors.other]);

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Sign in</CardTitle>
        <CardDescription>Enter your credentials below before making any further progress</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" placeholder="Enter your username" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Enter your password" required />
            </div>

            <FormButton>Sign in</FormButton>

            <div className="mt-4 text-center text-sm">
              Haven't have an account yet? <Link href={ returnUrl ? `/account/sign-up?returnUrl=${returnUrl}` : "/account/sign-up"} className="underline">Sign up</Link>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}