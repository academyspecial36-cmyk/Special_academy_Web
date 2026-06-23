"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircle, XCircle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Question } from "@/types";

interface AnswerDetail {
  questionId: string;
  answer: string;
  correct: boolean;
}

interface QuestionResultCardProps {
  question: Question;
  answer: AnswerDetail | undefined;
  index: number;
}

export function QuestionResultCard({ question, answer, index }: QuestionResultCardProps) {
  const isCorrect = answer?.correct ?? false;
  const userAnswer = answer?.answer || "";
  const isUnanswered = !userAnswer.trim();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Card className={`border-l-4 ${isCorrect ? "border-l-emerald-500" : "border-l-red-500"}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${isCorrect ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
              {index + 1}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-sm font-medium">{question.question}</CardTitle>
                <Badge variant="outline" className={`text-[9px] ${question.type === "mcq" ? "text-blue-600" : "text-amber-600"}`}>
                  {question.type === "mcq" ? "MCQ" : "Subjective"}
                </Badge>
              </div>

              {question.type === "mcq" && (
                <div className="grid sm:grid-cols-2 gap-2 mt-2">
                  {question.options.map((opt, oi) => {
                    const optText = typeof opt === "string" ? opt : opt.text;
                    const optImage = typeof opt === "string" ? undefined : opt.image;
                    const optValue = optText || optImage || "";
                    const isSelected = userAnswer === optValue;
                    const isRight = optValue === question.answer;
                    let borderClass = "border-primary/10";
                    if (isSelected && isRight) borderClass = "border-emerald-500 bg-emerald-50";
                    else if (isSelected && !isRight) borderClass = "border-red-500 bg-red-50";
                    else if (!isSelected && isRight) borderClass = "border-emerald-500 bg-emerald-50/50";
                    return (
                      <div key={oi} className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs ${borderClass}`}>
                        <span className={`w-5 h-5 rounded-full bg-white border flex items-center justify-center text-[10px] font-medium shrink-0 ${isRight ? "border-emerald-500" : "border-primary/10"}`}>
                          {String.fromCharCode(65 + oi)}
                        </span>
                        <span className={`break-words ${isRight ? "font-medium" : ""}`}>{optText}</span>
                        {optImage && <div className="relative w-8 h-8 rounded overflow-hidden shrink-0"><Image src={optImage} alt="" fill className="object-cover" /></div>}
                        {isRight && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 ml-auto shrink-0" />}
                        {isSelected && !isRight && <XCircle className="w-3.5 h-3.5 text-red-500 ml-auto shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              )}

              {question.type === "subjective" && (
                <div className="mt-2 space-y-2">
                  <div className="p-2.5 bg-accent rounded-lg text-xs">
                    <span className="font-medium text-primary">Your answer: </span>
                    <span className={isUnanswered ? "text-red-500 italic" : "text-primary"}>
                      {isUnanswered ? "No answer provided" : userAnswer}
                    </span>
                  </div>
                  <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs">
                    <span className="font-medium text-amber-800">Model answer: </span>
                    <span className="text-amber-700">{question.answer}</span>
                  </div>
                </div>
              )}

              {!isCorrect && question.explanation && (
                <div className="mt-2 p-2.5 bg-blue-50 rounded-lg border border-blue-100 text-xs">
                  <span className="font-medium text-blue-800">Explanation: </span>
                  <span className="text-blue-700">{question.explanation}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
    </motion.div>
  );
}
