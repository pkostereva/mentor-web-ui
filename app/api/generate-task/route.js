"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";

export default function MentorDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching tasks:", error);
    else setTasks(data);

    setLoading(false);
  };

  const generateTask = async () => {
    if (!topic) return alert("Введите тему для задания");
    setGenerating(true);

    try {
      const response = await fetch("/api/generate-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const result = await response.json();

      if (result.success) {
        setTopic("");
        await fetchTasks();
      } else {
        alert("Ошибка генерации: " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("Произошла ошибка при генерации");
    }

    setGenerating(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">🎓 Mentor Dashboard</h1>
      <p className="text-gray-600">Генерация заданий по твоим темам.</p>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Введите тему (например, Async/Await)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 flex-grow"
        />
        <button
          onClick={generateTask}
          disabled={generating}
          className={`bg-blue-600 text-white px-4 py-2 rounded-lg transition ${
            generating ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          {generating ? "Генерируется..." : "Получить задание"}
        </button>
      </div>

      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {tasks.length === 0 ? (
            <p className="text-gray-500">Пока нет заданий</p>
          ) : (
            tasks.map((t) => (
              <div
                key={t.id}
                className="bg-white shadow p-4 rounded-lg border border-gray-200"
              >
                <div className="font-semibold text-lg">{t.topic}</div>
                <div className="text-gray-700 whitespace-pre-line mt-2">
                  {t.description}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(t.created_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
}
