"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";

export default function MentorDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTopic, setNewTopic] = useState("");

  // загружаем данные при монтировании
  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    const { data, error } = await supabase
      .from("progress")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) console.error("Error fetching data:", error);
    else setTasks(data);

    setLoading(false);
  };

  const addTopic = async () => {
    if (!newTopic) return;

    const { error } = await supabase.from("progress").insert([
      {
        topic: newTopic,
        status: "in_progress",
        notes: "",
      },
    ]);

    if (error) console.error("Error inserting data:", error);
    else {
      setNewTopic("");
      fetchProgress(); // обновляем список
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">🎓 Mentor Dashboard</h1>
      <p className="text-gray-600">Твой прогресс сохраняется в Supabase.</p>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter new topic..."
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 flex-grow"
        />
        <button
          onClick={addTopic}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Add
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {tasks.length === 0 ? (
            <p className="text-gray-500">No progress yet.</p>
          ) : (
            tasks.map((t) => (
              <div
                key={t.id}
                className="bg-white shadow p-3 rounded-lg border border-gray-200"
              >
                <div className="font-semibold">{t.topic}</div>
                <div className="text-sm text-gray-600">{t.status}</div>
                <div className="text-xs text-gray-500">
                  {new Date(t.updated_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
}
