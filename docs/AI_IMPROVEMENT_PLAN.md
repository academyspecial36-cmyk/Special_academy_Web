# AI Command Center — Architecture Analysis & Improvement Plan

## 1. Current Architecture

### High-Level Flow

```
User Input → ChatInterface → POST /api/ai/chat → streamChat (OpenRouter)
                                                      │
                                          ┌───────────┴───────────┐
                                          ▼                       ▼
                                    Tool Registry           Knowledge Base
                                    (25 tools)              (RAG / pgvector)
                                          │                       │
                                          ▼                       ▼
                                    Supabase CRUD           ai_documents
                                                              (embeddings)
                                          │
                                          ▼
                                    Response Blocks → ResponseRenderer → UI
```

### Components

| Component | Role | File |
|---|---|---|
| `ChatInterface` | Main orchestrator, manages messages/streaming/state | `chat-interface.tsx` |
| `ChatHeader` | Header with title + export button | `chat-header.tsx` |
| `ChatInput` | Textarea + send, auto-resize, error banner | `chat-input.tsx` |
| `ChatEmptyState` | Suggestion starters when no conversation | `chat-empty-state.tsx` |
| `ChatMessage` | Renders a single message (user/assistant) | `chat-message.tsx` |
| `ResponseRenderer` | Dispatches blocks to type-specific renderers | `response-renderers/renderer.tsx` |
| `KnowledgeAnswerRenderer` | Guide/knowledge content display | Pulls from RAG results |
| `ConfirmationCardRenderer` | Destructive action confirmation UI | Inline confirm/cancel |
| `ActionResultRenderer` | Success/failure result display | Status + message |
| `ConversationHistory` | Sidebar with grouped/searchable history | `conversation-history.tsx` |

### Tools (25 registered)

- **CRUD Tools**: create/update/delete for notices, courses, exams, FAQs, blogs, students
- **Query Tools**: getStudents, getCourses, getNotices, getEnrollments, getFAQs, getBlogs
- **Action Tools**: approveEnrollment, rejectEnrollment, publishBlog, pinNotice
- **System Tools**: enableMaintenance, disableMaintenance, backupSystem
- **Knowledge Tool**: searchKnowledge (RAG hybrid search)

### Data Flow

1. User types message → `handleSend` creates `AbortController` stream
2. `POST /api/ai/chat` creates/gets conversation, saves user message, loads history
3. `streamChat` calls OpenRouter with system prompt + conversation + tools
4. AI decides: tool call → execute → follow-up response, or direct text response
5. SSE stream sends: `token | tool_call | block | tool_result | done`
6. `ChatInterface` parses SSE events into messages + blocks
7. `ResponseRenderer` dispatches blocks to renderers

## 2. What's Missing

### Critical Gaps

| Gap | Impact | Priority |
|---|---|---|
| **No fallback when all 3 models fail** | User gets blank error | High |
| **No streaming timeout** | Stream hangs indefinitely | High |
| **No token usage tracking** | Can hit context window silently | High |
| **No conversation auto-title** | History shows raw first message | Medium |
| **No RAG seeding automation** | Guide content not searchable | High |
| **No tool error feedback in follow-up** | Tool fails silently after confirmation | Medium |
| **No response streaming indicator** | User can't tell if AI is thinking | Low |
| **No rate limit feedback in UI** | "Too many requests" toast is generic | Low |

### UX Gaps for Non-Technical Users

| Gap | Why It Matters |
|---|---|
| **No guided onboarding** | First-time users don't know what to ask |
| **No suggested follow-up questions** | Users don't explore AI's capabilities |
| **No "view source" for knowledge answers** | Users can't verify guide content |
| **No natural language variations** | Must use exact phrasing for tools |
| **No undo for accidental actions** | Destructive changes are permanent |
| **No conversation sharing** | Can't collaborate on troubleshooting |

## 3. Improvement Roadmap

### Phase 1 (Immediate — implement now)
- **Seed guide data into RAG** — Feed `guide-data.ts` sections into `ai_documents` for better how-to answers
- **Fix renderer `any` casts** — Type-safe block dispatch
- **Add SSE reconnection** — Auto-retry on stream failure (3 attempts)
- **Add token limit awareness** — Surface context window warnings
- **Add ARIA labels** — Accessibility for all AI interactive elements

### Phase 2 (Short-term)
- **Guided onboarding modal** — First-visit tour of AI capabilities
- **Suggested questions** — Context-aware follow-up suggestions after each response
- **Natural language variations** — Expand system prompt with more query phrasings
- **Stream reliability dashboard** — Show model fallback status in UI

### Phase 3 (Medium-term)
- **Undo system** — Store last 5 actions in `ai_action_logs` for rollback
- **Conversation sharing** — Generate shareable links
- **Multi-modal input** — Upload images/documents for context
- **Custom instructions** — Let users set preferences for how AI behaves

## 4. How to Make AI Easy for Non-Technical Users

### 1. Guided Onboarding (AI Tour)
On first visit to `/dashboard/ai`, show a modal:
```
"Hi! I'm your AI assistant. I can help you:
• Add/edit students, courses, notices
• Answer questions about academy settings
• Guide you through admin tasks
Try asking: "How do I add a new course?" or "Show me pending enrollments"
```

### 2. Context-Aware Suggestions
After each AI response, show 3 suggested follow-ups based on the context:
- After listing students: "Try: 'Add a new student' or 'Show me inactive students'"
- After creating a notice: "Try: 'Pin this notice' or 'Send notification about this'"

### 3. Progressive Disclosure
- Default view: Simple chat input + suggestion chips
- Advanced: Show tool call details, confidence scores, source citations

### 4. Natural Language Flexibility
The system prompt already has solid decision tree logic. Enhance with:
- More synonym mappings (e.g., "enroll" → approveEnrollment, "remove" → delete)
- Accept typos and partial matches by expanding the AI's instructions
- Add "I don't know" fallback with human handoff option

### 5. Visual Feedback
- Show model fallback attempts (e.g., "Primary model unavailable, using backup")
- Show token usage bar (progress toward context limit)
- Animate tool execution steps (searching → generating → confirming)

### 6. Guide Integration (Already Partially Done)
The `searchKnowledge` tool + RAG allows the AI to answer how-to questions. Ensure:
- All guide sections from `guide-data.ts` are seeded into `ai_documents`
- FAQ data is refreshed periodically
- Course descriptions and settings config are indexed

## 5. JSON Response Format

The AI already responds in JSON format per the system prompt:
```json
{
  "message": "Brief summary",
  "blocks": [{ "type": "block_type", "data": { ... } }]
}
```

The `parseAIResponse()` function extracts this from the AI's text output. The `extractBlocks()` function separates the message from the blocks.

### Enhancement: Ensure JSON Validity
- Add JSON schema validation for AI responses
- Add retry with "Please respond in valid JSON format" on parse failure
- Use structured output mode when available (OpenRouter supports `response_format`)

## 6. Guide Data Seeding Plan

The `seedDocuments()` function in `rag.ts` currently seeds FAQs, courses, and settings guide content. It's missing the comprehensive guide data from `guide-data.ts`.

**Fix**: Add a `seedGuideContent()` function that reads the guide sections and inserts them as AI documents. This should be called:
1. On initial setup via `/api/ai/embed?action=seed`
2. Periodically or when guide content changes
3. Via a new admin action in the Settings/Guide page

The embedding pipeline:
```
GuideSection → extract title + steps + tips → chunk into documents → generate embeddings → store in ai_documents
```
