"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, Heart, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fadeInUp, staggerContainer } from "../../utils/animations";

function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      router.push(redirect || "/");
    } catch (err: unknown) {
      const error = err as { code?: string };
      console.error("Login error:", err);
      if (error.code === "auth/invalid-credential") {
        setError("Invalid email or password");
      } else if (error.code === "auth/user-not-found") {
        setError("No account found with this email");
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password");
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later");
      } else {
        setError("Failed to sign in. Please try again");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cozy-cream py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="max-w-md mx-auto"
      >
        {/* Logo/Header */}
        <motion.div variants={fadeInUp} className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 12 }}
              transition={{ duration: 0.3 }}
              className="bg-rose-400 text-white p-3 rounded-full"
            >
              <Heart size={24} fill="currentColor" />
            </motion.div>
            <div className="flex flex-col items-start">
              <span className="text-3xl font-sans font-bold text-earthy-brown tracking-tight">
                Whiskerknots
              </span>
              <span className="text-xs font-sans text-rose-400 font-medium tracking-widest uppercase">
                Loops of Love
              </span>
            </div>
          </Link>
          <h1 className="mt-8 text-4xl font-bold text-earthy-brown font-serif">
            Welcome Back!
          </h1>
          <p className="mt-2 text-gray-600 font-sans">
            Sign in to your account to continue
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          variants={fadeInUp}
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-warm-peach/30"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3"
              >
                <AlertCircle
                  className="text-red-500 flex-shrink-0 mt-0.5"
                  size={20}
                />
                <p className="text-red-700 text-sm font-sans">{error}</p>
              </motion.div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-earthy-brown mb-2 uppercase tracking-wide"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="text-gray-400" size={20} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all font-sans"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-earthy-brown mb-2 uppercase tracking-wide"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={20} />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all font-sans"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-rose-400 to-rose-500 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Sign In
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-sans">
                Don&apos;t have an account?
              </span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <Link
              href="/signup"
              className="text-rose-500 font-bold hover:text-rose-600 transition-colors font-sans"
            >
              Create an account →
            </Link>
          </div>
        </motion.div>

        {/* Back to Home */}
        <motion.div variants={fadeInUp} className="mt-6 text-center">
          <Link
            href="/"
            className="text-gray-600 hover:text-earthy-brown transition-colors font-sans text-sm"
          >
            ← Back to home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default LoginPage;
