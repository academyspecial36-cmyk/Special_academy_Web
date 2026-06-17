"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import type { Question } from "@/types";

interface QuestionEditorProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: "mcq" | "subjective";
    question: string;
    options: string[];
    answer: string;
    explanation: string;
  }) => void;
  existingQuestions: Question[];
  initialValues?: Question;
  title?: string;
}

function getWordSuggestions(text: string, existingQuestions: Question[]): string[] {
  const words = new Set<string>();
  for (const q of existingQuestions) {
    for (const w of q.question.split(/\s+/)) {
      const cleaned = w.replace(/[^a-zA-Z0-9\u0900-\u097F]/g, "").toLowerCase();
      if (cleaned.length > 1) words.add(cleaned);
    }
  }

  const currentWord = text.split(/\s+/).pop()?.toLowerCase() || "";
  if (currentWord.length < 1) return [];

  return Array.from(words)
    .filter((w) => w.startsWith(currentWord) && w !== currentWord)
    .slice(0, 6);
}

export function QuestionEditor({
  open,
  onClose,
  onSubmit,
  existingQuestions,
  initialValues,
  title = "Add Question",
}: QuestionEditorProps) {
  const [type, setType] = useState<"mcq" | "subjective">("mcq");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [answer, setAnswer] = useState("");
  const [explanation, setExplanation] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const questionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      if (initialValues) {
        setType(initialValues.type);
        setQuestion(initialValues.question);
        setOptions(
          initialValues.options.length > 0 ? initialValues.options : ["", ""]
        );
        setAnswer(initialValues.answer);
        setExplanation(initialValues.explanation);
      } else {
        setType("mcq");
        setQuestion("");
        setOptions(["", ""]);
        setAnswer("");
        setExplanation("");
      }
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    }
  }, [open, initialValues]);

  const suggestions = useMemo(
    () => getWordSuggestions(question, existingQuestions),
    [question, existingQuestions]
  );

  function handleAddOption() {
    setOptions((prev) => [...prev, ""]);
  }

  function handleRemoveOption(index: number) {
    setOptions((prev) => prev.filter((_, i) => i !== index));
    setAnswer((prev) => {
      if (prev === options[index]) return "";
      return prev;
    });
  }

  function handleOptionChange(index: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  }

  function handleSuggestionClick(word: string) {
    const words = question.split(/\s+/);
    words[words.length - 1] = word;
    setQuestion(words.join(" ") + " ");
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    questionRef.current?.focus();
  }

  function handleQuestionKeyDown(e: React.KeyboardEvent) {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) =>
        Math.min(prev + 1, suggestions.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" || e.key === "Tab") {
      if (activeSuggestionIndex >= 0) {
        e.preventDefault();
        handleSuggestionClick(suggestions[activeSuggestionIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;

    const filteredOptions =
      type === "mcq" ? options.filter((o) => o.trim()) : [];

    onSubmit({
      type,
      question: question.trim(),
      options: filteredOptions,
      answer: answer.trim(),
      explanation: explanation.trim(),
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-medium text-primary mb-2 block">
            Question Type
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setType("mcq");
                setOptions(["", ""]);
                setAnswer("");
              }}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                type === "mcq"
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white text-muted border-primary/10 hover:border-primary/30"
              }`}
            >
              Multiple Choice
            </button>
            <button
              type="button"
              onClick={() => {
                setType("subjective");
                setOptions([]);
                setAnswer("");
              }}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                type === "subjective"
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white text-muted border-primary/10 hover:border-primary/30"
              }`}
            >
              Subjective
            </button>
          </div>
        </div>

        <div className="relative">
          <label className="text-sm font-medium text-primary mb-1.5 block">
            Question <span className="text-red-500">*</span>
          </label>
          <textarea
            ref={questionRef}
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value);
              setShowSuggestions(true);
              setActiveSuggestionIndex(-1);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyDown={handleQuestionKeyDown}
            placeholder="Enter your question..."
            rows={2}
            required
            className="w-full rounded-xl border border-primary/10 bg-white px-4 py-2.5 text-sm text-primary outline-none focus:border-primary/30 focus:ring-0 placeholder:text-muted resize-none"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-white border border-primary/10 rounded-xl shadow-lg overflow-hidden">
              {suggestions.map((word, i) => (
                <button
                  key={word}
                  type="button"
                  onMouseDown={() => handleSuggestionClick(word)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    i === activeSuggestionIndex
                      ? "bg-primary/5 text-primary"
                      : "text-muted hover:bg-accent"
                  }`}
                >
                  {word}
                </button>
              ))}
            </div>
          )}
        </div>

        {type === "mcq" && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-primary">
                Options
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Option
              </Button>
            </div>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary/5 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <Input
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    className="flex-1"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(i)}
                      className="p-1.5 rounded-md text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-primary mb-1.5 block">
            {type === "mcq" ? "Correct Answer" : "Model Answer"}{" "}
            <span className="text-red-500">*</span>
          </label>
          {type === "mcq" ? (
            options.filter((o) => o.trim()).length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {options
                  .filter((o) => o.trim())
                  .map((opt, i) => {
                    const letter = String.fromCharCode(65 + i);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setAnswer(opt)}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                          answer === opt
                            ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                            : "bg-white border-primary/10 text-muted hover:border-primary/30"
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            answer === opt
                              ? "bg-emerald-500 text-white"
                              : "bg-primary/5 text-primary"
                          }`}
                        >
                          {letter}
                        </span>
                        {opt}
                      </button>
                    );
                  })}
              </div>
            ) : (
              <Input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type the correct answer..."
                required
              />
            )
          ) : (
            <Input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter the model answer..."
              required
            />
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-primary mb-1.5 block">
            Explanation
          </label>
          <Textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Explain why this answer is correct..."
            rows={3}
          />
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-primary/5">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {initialValues ? "Update Question" : "Add Question"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
