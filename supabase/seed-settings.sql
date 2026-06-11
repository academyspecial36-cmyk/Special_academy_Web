-- Seed default settings with full config data
-- Run after settings-migration.sql (ensures config + maintenance_mode columns exist)

-- Ensure the columns exist first (idempotent)
alter table settings add column if not exists config jsonb default '{}'::jsonb;
alter table settings add column if not exists maintenance_mode boolean default false;
alter table settings add column if not exists enable_blog boolean default true;

-- Upsert the first settings row with complete default data
insert into settings (id, academy_name, tagline, description, address, email, admission_email, phone, secondary_phone, website, office_hours, holiday, app_icon, social_links, enable_blog, maintenance_mode, config)
values (
  gen_random_uuid(),
  'Special Academy',
  'Preparing Future Leaders Through Discipline & Excellence',
  'Nepal''s premier cadet preparation academy.',
  'Kathmandu, Nepal',
  'info@cadetacademy.edu',
  'admission@cadetacademy.edu',
  '986-0302036',
  '986-0302036',
  'https://cadetacademy.edu',
  'Sun-Thu: 9:00 AM - 5:00 PM',
  'Friday & Public Holidays',
  '/icon-image.png',
  '{"facebook":"","instagram":"","tiktok":"","youtube":""}'::jsonb,
  true,
  false,
  '{
    "hero": {
      "title": "Preparing Future Cadets Through Discipline & Excellence",
      "subtitle": "We help students develop academic excellence, leadership skills, confidence, and discipline for cadet entrance success. Join Nepal''s most trusted cadet preparation academy.",
      "badge": "Admission Open for 2026-27 Session",
      "image": "https://images.unsplash.com/photo-1763656443687-c3de11b68813?q=80&w=687&auto=format&fit=crop"
    },
    "about": {
      "title": "Building Future Leaders Since 2010",
      "description": "Special academy has been the trusted choice for parents and students aspiring for cadet college admissions. Our holistic approach combines academic rigor with character building.",
      "image": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
      "values": [
        { "title": "Mission", "description": "To prepare disciplined, academically excellent, and morally upright future leaders through comprehensive cadet preparation programs." },
        { "title": "Discipline", "description": "We instill military-grade discipline, punctuality, and self-control that forms the foundation of successful cadet life." },
        { "title": "Excellence", "description": "Pursuit of academic and personal excellence is at the core of everything we teach, ensuring our students stand out." },
        { "title": "Character", "description": "Building strong character, integrity, and leadership qualities that last a lifetime beyond cadet college admission." }
      ]
    },
    "stats": [
      { "label": "Students Enrolled", "value": "2500", "suffix": "+", "description": "Since 2010" },
      { "label": "Success Rate", "value": "94", "suffix": "%", "description": "College admission" },
      { "label": "Expert Faculty", "value": "35", "suffix": "+", "description": "Qualified instructors" },
      { "label": "Years Experience", "value": "15", "suffix": "+", "description": "In education" }
    ],
    "seo": {
      "metaDescription": "Special Academy - Nepal''s premier cadet preparation academy. We prepare students for cadet college entrance through discipline, academic excellence, and leadership training.",
      "gaTrackingId": ""
    },
    "sections": {
      "hero": true,
      "about": true,
      "whyChoose": true,
      "cadetOverview": true,
      "stats": true,
      "courses": true,
      "freeResources": true,
      "notices": true,
      "testimonials": true,
      "faculty": true,
      "facilities": true,
      "activities": true,
      "gallery": true,
      "enrollmentCta": true,
      "faq": true,
      "contact": true,
      "blog": true
    },
    "cta": {
      "title": "Start Your Cadet Journey Today",
      "subtitle": "Join Nepal''s most trusted cadet preparation academy and take the first step toward a disciplined, successful future.",
      "buttonText": "Enroll Now",
      "buttonLink": "/enroll"
    },
    "footer": {
      "copyright": "© 2026 Special Academy. All rights reserved.",
      "description": "Special Academy is Nepal''s premier cadet preparation institution, dedicated to shaping disciplined, academically excellent, and morally upright future leaders."
    }
  }'::jsonb
)
on conflict (id) do update set
  academy_name = excluded.academy_name,
  tagline = excluded.tagline,
  description = excluded.description,
  address = excluded.address,
  email = excluded.email,
  admission_email = excluded.admission_email,
  phone = excluded.phone,
  secondary_phone = excluded.secondary_phone,
  website = excluded.website,
  office_hours = excluded.office_hours,
  holiday = excluded.holiday,
  app_icon = excluded.app_icon,
  social_links = excluded.social_links,
  enable_blog = excluded.enable_blog,
  maintenance_mode = excluded.maintenance_mode,
  config = excluded.config;

-- If a row already exists without an id conflict, update its config
do $$
declare
  existing_id uuid;
begin
  select id into existing_id from settings limit 1;
  if existing_id is not null then
    update settings set
      config = '{
        "hero": {
          "title": "Preparing Future Cadets Through Discipline & Excellence",
          "subtitle": "We help students develop academic excellence, leadership skills, confidence, and discipline for cadet entrance success. Join Nepal''s most trusted cadet preparation academy.",
          "badge": "Admission Open for 2026-27 Session",
          "image": "https://images.unsplash.com/photo-1763656443687-c3de11b68813?q=80&w=687&auto=format&fit=crop"
        },
        "about": {
          "title": "Building Future Leaders Since 2010",
          "description": "Special academy has been the trusted choice for parents and students aspiring for cadet college admissions. Our holistic approach combines academic rigor with character building.",
          "image": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
          "values": [
            { "title": "Mission", "description": "To prepare disciplined, academically excellent, and morally upright future leaders through comprehensive cadet preparation programs." },
            { "title": "Discipline", "description": "We instill military-grade discipline, punctuality, and self-control that forms the foundation of successful cadet life." },
            { "title": "Excellence", "description": "Pursuit of academic and personal excellence is at the core of everything we teach, ensuring our students stand out." },
            { "title": "Character", "description": "Building strong character, integrity, and leadership qualities that last a lifetime beyond cadet college admission." }
          ]
        },
        "stats": [
          { "label": "Students Enrolled", "value": "2500", "suffix": "+", "description": "Since 2010" },
          { "label": "Success Rate", "value": "94", "suffix": "%", "description": "College admission" },
          { "label": "Expert Faculty", "value": "35", "suffix": "+", "description": "Qualified instructors" },
          { "label": "Years Experience", "value": "15", "suffix": "+", "description": "In education" }
        ],
        "seo": {
          "metaDescription": "Special Academy - Nepal''s premier cadet preparation academy.",
          "gaTrackingId": ""
        },
        "sections": {
          "hero": true, "about": true, "whyChoose": true, "cadetOverview": true,
          "stats": true, "courses": true, "freeResources": true, "notices": true,
          "testimonials": true, "faculty": true, "facilities": true, "activities": true,
          "gallery": true, "enrollmentCta": true, "faq": true, "contact": true, "blog": true
        },
        "cta": {
          "title": "Start Your Cadet Journey Today",
          "subtitle": "Join Nepal''s most trusted cadet preparation academy.",
          "buttonText": "Enroll Now",
          "buttonLink": "/enroll"
        },
        "footer": {
          "copyright": "© 2026 Special Academy. All rights reserved.",
          "description": "Special Academy is Nepal''s premier cadet preparation institution."
        }
      }'::jsonb
    where id = existing_id
      and (config is null or config = '{}'::jsonb);
  end if;
end $$;
