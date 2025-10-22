"use client";

import Layout from "../components/Layout";
import MentorDashboard from "../components/MentorDashboard";
import { useRef } from "react";

export default function Page() {
  const dashboardRef = useRef();

  const handleGenerate = async () => {
    const res = await fetch("/api/next-topic", { method: "POST" });
    const data = await res.json();
    if (data.success) {
      dashboardRef.current?.refreshTasks?.();
      alert(`✅ Новая тема: ${data.topic.title}`);
    } else {
      alert(data.message || "Ошибка при генерации задания");
    }
  };

  return (
    <Layout onGenerate={handleGenerate}>
      {(activeTab) => {
        switch (activeTab) {
          case "progress":
            return <div>📈 Раздел прогресса (в разработке)</div>;
          case "history":
            return <div>🕓 История занятий (скоро)</div>;
          default:
            return <MentorDashboard ref={dashboardRef} />;
        }
      }}
    </Layout>
  );
}
