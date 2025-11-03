"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaGoogle } from "react-icons/fa";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon, CheckCircle2Icon, PopcornIcon } from "lucide-react";
import { signIn } from "next-auth/react"

const SignupPage = () => {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      //Signup logic

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to sign up");
      }

      // Automatically log in the user after successful signup
      const signInRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      // If sign in fails, redirect to login page
      if (signInRes.error) {
        router.push("/login");
        return;
      }

      // Redirect to dashboard or home page after signup and login
      router.push("/dashboard");
      
    } catch (error) {
      setError(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div
        className="border-2 py-6 px-4 sm:py-8 sm:px-8 md:py-10 md:px-12 lg:px-16 rounded-lg bg-card
                    shadow-lg border-border space-y-5 w-full max-w-xl"
      >
        <div>
          <p className="font-bold text-2xl sm:text-3xl text-start text-foreground">Sign up</p>
          <p className="text-sm text-start text-muted-foreground mt-2">
            Welcome! Please enter your information.
          </p>
        </div>
  
        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-6 w-full">
          <div>
            <label className="text-sm sm:text-md font-medium mb-2 block text-foreground">Email</label>
            <Input
              placeholder="example@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm sm:text-md font-medium mb-2 block text-foreground">Password</label>
            <Input
              placeholder="*********"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
  
          <p className="text-sm text-start text-muted-foreground mt-2">
            Do you have an account?{" "}
            <a href="/login" className="text-primary hover:underline">
              Log in
            </a>
          </p>
  
          <div className="flex justify-center">
            <Button className="w-full text-sm sm:text-md py-5 sm:py-6" type="submit" disabled={loading}>
              {loading ? "Signing up..." : "Sign up"}
            </Button>
          </div>
  
          {error && (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertTitle>Sign up failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
  
          <div className="flex justify-center items-center gap-2 sm:gap-4">
            <div className="w-full border-border border-t rounded-2xl"></div>
            <p className="text-xs sm:text-sm whitespace-nowrap text-muted-foreground">Or continue with</p>
            <div className="w-full border-border border-t rounded-2xl"></div>
          </div>
  
          {/* Social Login Buttons */}
          <div className="flex justify-around items-center">
            <Button
              variant="outline"
              size="lg"
              className="w-full text-sm sm:text-base bg-transparent"
              aria-label="Sign up with Google"
            >
              <FaGoogle /> Google
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
