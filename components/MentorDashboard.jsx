"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function MentorDashboard() {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);

  const getNextTask = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000)); // временная заглушка
    setTask({
      title: "Разобраться с async/await и SynchronizationContext",
      instructions:
        "Объясни, что делает ключевое слово await, что происходит под капотом и когда возникает deadlock.",
      acceptance: [
        "Пример кода с async/await",
        "Объяснение SynchronizationContext",
      ],
    });
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">🎓 Mentor Dashboard</h1>
      <p className="text-gray-600">
        Здесь будут появляться твои задания и прогресс.
      </p>
      <button
        onClick={getNextTask}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        disabled={loading}
      >
        {loading ? "Загружается..." : "Получить задание"}
      </button>

      {task && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-md p-4 rounded-xl border border-gray-200"
        >
          <h2 className="text-xl font-semibold mb-2">{task.title}</h2>
          <p className="text-gray-700 mb-4">{task.instructions}</p>
          <ul className="list-disc ml-5 text-gray-800">
            {task.acceptance.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}
