"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaGoogle } from "react-icons/fa";


const LoginPage = () => {
  
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    //Login logic

    //Redirect to dashboard or home page after login
    router.push("/dashboard");

  }
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
            <Input placeholder="example@example.com" size="lg" />
          </div>
          <div>
            <label className="text-md font-medium mb-2 block">Password</label>
            <Input placeholder="*********" type="password" size="lg" />
          </div>

          <p className="text-sm text-start opacity-50 mt-2">
            Don't have an account? <a href="/signup" className="text-blue-500">Sign up</a>
          </p>

          <div className="flex justify-center">
            <Button className="w-full text-md py-6">Log In</Button>
          </div>

          <div className="flex justify-center items-center">
            <div className="w-full border-gray-400 border-t  rounded-2xl"></div>
            <p className="mx-4 w-auto text-sm whitespace-nowrap opacity-50">
              Or continue with
            </p>
            <div className="w-full border-gray-400 border-t  rounded-2xl"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="flex justify-around items-center">
            <Button variant="outline" size="lg" className="w-full" aria-label="Submit">
              <FaGoogle /> Google
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
