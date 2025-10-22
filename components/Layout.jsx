"use client";

import { useState } from "react";
import { BookOpen, BarChart3, Clock } from "lucide-react";

export default function Layout({ children, onGenerate }) {
  const [activeTab, setActiveTab] = useState("tasks");

  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-900 font-[Inter]">
      {/* ===== Боковая панель ===== */}
      <aside className="w-52 border-r border-neutral-200 bg-white px-3 py-4 flex flex-col justify-between shadow-sm">
        <div>
          <h1 className="text-lg font-semibold mb-5 flex items-center gap-2">
            🧠 Mentor
          </h1>

          <nav className="flex flex-col gap-1 text-sm">
            <button
              onClick={() => setActiveTab("tasks")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition ${
                activeTab === "tasks"
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "hover:bg-neutral-100"
              }`}
            >
              <BookOpen size={16} /> Задания
            </button>
            <button
              onClick={() => setActiveTab("progress")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition ${
                activeTab === "progress"
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "hover:bg-neutral-100"
              }`}
            >
              <BarChart3 size={16} /> Прогресс
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition ${
                activeTab === "history"
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "hover:bg-neutral-100"
              }`}
            >
              <Clock size={16} /> История
            </button>
          </nav>
        </div>

        <button
          onClick={onGenerate}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-3 rounded-md text-sm transition shadow-sm"
        >
          🪄 Хочу заниматься
        </button>
      </aside>

      {/* ===== Контентная область ===== */}
      <div className="flex-1 flex flex-col">
        {/* ===== ШАПКА ===== */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-8 py-3 shadow-sm flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">
            👋 Твой ментор
          </h1>
        </header>

        {/* ===== Контент ===== */}
        <main className="flex-1 px-8 py-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto">{children(activeTab)}</div>
        </main>
      </div>
    </div>
  );
}
