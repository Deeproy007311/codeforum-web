import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import LoginPage from "@/features/auth/LoginPage";
import RegisterPage from "@/features/auth/RegisterPage";
import LandingPage from "@/features/questions/LandingPage";
import QuestionsListPage from "@/features/questions/QuestionsListPage";
import { useAuthStore } from "@/store/authStore";
import { getCurrentUser } from "@/api/auth";
import QuestionDetailPage from "./features/questions/QuestionDetailPage";

function App() {
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setCheckingAuth(false);
        return;
      }
      try {
        const user = await getCurrentUser();
        setUser(user);
      } catch {
        logout();
      } finally {
        setCheckingAuth(false);
      }
    };
    verifyToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/questions" element={<QuestionsListPage />} />
        <Route path="/questions/:id" element={<QuestionDetailPage />} />
      </Route>
    </Routes>
  );
}

export default App;