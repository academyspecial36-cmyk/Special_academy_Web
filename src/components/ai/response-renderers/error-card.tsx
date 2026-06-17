"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ErrorCardData {
  title?: string;
  message?: string;
  suggestion?: string;
}

export function ErrorCardRenderer({ data }: { data: ErrorCardData }) {
  return (
    <Card className="border-red-200 bg-red-50/50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2 text-red-800">
          <AlertCircle className="w-4 h-4 text-red-600" />
          {data.title ?? "Error"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {data.message && (
          <p className="text-sm text-red-700">{data.message}</p>
        )}
        {data.suggestion && (
          <p className="text-xs text-red-600/80 bg-red-100/50 rounded-md px-3 py-2">
            Suggestion: {data.suggestion}
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm">
          Dismiss
        </Button>
      </CardFooter>
    </Card>
  );
}
