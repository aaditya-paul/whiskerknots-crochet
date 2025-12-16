"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  LogOut,
  ShoppingBag,
  Heart,
  Edit2,
  Save,
  X,
  Package,
  Calendar,
  Settings,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { fadeInUp, staggerContainer } from "../../utils/animations";

function ProfilePage() {
  const router = useRouter();
  const { user, userProfile, logout, updateUserProfile, loading } = useAuth();
  const { items } = useCart();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  const helpItems = [
    { id: 1, label: "Care Instructions", link: "/care" },
    { id: 2, label: "Return Policy", link: "/returns" },
    { id: 3, label: "Contact Support", link: "/contact" },
  ];

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (userProfile) setDisplayName(userProfile.displayName || "");
  }, [userProfile]);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setFavoriteCount(favorites.length);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) return;
    setIsSaving(true);
    try {
      await updateUserProfile(displayName);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffdf7] flex flex-col items-center justify-center p-4">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="bg-[#f4c2c2] p-4 rounded-full text-white shadow-xl"
        >
          <Heart fill="currentColor" size={32} />
        </motion.div>
        <p className="mt-4 font-serif text-[#8d6e63] font-bold">
          Winding the yarn...
        </p>
      </div>
    );
  }

  if (!user || !userProfile) return null;

  return (
    <div className="min-h-screen bg-[#fffdf7] py-8 md:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Elements - Hidden on very small screens to save resources */}
      <div className="hidden sm:block absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-[#ffdab9]/20 rounded-full blur-3xl -mr-20 -mt-20" />
      <div className="hidden sm:block absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-[#f4c2c2]/10 rounded-full blur-3xl -ml-20 -mb-20" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="max-w-5xl mx-auto relative z-10"
      >
        {/* Header Section */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-6"
        >
          <div className="text-center md:text-left">
            <span className="text-[#f4c2c2] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-xs">
              Member Dashboard
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-[#8d6e63] mt-2 leading-tight break-words">
              Hello,{" "}
              <span className="text-[#f4c2c2]">
                {
                  (
                    userProfile?.displayName ||
                    user?.displayName?.split("@")[0] ||
                    "Maker"
                  ).split(" ")[0]
                }
                !
              </span>
            </h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#2f2e33] text-white rounded-2xl font-bold text-sm shadow-lg w-full md:w-auto transition-colors hover:bg-[#403f44]"
          >
            <LogOut size={18} /> Sign Out
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-6 md:space-y-8">
            {/* Profile Info Card */}
            <motion.div
              variants={fadeInUp}
              className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl shadow-[#8d6e63]/5 p-6 md:p-10 border border-[#ffdab9]/30 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 md:p-8 opacity-5 pointer-events-none">
                <Settings size={80} className="md:w-[120px] md:h-[120px]" />
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6 mb-8 md:mb-10 text-center sm:text-left">
                <div className="relative">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-[#f4c2c2] to-[#ffdab9] rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-white shadow-inner">
                    <User className="w-9 h-9 md:w-10 md:h-10" />
                  </div>
                  <button className="absolute -bottom-1 -right-1 bg-white p-2 rounded-xl shadow-md border border-[#ffdab9]/50 text-[#8d6e63] hover:text-[#f4c2c2] transition-colors">
                    <Edit2 size={14} />
                  </button>
                </div>
                <div className="pt-2">
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#8d6e63]">
                    Account Identity
                  </h2>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-[#8d6e63]/60 text-xs md:text-sm mt-1">
                    <Calendar size={14} />
                    <span>
                      Joined{" "}
                      {userProfile?.createdAt
                        ? new Date(userProfile.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "long", year: "numeric" }
                          )
                        : "Recently"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#f4c2c2] ml-2">
                    Display Name
                  </label>
                  <AnimatePresence mode="wait">
                    {isEditing ? (
                      <motion.div
                        key="edit"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-wrap gap-2"
                      >
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="flex-1 min-w-[150px] px-4 md:px-5 py-3 md:py-4 rounded-2xl border-2 border-[#ffdab9]/30 focus:border-[#f4c2c2] outline-none font-sans bg-[#fffdf7] text-sm md:text-base"
                        />
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 sm:flex-none p-4 bg-[#a5d6a7] text-white rounded-2xl"
                          >
                            <Save
                              size={20}
                              className={isSaving ? "animate-spin" : ""}
                            />
                          </button>
                          <button
                            onClick={() => setIsEditing(false)}
                            className="flex-1 sm:flex-none p-4 bg-gray-100 text-[#8d6e63] rounded-2xl"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="flex items-center justify-between p-4 md:p-5 bg-[#fffdf7] rounded-2xl border border-[#ffdab9]/20 group">
                        <span className="font-sans font-medium text-[#8d6e63] text-sm md:text-base truncate mr-2">
                          {userProfile?.displayName ||
                            user?.displayName ||
                            "Not set"}
                        </span>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="sm:opacity-0 group-hover:opacity-100 transition-opacity text-[#f4c2c2]"
                        >
                          <Edit2 size={18} />
                        </button>
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#f4c2c2] ml-2">
                    Email Hook
                  </label>
                  <div className="flex items-center gap-3 p-4 md:p-5 bg-[#fffdf7] rounded-2xl border border-[#ffdab9]/20">
                    <Mail
                      size={18}
                      className="text-[#8d6e63]/40 flex-shrink-0"
                    />
                    <span className="font-sans text-[#8d6e63]/70 text-sm md:text-base truncate">
                      {user?.email || "No email provided"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Grid - 1 col on mobile, 2 on tablet, 3 on desktop */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
            >
              {[
                {
                  label: "In Cart",
                  val: items.length,
                  icon: ShoppingBag,
                  color: "bg-[#ffdab9]",
                  text: "text-[#8d6e63]",
                },
                {
                  label: "Favorites",
                  val: favoriteCount,
                  icon: Heart,
                  color: "bg-[#f4c2c2]",
                  text: "text-white",
                },
                {
                  label: "Orders",
                  val: 0,
                  icon: Package,
                  color: "bg-[#a5d6a7]",
                  text: "text-[#2f2e33]",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className={`${stat.color} p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] flex flex-col items-center justify-center shadow-lg relative group overflow-hidden`}
                >
                  <stat.icon className="absolute -top-2 -right-2 w-12 h-12 md:w-16 md:h-16 opacity-10" />
                  <p
                    className={`text-3xl md:text-4xl font-serif font-bold ${stat.text}`}
                  >
                    {stat.val}
                  </p>
                  <p
                    className={`text-[10px] font-bold uppercase tracking-widest mt-1 md:mt-2 ${stat.text} opacity-80`}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div
              variants={fadeInUp}
              className="bg-[#8d6e63] text-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl relative overflow-hidden"
            >
              <div className="relative z-10 text-center lg:text-left">
                <h3 className="text-lg md:text-xl font-serif font-bold mb-3 md:mb-4">
                  Ready for more?
                </h3>
                <p className="text-white/70 text-xs md:text-sm mb-6 md:mb-8 leading-relaxed">
                  Your next favorite amigurumi is waiting to be found.
                </p>
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center gap-3 bg-[#f4c2c2] hover:bg-white hover:text-[#f4c2c2] transition-all px-6 py-3 md:py-4 rounded-2xl font-bold group w-full lg:w-auto"
                >
                  Go to Shop{" "}
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </div>
              <Heart className="absolute -bottom-10 -left-10 w-32 h-32 md:w-40 md:h-40 text-white/5 rotate-12" />
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl border border-[#ffdab9]/30"
            >
              <h3 className="text-lg font-serif font-bold text-[#8d6e63] mb-4 md:mb-6">
                Need Help?
              </h3>
              <ul className="space-y-3 md:space-y-4">
                {helpItems.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.link}
                      className="flex items-center justify-between group p-2 -m-2 rounded-lg hover:bg-[#fffdf7] transition-colors"
                    >
                      <span className="text-xs md:text-sm font-sans text-[#8d6e63]/70 group-hover:text-[#f4c2c2] transition-colors">
                        {item.label}
                      </span>
                      <ArrowRight
                        size={14}
                        className="text-[#ffdab9] group-hover:translate-x-1 transition-transform"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ProfilePage;
