"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";

export default function ProgressOverview() {
  const [progress, setProgress] = useState({ total: 0, done: 0, percent: 0 });

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    const { data: topics } = await supabase.from("topics").select("id");
    const { data: completed } = await supabase
      .from("progress")
      .select("id")
      .eq("status", "done");

    const total = topics?.length || 0;
    const done = completed?.length || 0;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;

    setProgress({ total, done, percent });
  };

  return (
    <motion.div
      className="p-6 bg-white rounded-2xl shadow-md border border-gray-100"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-semibold mb-2">📊 Прогресс обучения</h2>
      <div className="text-gray-600 mb-2">
        Завершено тем: {progress.done} из {progress.total}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
        <motion.div
          className="bg-green-500 h-3 rounded-full"
          style={{ width: `${progress.percent}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${progress.percent}%` }}
          transition={{ duration: 1 }}
        />
      </div>
      <div className="text-sm text-gray-500 mt-2">
        Прогресс: {progress.percent}%
      </div>
    </motion.div>
  );
}
