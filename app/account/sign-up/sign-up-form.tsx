"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import signup from "@/actions/auth/sign-up";
import { ReloadIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";

function FormButton({ children }: { children?: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit">
      { pending ? <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> : children }
    </Button>
  );
}

export default function SignUpForm({ returnUrl }: { returnUrl?: string }) {
  const [state, formAction] = useFormState(signup, { errors: { } });

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

    if (state.errors.other) {
      toast({
        title: "Error",
        description: state.errors.other,
        variant: "destructive"
      });

      return;
    }
  }, [state.errors.username, state.errors.password, state.errors.other]);

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Sign up</CardTitle>
        <CardDescription>Enter your information to create an account</CardDescription>
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

            <FormButton>Sign up</FormButton>

            <div className="mt-4 text-center text-sm">
              Already have an account? <Link href={returnUrl ? `/account/sign-in?returnUrl=${returnUrl}` : "/account/sign-in"} className="underline">Sign in</Link>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}