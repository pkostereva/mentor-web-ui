"use client";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CheckCircle2, Clock } from "lucide-react";

const MentorDashboard = forwardRef((props, ref) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useImperativeHandle(ref, () => ({
    refreshTasks: fetchTasks,
  }));

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(2);

    if (!error) setTasks(data);
    setLoading(false);
  };

  const formatDate = (isoString) =>
    new Date(isoString).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
        📘 Текущие задания
      </h2>

      {loading ? (
        <p className="text-gray-500">Загрузка...</p>
      ) : tasks.length === 0 ? (
        <p className="text-gray-500">Нет заданий. Нажми “Хочу заниматься”.</p>
      ) : (
        tasks.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all duration-200"
          >
            {/* header */}
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t.topic}
                </h3>
                <p className="text-sm text-gray-500">
                  {formatDate(t.created_at)}
                </p>
              </div>

              <div
                className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                  t.status === "done"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {t.status === "done" ? (
                  <>
                    <CheckCircle2 size={14} /> Завершено
                  </>
                ) : (
                  <>
                    <Clock size={14} /> Новое
                  </>
                )}
              </div>
            </div>

            {/* markdown body */}
            <article className="prose prose-neutral max-w-none text-gray-800 leading-relaxed">
              <div className="prose prose-gray max-w-none leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ inline, children }) {
                      const text = Array.isArray(children)
                        ? children.join("")
                        : String(children || "");

                      return inline ? (
                        <code className="bg-gray-100 text-gray-900 rounded px-1 py-0.5 text-[0.9em] font-mono">
                          {text}
                        </code>
                      ) : (
                        <pre className="not-prose bg-white border border-gray-300 text-gray-900 rounded-lg p-4 text-sm font-mono leading-relaxed overflow-x-auto shadow-sm">
                          <code className="whitespace-pre-wrap">{text}</code>
                        </pre>
                      );
                    },
                  }}
                >
                  {t.description}
                </ReactMarkdown>
              </div>
            </article>

            {/* footer */}
            {t.status !== "done" && (
              <div className="flex justify-end mt-6">
                <button
                  onClick={async () => {
                    const res = await fetch("/api/complete-task", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        taskId: t.id,
                        topicId: t.topic_id,
                      }),
                    });
                    const result = await res.json();
                    if (result.success) {
                      await fetchTasks();
                    } else {
                      alert("Ошибка при обновлении статуса");
                    }
                  }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium shadow hover:shadow-md hover:scale-[1.02] transition-transform"
                >
                  Отметить как выполненное
                </button>
              </div>
            )}
          </motion.div>
        ))
      )}
    </div>
  );
});

export default MentorDashboard;
