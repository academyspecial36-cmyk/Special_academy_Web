-- Password reset verification codes (6-digit, 15-min expiry)
create table if not exists password_resets (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code text not null,
  reset_token uuid default gen_random_uuid(),
  expires_at timestamptz not null,
  used boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_password_resets_email on password_resets(email);
create index if not exists idx_password_resets_code on password_resets(code);
create index if not exists idx_password_resets_reset_token on password_resets(reset_token);
