"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Heart,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fadeInUp, staggerContainer } from "../../utils/animations";

function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await signup(formData.email, formData.password, formData.displayName);
      router.push("/");
    } catch (err: unknown) {
      const error = err as { code?: string };
      console.error("Signup error:", err);
      if (error.code === "auth/email-already-in-use") {
        setError("An account with this email already exists");
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak");
      } else {
        setError("Failed to create account. Please try again");
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
            Join Our Community
          </h1>
          <p className="mt-2 text-gray-600 font-sans">
            Create an account to start shopping
          </p>
        </motion.div>

        {/* Signup Form */}
        <motion.div
          variants={fadeInUp}
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-warm-peach/30"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
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

            {/* Display Name Field */}
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-bold text-earthy-brown mb-2 uppercase tracking-wide"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="text-gray-400" size={20} />
                </div>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all font-sans"
                  placeholder="Jane Doe"
                />
              </div>
            </div>

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
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all font-sans"
                  placeholder="••••••••"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 font-sans">
                Must be at least 6 characters
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-bold text-earthy-brown mb-2 uppercase tracking-wide"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={20} />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all font-sans"
                  placeholder="••••••••"
                />
                {formData.confirmPassword &&
                  formData.password === formData.confirmPassword && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <CheckCircle className="text-green-500" size={20} />
                    </div>
                  )}
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
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Create Account
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-sans">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="mt-4 text-center">
            <Link
              href="/login"
              className="text-rose-500 font-bold hover:text-rose-600 transition-colors font-sans"
            >
              Sign in instead →
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

export default SignupPage;
