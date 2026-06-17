opencode -s ses_15009b119ffeBdhDf8mTrm2rV6



export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "Mobile Chrome", use: { ...devices["Pixel 5"] } },
    { name: "Mobile Safari", use: { ...devices["iPhone 12"] } },
  ],
});


 "test:e2e": "playwright test",
    "test:ci": "vitest run && playwright test"


    name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npx vitest run --reporter=verbose

  e2e:
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npx playwright install chromium
      - run: npx playwright test
        env:
          PLAYWRIGHT_BASE_URL: http://localhost:3000

  build:
    runs-on: ubuntu-latest
    needs: [quality, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npm run build


info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
 ✓ Linting and checking validity of types 
 ✓ Collecting page data    
 ✓ Generating static pages (70/70)
 ✓ Collecting build traces    
 ✓ Finalizing page optimization    

Route (app)                                 Size  First Load JS    
┌ ○ /                                    8.91 kB         182 kB
├ ○ /_not-found                            235 B         103 kB
├ ○ /about                                 794 B         147 kB
├ ƒ /api/ai/chat                           235 B         103 kB
├ ƒ /api/ai/confirm-tool                   235 B         103 kB
├ ƒ /api/ai/embed                          235 B         103 kB
├ ƒ /api/analytics                         235 B         103 kB
├ ƒ /api/auth/login                        235 B         103 kB
├ ƒ /api/auth/logout                       235 B         103 kB
├ ƒ /api/auth/register                     235 B         103 kB
├ ƒ /api/auth/session                      235 B         103 kB
├ ƒ /api/backup                            235 B         103 kB
├ ƒ /api/bootstrap                         235 B         103 kB
├ ƒ /api/communications/history            235 B         103 kB
├ ƒ /api/communications/history/[id]       235 B         103 kB
├ ƒ /api/communications/send               235 B         103 kB
├ ƒ /api/communications/templates          235 B         103 kB
├ ƒ /api/communications/templates/[id]     235 B         103 kB
├ ƒ /api/contact                           235 B         103 kB
├ ƒ /api/data/[table]                      235 B         103 kB
├ ƒ /api/data/[table]/[id]                 235 B         103 kB
├ ƒ /api/enroll                            235 B         103 kB
├ ƒ /api/enrollment-status                 235 B         103 kB
├ ƒ /api/enrollments/[id]/review           235 B         103 kB
├ ƒ /api/exam/submit                       235 B         103 kB
├ ƒ /api/media                             235 B         103 kB
├ ƒ /api/media/[id]                        235 B         103 kB
├ ƒ /api/media/folders                     235 B         103 kB
├ ƒ /api/media/folders/[id]                235 B         103 kB
├ ƒ /api/media/optimize                    235 B         103 kB
├ ƒ /api/notes                             235 B         103 kB
├ ƒ /api/notes/[id]                        235 B         103 kB
├ ƒ /api/notifications                     235 B         103 kB
├ ƒ /api/settings                          235 B         103 kB
├ ƒ /api/setup/admin                       235 B         103 kB
├ ƒ /api/student-courses                   235 B         103 kB
├ ƒ /api/student-profile                   235 B         103 kB
├ ƒ /api/student/notices                   235 B         103 kB
├ ƒ /api/upload                            235 B         103 kB
├ ƒ /api/verify-enrollment                 235 B         103 kB
├ ƒ /api/verify-passcode                   235 B         103 kB
├ ○ /blog                                4.43 kB         159 kB
├ ● /blog/[slug]                         3.89 kB         159 kB
├ ○ /contact                             5.51 kB         166 kB
├ ○ /courses                             6.56 kB         173 kB
├ ○ /dashboard                           7.78 kB         157 kB
├ ○ /dashboard/ai                        15.6 kB         174 kB
├ ○ /dashboard/blog                      4.69 kB         169 kB
├ ƒ /dashboard/blog/[id]                  7.4 kB         168 kB
├ ○ /dashboard/categories                4.18 kB         177 kB
├ ○ /dashboard/communications            9.31 kB         168 kB
├ ○ /dashboard/contact-submissions       4.39 kB         163 kB
├ ○ /dashboard/courses                   2.86 kB         189 kB
├ ƒ /dashboard/courses/[id]              11.6 kB         197 kB
├ ○ /dashboard/enrollments               5.73 kB         179 kB
├ ○ /dashboard/exams                     2.11 kB         188 kB
├ ƒ /dashboard/exams/[id]                6.65 kB         186 kB
├ ƒ /dashboard/exams/[id]/results        6.09 kB         143 kB
├ ○ /dashboard/faculty                   2.39 kB         185 kB
├ ○ /dashboard/faqs                      2.19 kB         185 kB
├ ○ /dashboard/gallery                   4.97 kB         188 kB
├ ○ /dashboard/guide                       19 kB         122 kB
├ ○ /dashboard/media                     8.54 kB         173 kB
├ ○ /dashboard/notes                     7.32 kB         169 kB
├ ○ /dashboard/notices                   2.57 kB         185 kB
├ ○ /dashboard/settings                  19.5 kB         260 kB
├ ○ /dashboard/students                  3.05 kB         186 kB
├ ○ /dashboard/testimonials              2.75 kB         185 kB
├ ○ /enrollment                          12.5 kB         175 kB
├ ○ /forgot-password                     4.23 kB         153 kB
├ ○ /gallery                             3.19 kB         163 kB
├ ○ /guide                                 493 B         107 kB
├ ○ /login                                6.3 kB         220 kB
├ ○ /notices                             4.72 kB         171 kB
├ ○ /privacy                             1.59 kB         119 kB
├ ○ /student                             6.67 kB         235 kB
├ ○ /student/courses                     3.17 kB         167 kB
├ ƒ /student/courses/[id]                9.11 kB         247 kB
├ ○ /student/exams                       4.91 kB         169 kB
├ ƒ /student/exams/[id]                  6.39 kB         235 kB
├ ƒ /student/exams/[id]/result           5.09 kB         169 kB
├ ○ /student/exams/results               4.63 kB         168 kB
├ ○ /student/guide                         235 B         103 kB
├ ○ /student/notices                     4.33 kB         171 kB
├ ○ /student/profile                     8.93 kB         235 kB
├ ○ /team                                1.59 kB         161 kB
├ ○ /terms                               1.57 kB         119 kB
└ ○ /testimonials                        2.83 kB         157 kB
+ First Load JS shared by all             103 kB
  ├ chunks/1255-b8cf77ab14370e57.js        46 kB
  ├ chunks/4bd1b696-100b9d70ed4e49c1.js  54.2 kB
  └ other shared chunks (total)          2.64 kB


○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand

