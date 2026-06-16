-- Add answers column to exam_attempts as JSONB for storing per-question answers inline
alter table public.exam_attempts
  add column if not exists answers jsonb default '[]'::jsonb;

-- Backfill answers from exam_answers table for existing records
update public.exam_attempts ea
  set answers = (
    select coalesce(jsonb_agg(
      jsonb_build_object(
        'questionId', eaq.question_id,
        'answer', eaq.answer,
        'correct', eaq.correct
      ) order by eaq.id
    ), '[]'::jsonb)
    from public.exam_answers eaq
    where eaq.attempt_id = ea.id
  );
