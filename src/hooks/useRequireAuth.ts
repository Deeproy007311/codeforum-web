import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

export function useRequireAuth() {
    const navigate = useNavigate();
    const token = useAuthStore((state) => state.token);

    const requireAuth = (action: () => void) => {
        if (!token) {
            toast.error("Please log in to continue");
            navigate("/login");
            return;
        }
        action();
    };

    return { requireAuth, isLoggedIn: !!token };
}