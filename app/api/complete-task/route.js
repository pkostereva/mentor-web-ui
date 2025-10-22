import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";

export async function POST(request) {
  try {
    const { taskId, topicId } = await request.json();
    let resolvedTopicId = topicId;

    if (!taskId) {
      return NextResponse.json({ success: false, message: "Missing taskId" });
    }

    // если topicId не передали – вытянем его из БД
    if (!resolvedTopicId) {
      const { data: task, error: taskReadErr } = await supabase
        .from("tasks")
        .select("topic, topic_id")
        .eq("id", taskId)
        .single();

      if (taskReadErr) throw taskReadErr;

      if (task.topic_id) {
        resolvedTopicId = task.topic_id;
      } else {
        const { data: topicRow, error: topicErr } = await supabase
          .from("topics")
          .select("id")
          .eq("title", task.topic)
          .single();
        if (topicErr) throw topicErr;

        resolvedTopicId = topicRow.id;

        // заодно проставим topic_id у задачи, чтобы дальше было ок
        await supabase
          .from("tasks")
          .update({ topic_id: resolvedTopicId })
          .eq("id", taskId);
      }
    }

    // 1) апдейтим статус задачи
    const { error: updErr } = await supabase
      .from("tasks")
      .update({ status: "done" })
      .eq("id", taskId);
    if (updErr) throw updErr;

    // 2) пишем прогресс
    const { error: insErr } = await supabase.from("progress").insert({
      topic_id: resolvedTopicId,
      status: "done",
      updated_at: new Date().toISOString(),
    });
    if (insErr) throw insErr;

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("complete-task error:", e);
    return NextResponse.json({ success: false, error: e.message });
  }
}
