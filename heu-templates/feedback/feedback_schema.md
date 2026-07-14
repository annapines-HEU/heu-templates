# Input JSON schema for `scripts/build_feedback_docx.js`

Every field is optional — omitted fields are skipped, so the report grows or
shrinks with the content you provide. Feedback bullets are arrays so you can
bold a lead-in and keep the rest regular weight.

```json
{
  "course": "HAIR EXPERT UNIVERSITY · MBA",
  "title": "Обратная связь по домашнему заданию №1 «Команда»",
  "subtitle": "Трек «Бизнес»  ·  Студент: Екатерина Евдокимова",
  "student_name": "Екатерина",

  "total_score": 76,
  "max_score": 110,
  "score_note": "72 базовых + 4 бонусных",

  "greeting": "Я внимательно проверила вашу работу и сверила её с планом задания...",
  "context": "Ваш бизнес — онлайн-продажа косметики, а не салон, поэтому...",

  "criteria": [
    { "name": "Часть 1. Должностные инструкции", "max": "20", "score": "18" },
    { "name": "Часть 2. Анализ рынка и вакансий", "max": "10", "score": "8" }
  ],
  "total_row": { "max": "100 (+10)", "score": "76" },

  "good": [
    ["Должностные инструкции (Часть 1) — ваша самая сильная часть. ", "Инструкции конкретные: вы прописали реальные процессы..."]
  ],
  "improve": [
    ["Часть 5 — пирамида Маслоу (главный пробел). ", "Вместо мотивации по уровням потребностей нарисована оргструктура...", "9C2A2A"]
  ],

  "bonus": "Начислила за нестандартные решения: договорённость с банком...",
  "recommendation": ["Ставлю вам 76 из 110. ", "Это крепкая работа. Чтобы поднять балл, предлагаю..."]
}
```

Notes:
- Each `good` / `improve` item is `[boldLead, restText, optionalHexColorForLead]`.
  Use the red `"9C2A2A"` color on the single most important weakness to draw the eye.
- `recommendation` is `[boldLead, restText]`; the bold lead renders in accent blue.
- The greeting auto-prefixes `"<student_name>, здравствуйте! "` when `student_name` is set.
- Write all prose in the **first person** as the teacher ("я проверила", "советую вам").
