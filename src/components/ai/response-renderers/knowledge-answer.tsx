"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

interface KnowledgeAnswerData {
  title?: string;
  content?: string;
  sources?: { title: string; url: string }[];
}

export function KnowledgeAnswerRenderer({ data }: { data: KnowledgeAnswerData }) {
  return (
    <Card className="border-primary/5">
      <CardHeader>
        {data.title && (
          <CardTitle className="text-base">{data.title}</CardTitle>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {data.content && (
          <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {data.content}
          </div>
        )}
        {data.sources && data.sources.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t">
            <p className="text-xs text-muted font-medium">Sources:</p>
            {data.sources.map((source, i) => (
              <a
                key={i}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-1.5 text-xs text-primary hover:underline",
                )}
              >
                <ExternalLink className="w-3 h-3" />
                {source.title}
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
