import { Routes, Route } from "react-router-dom";
import LoginPage from "@/features/auth/LoginPage";
import QuestionsListPage from "@/features/questions/QuestionsListPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<QuestionsListPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}

export default App;