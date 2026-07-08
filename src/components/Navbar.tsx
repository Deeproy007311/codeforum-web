import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
        <nav className="border-b bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
                <Link to="/" className="shrink-0 text-lg font-bold">
                    CodeForum
                </Link>

                <form onSubmit={handleSearch} className="hidden max-w-md flex-1 sm:block">
                    <Input
                        placeholder="Search questions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </form>

                <div className="flex shrink-0 items-center gap-3">
                    <Link to="/questions">
                        <Button variant="ghost" size="sm">
                            Questions
                        </Button>
                    </Link>

                    {user ? (
                        <>
                            <span className="hidden text-sm text-gray-600 sm:inline">
                                {user.username}{" "}
                                <span className="ml-1 rounded bg-gray-100 px-2 py-0.5 text-xs font-medium uppercase">
                                    {user.plan}
                                </span>
                            </span>
                            <Button variant="outline" size="sm" onClick={handleLogout}>
                                Log Out
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <Button variant="outline" size="sm">
                                    Log In
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button size="sm">Register</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;