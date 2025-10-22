import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// 🔒 простейшая защита — требуем секрет
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request) {
  const auth = request.headers.get("authorization");
  if (!auth || auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // читаем prefs
  const { data: prefs, error } = await supabase
    .from("user_prefs")
    .select("*")
    .single();

  if (error || !prefs) {
    console.error("user_prefs error", error);
    return NextResponse.json({ error: "No prefs" }, { status: 500 });
  }

  // проверяем, включено ли расписание и день недели
  const dayIndex = now.getDay(); // 0=вс
  const isWeekday = prefs.weekdays?.[dayIndex] ?? false;
  if (!isWeekday || !prefs.reminders_enabled) {
    return NextResponse.json({ skipped: "disabled or weekend" });
  }

  // время срабатывания
  const [hours, minutes] = prefs.daily_time.split(":").map(Number);
  const scheduled = new Date(now);
  scheduled.setHours(hours, minutes, 0, 0);
  if (now < scheduled) {
    return NextResponse.json({ skipped: "too early" });
  }

  // генерируем следующее задание (простейший пример)
  const { error: insertError } = await supabase.from("tasks").insert({
    topic: "Автоматическое задание",
    description: "Сгенерировано агентом по расписанию.",
    status: "new",
  });

  if (insertError) {
    console.error(insertError);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
