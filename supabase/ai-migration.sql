-- Enable pgvector extension
create extension if not exists vector with schema extensions;

-- AI Conversations
create table if not exists ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'New conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table ai_conversations enable row level security;

create policy "Users can manage own conversations"
  on ai_conversations for all
  using (auth.uid() = user_id);

-- AI Messages
create table if not exists ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references ai_conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system', 'tool')),
  content text,
  tool_calls jsonb,
  tool_name text,
  tool_args jsonb,
  tool_result jsonb,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table ai_messages enable row level security;

create policy "Users can manage own messages"
  on ai_messages for all
  using (
    exists (
      select 1 from ai_conversations
      where ai_conversations.id = ai_messages.conversation_id
      and ai_conversations.user_id = auth.uid()
    )
  );

-- AI Action Logs (audit trail)
create table if not exists ai_action_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  tool_name text not null,
  payload jsonb,
  status text not null default 'pending' check (status in ('pending', 'success', 'error', 'cancelled')),
  error text,
  duration_ms integer,
  created_at timestamptz not null default now()
);

alter table ai_action_logs enable row level security;

create policy "Admins can view all action logs"
  on ai_action_logs for select
  using (true);

create policy "Users can insert action logs"
  on ai_action_logs for insert
  with check (auth.uid() = user_id);

-- AI Documents (RAG source)
create table if not exists ai_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  source_type text not null check (source_type in ('guide', 'faq', 'course', 'notice', 'blog', 'settings', 'legal', 'upload')),
  source_id text,
  embedding vector(768),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table ai_documents enable row level security;

create policy "Admins can manage documents"
  on ai_documents for all
  using (true);

-- Index for vector similarity search
create index if not exists idx_ai_documents_embedding
  on ai_documents using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Index for source type lookup
create index if not exists idx_ai_documents_source_type
  on ai_documents (source_type);

-- Index for conversation lookup
create index if not exists idx_ai_messages_conversation
  on ai_messages (conversation_id, created_at);

-- Function to update updated_at
create or replace function update_ai_conversation_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_ai_conversation_updated
  before update on ai_conversations
  for each row execute function update_ai_conversation_timestamp();

-- Vector similarity search function
create or replace function match_documents(
  query_embedding vector(768),
  match_threshold float default 0.7,
  match_count int default 8
)
returns table (
  id uuid,
  title text,
  content text,
  source_type text,
  source_id text,
  similarity float,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
as $$
begin
  return query
  select
    ai_documents.id,
    ai_documents.title,
    ai_documents.content,
    ai_documents.source_type,
    ai_documents.source_id,
    1 - (ai_documents.embedding <=> query_embedding) as similarity,
    ai_documents.created_at,
    ai_documents.updated_at
  from ai_documents
  where 1 - (ai_documents.embedding <=> query_embedding) > match_threshold
  order by ai_documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
