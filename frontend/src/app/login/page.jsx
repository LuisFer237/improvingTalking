"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaGoogle } from "react-icons/fa";
import { signIn } from "next-auth/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user was redirected from a protected route
    const callbackUrl = searchParams.get("callbackUrl");
    if (callbackUrl && callbackUrl !== "/login") {
      setError("You must be logged in to access that page.");
    }
  }, [searchParams]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    //Login logic

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        if (result.error === "USER_NOT_FOUND") {
          setError("There is no account associated with this email.");
        } else if (result.error === "INVALID_PASSWORD") {
          setError("Incorrect password. Please try again.");
        } else if (result.error === "MISSING_CREDENTIALS") {
          setError("Please enter both email and password.");
        } else {
          setError("Invalid credentials. Please try again.");
        }

        return;
      }

      // Login successful

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex justify-center items-center h-screen">
      <div
        className="border-2 py-10 px-16 rounded-lg  bg-gray-100
                        shadow-lg border-gray-200 space-y-5 w-full max-w-xl"
      >
        <div>
          <p className="font-bold text-3xl text-start">Log in</p>
          <p className="text-sm text-start opacity-50 mt-2">
            Welcome back! Please enter your credentials.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6 w-full">
          <div>
            <label className="text-md font-medium mb-2 block">Email</label>
            <Input
              placeholder="example@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-md font-medium mb-2 block">Password</label>
            <Input
              placeholder="*********"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <p className="text-sm text-start opacity-50 mt-2">
            Don't have an account?{" "}
            <a href="/signup" className="text-blue-500">
              Sign up
            </a>
          </p>

          <div className="flex justify-center">
            <Button
              className="w-full text-md py-6"
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center items-center">
            <div className="w-full border-gray-400 border-t  rounded-2xl"></div>
            <p className="mx-4 w-auto text-sm whitespace-nowrap opacity-50">
              Or continue with
            </p>
            <div className="w-full border-gray-400 border-t  rounded-2xl"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="flex justify-around items-center">
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              aria-label="Submit"
            >
              <FaGoogle /> Google
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
