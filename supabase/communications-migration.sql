-- Communications: templates, broadcasts, delivery tracking

create table if not exists communication_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('email', 'sms')),
  subject text,
  body text not null,
  variables jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table communication_templates enable row level security;

create policy "Admins can manage templates"
  on communication_templates for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create table if not exists communications (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('email', 'sms')),
  template_id uuid references communication_templates(id),
  subject text,
  body text not null,
  recipient_type text not null default 'all' check (recipient_type in ('all', 'class', 'specific')),
  class_filter text,
  recipient_count integer default 0,
  sent_count integer default 0,
  failed_count integer default 0,
  status text default 'pending' check (status in ('pending', 'sending', 'completed', 'partial', 'failed')),
  created_at timestamptz default now(),
  sent_at timestamptz
);

alter table communications enable row level security;

create policy "Admins can manage communications"
  on communications for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create table if not exists communication_recipients (
  id uuid primary key default gen_random_uuid(),
  communication_id uuid references communications(id) on delete cascade not null,
  recipient_type text not null check (recipient_type in ('student', 'parent')),
  recipient_name text,
  recipient_email text,
  recipient_phone text,
  status text default 'pending' check (status in ('pending', 'sent', 'failed')),
  error_message text,
  sent_at timestamptz
);

alter table communication_recipients enable row level security;

create policy "Admins can manage recipients"
  on communication_recipients for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create index idx_communications_status on communications (status);
create index idx_communications_created on communications (created_at desc);
create index idx_comm_recipients_comm on communication_recipients (communication_id);
create index idx_comm_recipients_status on communication_recipients (status);
