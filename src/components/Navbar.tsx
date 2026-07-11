import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Code2, LogOut, Search } from "lucide-react";

function Navbar() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const [search, setSearch] = useState("");

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        navigate(`/questions${search ? `?search=${encodeURIComponent(search)}` : ""}`);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#060812]/80">
            <div className="mx-auto flex max-w-6xl h-16 items-center justify-between gap-4 px-4">
                <Link to="/" className="flex items-center gap-2 shrink-0 group">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md shadow-indigo-500/20 transition-transform group-hover:scale-105">
                        <Code2 className="h-4.5 w-4.5 text-white" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                        CodeForum
                    </span>
                </Link>

                <form onSubmit={handleSearch} className="hidden max-w-md flex-1 sm:block">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                        <Input
                            placeholder="Search questions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 h-9 rounded-lg border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500/50 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-100 dark:placeholder:text-slate-600"
                        />
                    </div>
                </form>

                <div className="flex shrink-0 items-center gap-3">
                    <Link to="/questions">
                        <Button variant="ghost" size="sm" className="h-9 rounded-lg text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-medium">
                            Questions
                        </Button>
                    </Link>
                    <Link to="/ai/explain-code">
                        <Button variant="ghost" size="sm">
                            AI Tools
                        </Button>
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-3">
                            <Link to="/profile" className="hidden text-sm text-gray-600 hover:underline sm:inline">
                                <span className="font-semibold">{user.username}</span>
                                <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                                    {user.plan}
                                </span>
                            </Link>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                className="h-9 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-red-600 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900/60 dark:hover:text-red-400 transition-colors"
                            >
                                <LogOut className="mr-1.5 h-3.5 w-3.5" />
                                Log Out
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/login">
                                <Button variant="ghost" size="sm" className="h-9 rounded-lg text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900/60">
                                    Log In
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button size="sm" className="h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition-all hover:scale-[1.02]">
                                    Register
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Navbar;