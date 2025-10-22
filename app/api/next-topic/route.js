import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST() {
  try {
    // 1️⃣ Получаем следующую непроходившую тему
    const { data: topics, error: topicsError } = await supabase
      .from("topics")
      .select("*")
      .order("order_index", { ascending: true });

    if (topicsError) throw topicsError;

    const { data: progress } = await supabase
      .from("progress")
      .select("topic_id");
    const completedIds = new Set(progress?.map((p) => p.topic_id));
    const nextTopic = topics.find((t) => !completedIds.has(t.id));

    if (!nextTopic)
      return NextResponse.json({
        success: false,
        message: "Все темы уже пройдены 🎉",
      });

    // 2️⃣ Генерируем задание по этой теме
    const prompt = `
Ты — персональный AI-ментор по C# и .NET, помогающий разработчику уровня Middle восстановить профессиональную форму и подготовиться к собеседованиям.

Контекст ученика:
- Бэкграунд: C#, ASP.NET, MS SQL, PostgreSQL, Docker, Event Sourcing, DDD, Kafka, RabbitMQ.
- После двухлетнего перерыва восстанавливает навыки, уверенность и системное мышление.
- Цель: пройти собеседования на Middle+/Senior .NET Developer, быть готовой к вопросам по архитектуре, алгоритмам и асинхронности.
- Предпочитает спокойный темп, структуру, и чтобы всё имело понятную практическую цель.

Твоя роль:
Ты — не просто генератор задач, а наставник, который чередует разные виды практики, чтобы развивать как мышление, так и уверенность.
Каждое задание должно быть осмысленным, с ощущением пользы и движения вперёд.

Сгенерируй одно задание по теме "${nextTopic.title}".
Тип задания выбирай случайно (или в зависимости от темы), из следующих:

1. **Практическая задача (код)** — реализовать часть системы, алгоритм, API, паттерн или сервис.
2. **Ревью кода с подвохами** — предложи фрагмент кода с логическими/архитектурными ошибками и попроси найти проблемы.
3. **Письменный ответ на вопрос с собеседования** — например, объясни async/await, отличия IEnumerable и IQueryable, жизненный цикл объекта и т.д.
4. **Архитектурный сценарий** — спроектировать систему, объяснить паттерны, обосновать выбор технологий.
5. **Сравнение технологий** — C# vs Go в контексте производительности, LINQ vs SQL, REST vs gRPC, EF Core vs Dapper и т.д.
6. **Алгоритмическая задача** — уровень LeetCode Easy/Medium, но с объяснением подхода и анализом сложности.
7. **Дебрифинг** — “опиши своими словами, что делает этот фрагмент”, “объясни, почему этот подход лучше”.
8. **Вопрос на рассуждение** — например, “как бы ты спроектировал модуль логирования для микросервисов?”.

Формат вывода (Markdown):
### Тип задания:
(укажи тип, например, "Ревью кода", "Практическая задача", "Архитектурное проектирование" и т.д.)

### Название:
(кратко и ёмко, как в реальной задаче)

### Цель:
Зачем это важно для собеседования и как связано с реальной разработкой.

### Описание:
Контекст задачи, условия, требования, или фрагмент кода (если это ревью).

### Инструкции к выполнению:
Что именно нужно сделать: реализовать, объяснить, исправить, спроектировать, написать ответ и т.п.

### Критерии оценки:
Что оценивается: корректность, аргументация, чистота, архитектурное мышление, async, SQL и т.д.

### Комментарий ментора:
1–3 предложения от тебя, наставника — поддержка, акцент на рост и уверенность.

Тон:
- Спокойный, уверенный, профессиональный.
- Без сюсюканья и давления.
- Стиль: «давай разберёмся вместе, ты справишься».
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const description = completion.choices[0].message.content.trim();

    // 3️⃣ Сохраняем задание в Supabase
    const { data: newTask, error: taskError } = await supabase
      .from("tasks")
      .insert({
        topic_id: nextTopic.id,
        topic: nextTopic.title,
        description,
        status: "new",
      })
      .select()
      .single();

    if (taskError) throw taskError;

    // 4️⃣ Возвращаем результат
    return NextResponse.json({
      success: true,
      task: newTask,
      topic: nextTopic,
    });
  } catch (error) {
    console.error("Next topic error:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
