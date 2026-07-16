import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/authStore";
import { getAllQuestions } from "@/api/questions";
import { getAIUsage, getAIHistory } from "@/api/ai";
import AIHistoryTab from "./AIHistoryTab";
import AccountSettingsTab from "./AccountSettingsTab";
import SubscriptionTab from "./SubscriptionTab";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    Settings,
    CreditCard,
    Globe,
    MapPin,
    Calendar,
    Pencil,
    Save,
    X,
    Activity,
    HelpCircle,
    Zap,
    Briefcase,
    Plus,
} from "lucide-react";

// Custom brand SVGs as Lucide icons are deprecated for brand items
const Github = ({ className = "h-4 w-4" }: { className?: string }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
);

const Twitter = ({ className = "h-4 w-4" }: { className?: string }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
);

const Linkedin = ({ className = "h-4 w-4" }: { className?: string }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);

const BANNER_PRESETS = [
    { id: "aurora", name: "Aurora Shimmer", classes: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" },
    { id: "sunset", name: "Sunset Fusion", classes: "bg-gradient-to-r from-orange-400 via-rose-500 to-red-600" },
    { id: "cyber", name: "Cyber Neon", classes: "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-800" },
    { id: "emerald", name: "Emerald Sea", classes: "bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-600" },
    { id: "ocean", name: "Ocean Breeze", classes: "bg-gradient-to-r from-sky-400 via-cyan-500 to-blue-600" },
    { id: "monochrome", name: "Obsidian", classes: "bg-gradient-to-r from-slate-800 via-slate-900 to-zinc-900" },
];

function ProfilePage() {
    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Form states
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [avatar, setAvatar] = useState("");
    const [skillsText, setSkillsText] = useState("");
    const [bannerPreset, setBannerPreset] = useState("aurora");
    const [location, setLocation] = useState("");
    const [github, setGithub] = useState("");
    const [twitter, setTwitter] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [website, setWebsite] = useState("");

    // Queries for Stats & AI usage
    const { data: questionsData } = useQuery({
        queryKey: ["questions"],
        queryFn: () => getAllQuestions(),
    });

    const { data: aiUsage } = useQuery({
        queryKey: ["ai-usage"],
        queryFn: getAIUsage,
        refetchOnWindowFocus: false,
    });

    const { data: aiHistoryData } = useQuery({
        queryKey: ["ai-history", 1],
        queryFn: () => getAIHistory(1, 100),
        refetchOnWindowFocus: false,
    });

    // Compute stats
    const totalQuestions = questionsData?.questions
        ? questionsData.questions.filter((q) => q.author?._id === user?._id).length
        : 0;

    const aiRequestsTotal = aiHistoryData?.pagination?.total ?? 0;
    const cachedRequestsTotal = aiHistoryData?.history
        ? aiHistoryData.history.filter((h) => h.fromCache).length
        : 0;

    // Load initial values for form on user load
    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setBio(user.bio || "");
            setAvatar(user.avatar || "");
            setSkillsText(user.skills ? user.skills.join(", ") : "");
            
            // Extract custom metadata from storage overrides if any
            const savedOverrides = localStorage.getItem(`profile_overrides_${user._id}`);
            if (savedOverrides) {
                const overrides = JSON.parse(savedOverrides);
                setBannerPreset(overrides.banner || "aurora");
                setLocation(overrides.location || "Remote");
                setGithub(overrides.socials?.github || "");
                setTwitter(overrides.socials?.twitter || "");
                setLinkedin(overrides.socials?.linkedin || "");
                setWebsite(overrides.socials?.website || "");
            } else {
                setBannerPreset("aurora");
                setLocation("Remote");
                setGithub("");
                setTwitter("");
                setLinkedin("");
                setWebsite("");
            }
        }
    }, [user, isEditModalOpen]);

    if (!user) return null;

    const bannerObj = BANNER_PRESETS.find((b) => b.id === bannerPreset) || BANNER_PRESETS[0];

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        
        const skillsArray = skillsText
            ? skillsText.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
            : [];

        const overrides = {
            name,
            bio,
            avatar,
            skills: skillsArray,
            banner: bannerPreset,
            location,
            socials: {
                github,
                twitter,
                linkedin,
                website,
            },
        };

        // Save to localStorage
        localStorage.setItem(`profile_overrides_${user._id}`, JSON.stringify(overrides));

        // Update the Zustand auth store user object
        setUser({
            ...user,
            ...overrides,
        });

        toast.success("Profile updated successfully!");
        setIsEditModalOpen(false);
    };

    return (
        <div className="mx-auto max-w-6xl w-full px-4 py-8 md:py-12 flex-1 flex flex-col">
            {/* Header intro */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Developer Dashboard
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        View statistics, check your current subscription, and manage profile settings.
                    </p>
                </div>
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-12 gap-8 items-start">
                
                {/* Left Sidebar - Profile Card */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-md shadow-slate-100/50 dark:border-slate-800/80 dark:bg-slate-900/40 dark:shadow-none overflow-hidden relative flex flex-col">
                        {/* Cover Banner */}
                        <div className={`h-32 w-full relative ${bannerObj.classes} transition-all duration-300`}>
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="absolute right-3 top-3 flex items-center justify-center p-1.5 rounded-lg bg-black/30 text-white backdrop-blur-md hover:bg-black/40 transition-colors"
                                title="Edit cover"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        {/* Avatar container */}
                        <div className="absolute top-16 left-6 z-10">
                            <div className="relative group">
                                <div className={`absolute -inset-0.5 rounded-full blur-sm opacity-60 group-hover:opacity-100 transition-opacity duration-300 ${
                                    user.plan === "pro" 
                                        ? "bg-gradient-to-r from-amber-500 to-orange-500" 
                                        : "bg-gradient-to-r from-indigo-500 to-violet-500"
                                }`} />
                                <Avatar className="h-20 w-20 ring-4 ring-white dark:ring-[#060812] shrink-0 relative bg-slate-100 dark:bg-slate-800">
                                    {user.avatar ? (
                                        <AvatarImage src={user.avatar} alt={user.username} />
                                    ) : null}
                                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-2xl font-bold text-white">
                                        {user.username?.[0]?.toUpperCase() ?? "?"}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        </div>

                        {/* Card Content */}
                        <div className="pt-8 px-6 pb-6 flex-1 flex flex-col">
                            {/* Edit Button */}
                            <div className="flex justify-end -mt-3 mb-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="h-8 rounded-lg text-xs gap-1 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 animate-fade-in"
                                >
                                    <Pencil className="h-3 w-3" />
                                    Edit Profile
                                </Button>
                            </div>

                            {/* Main identity */}
                            <div className="mb-4">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                        {user.name}
                                    </h2>
                                    <Badge 
                                        variant="secondary"
                                        className={
                                            user.plan === "pro"
                                                ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 uppercase font-semibold text-[10px]"
                                                : "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:bg-indigo-500/20 dark:text-indigo-400 uppercase font-semibold text-[10px]"
                                        }
                                    >
                                        {user.plan === "pro" ? "Pro" : "Member"}
                                    </Badge>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    @{user.username}
                                </p>
                            </div>

                            {/* Bio */}
                            <div className="mb-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic border-l-2 border-indigo-500/30 pl-3">
                                {user.bio || "No developer bio written yet. Click edit profile to add your developer story!"}
                            </div>

                            {/* Location & Joined info */}
                            <div className="space-y-2.5 mb-5 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <span>{location || "Remote"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <span>Joined CodeForum community</span>
                                </div>
                            </div>

                            {/* Tech Stack / Skills */}
                            <div className="mb-6 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 flex items-center gap-1.5">
                                    <Briefcase className="h-3 w-3" /> Tech Stack & Skills
                                </h3>
                                {user.skills && user.skills.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                        {user.skills.map((skill, index) => (
                                            <Badge 
                                                key={index}
                                                variant="outline" 
                                                className="bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-400 transition-colors"
                                            >
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="text-xs text-indigo-500 hover:underline flex items-center gap-1 font-medium"
                                    >
                                        <Plus className="h-3 w-3" /> Add your skills / framework stack
                                    </button>
                                )}
                            </div>

                            {/* Social Profiles */}
                            <div className="mt-auto border-t border-slate-100 dark:border-slate-800/80 pt-4 flex gap-3">
                                {github && (
                                    <a
                                        href={`https://github.com/${github}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-all hover:scale-105"
                                        title="GitHub Profile"
                                    >
                                        <Github className="h-4 w-4" />
                                    </a>
                                )}
                                {twitter && (
                                    <a
                                        href={`https://twitter.com/${twitter}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-sky-400 dark:hover:text-sky-400 transition-all hover:scale-105"
                                        title="Twitter / X Profile"
                                    >
                                        <Twitter className="h-4 w-4" />
                                    </a>
                                )}
                                {linkedin && (
                                    <a
                                        href={`https://linkedin.com/in/${linkedin}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-500 transition-all hover:scale-105"
                                        title="LinkedIn Profile"
                                    >
                                        <Linkedin className="h-4 w-4" />
                                    </a>
                                )}
                                {website && (
                                    <a
                                        href={website.startsWith("http") ? website : `https://${website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all hover:scale-105"
                                        title="Personal Website"
                                    >
                                        <Globe className="h-4 w-4" />
                                    </a>
                                )}
                                {!github && !twitter && !linkedin && !website && (
                                    <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                                        No social links added yet
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Usage Quick Progress */}
                        {aiUsage && (
                            <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-800/80">
                                <div className="flex items-center justify-between text-xs mb-1.5">
                                    <span className="font-semibold text-slate-600 dark:text-slate-300">AI Limit Usage</span>
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                                        {aiUsage.used} / {aiUsage.limit} requests
                                    </span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 transition-all duration-500"
                                        style={{ width: `${Math.min(100, (aiUsage.used / aiUsage.limit) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel - Statistics & Tabs Content */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    
                    {/* Top statistics cards row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/40 flex items-center gap-4">
                            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 shrink-0">
                                <HelpCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    Questions Asked
                                </p>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">
                                    {totalQuestions}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/40 flex items-center gap-4">
                            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 shrink-0">
                                <Activity className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    AI API Queries
                                </p>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">
                                    {aiRequestsTotal}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/40 flex items-center gap-4">
                            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 shrink-0">
                                <Zap className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    Cached AI Responses
                                </p>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">
                                    {cachedRequestsTotal}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs container */}
                    <div className="rounded-2xl border border-slate-100 bg-white/50 p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/10 backdrop-blur-md">
                        <Tabs defaultValue="ai-history" className="w-full">
                            <TabsList className="mb-6 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-xl flex w-fit border border-slate-200/50 dark:border-slate-800/40">
                                <TabsTrigger value="ai-history" className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg transition-all">
                                    <Sparkles className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                                    AI History
                                </TabsTrigger>
                                <TabsTrigger value="subscription" className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg transition-all">
                                    <CreditCard className="h-3.5 w-3.5 text-purple-500 dark:text-purple-400" />
                                    Subscription Plan
                                </TabsTrigger>
                                <TabsTrigger value="settings" className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg transition-all">
                                    <Settings className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                                    Security & settings
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="ai-history" className="mt-2 outline-none">
                                <AIHistoryTab />
                            </TabsContent>

                            <TabsContent value="subscription" className="mt-2 outline-none">
                                <SubscriptionTab />
                            </TabsContent>

                            <TabsContent value="settings" className="mt-2 outline-none">
                                <AccountSettingsTab />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>

            {/* Custom Modal for Editing Profile */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditModalOpen(false)}
                            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
                        />
                        
                        {/* Dialog Body */}
                        <motion.div
                            initial={{ scale: 0.95, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 20, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.35 }}
                            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950 z-10 flex flex-col max-h-[85vh]"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        Customize Profile
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Set your developer identity, skills, and links.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-950 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-colors"
                                >
                                    <X className="h-4 w-4 text-slate-500" />
                                </button>
                            </div>

                            {/* Modal Form Scrollable */}
                            <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                                {/* Banner Preset Selector */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                        Cover Banner Background
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                        {BANNER_PRESETS.map((preset) => (
                                            <button
                                                key={preset.id}
                                                type="button"
                                                onClick={() => setBannerPreset(preset.id)}
                                                className={`h-12 w-full rounded-xl relative overflow-hidden transition-all duration-300 border-2 ${
                                                    bannerPreset === preset.id
                                                        ? "border-indigo-600 scale-[1.02]"
                                                        : "border-transparent hover:scale-[1.01]"
                                                } ${preset.classes}`}
                                            >
                                                <span className="absolute inset-0 bg-black/10 flex items-center justify-center text-[10px] font-semibold text-white">
                                                    {preset.name}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Main Details */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                            Full Name
                                        </label>
                                        <Input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="John Doe"
                                            required
                                            className="h-10 text-sm"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                            Avatar Image URL
                                        </label>
                                        <Input
                                            type="url"
                                            value={avatar}
                                            onChange={(e) => setAvatar(e.target.value)}
                                            placeholder="https://example.com/avatar.jpg"
                                            className="h-10 text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                            Location
                                        </label>
                                        <Input
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            placeholder="San Francisco, CA or Remote"
                                            className="h-10 text-sm"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                            Tech Stack / Skills (comma separated)
                                        </label>
                                        <Input
                                            type="text"
                                            value={skillsText}
                                            onChange={(e) => setSkillsText(e.target.value)}
                                            placeholder="React, TypeScript, Node.js, Next.js"
                                            className="h-10 text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Bio */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                        Professional Bio
                                    </label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Senior Frontend UI/UX Designer passionate about building accessible design systems..."
                                        rows={3}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-900 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-100 focus:outline-none transition-all"
                                    />
                                </div>

                                {/* Social Links */}
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                        Social Accounts (Usernames / URLs)
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                        <div className="relative">
                                            <Github className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                            <Input
                                                type="text"
                                                value={github}
                                                onChange={(e) => setGithub(e.target.value)}
                                                placeholder="GitHub username"
                                                className="pl-9 h-10 text-sm"
                                            />
                                        </div>

                                        <div className="relative">
                                            <Twitter className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                            <Input
                                                type="text"
                                                value={twitter}
                                                onChange={(e) => setTwitter(e.target.value)}
                                                placeholder="Twitter username"
                                                className="pl-9 h-10 text-sm"
                                            />
                                        </div>

                                        <div className="relative">
                                            <Linkedin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                            <Input
                                                type="text"
                                                value={linkedin}
                                                onChange={(e) => setLinkedin(e.target.value)}
                                                placeholder="LinkedIn username"
                                                className="pl-9 h-10 text-sm"
                                            />
                                        </div>

                                        <div className="relative">
                                            <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                            <Input
                                                type="url"
                                                value={website}
                                                onChange={(e) => setWebsite(e.target.value)}
                                                placeholder="Personal website URL"
                                                className="pl-9 h-10 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="h-10 rounded-lg text-sm"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="h-10 rounded-lg text-sm gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium hover:from-indigo-500 hover:to-violet-500"
                                    >
                                        <Save className="h-4 w-4" />
                                        Save Profile
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ProfilePage;