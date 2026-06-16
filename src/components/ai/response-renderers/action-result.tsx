"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

interface ActionResultData {
  title?: string;
  message?: string;
  success?: boolean;
}

export function ActionResultRenderer({ data }: { data: ActionResultData }) {
  const isSuccess = data.success !== false;

  return (
    <Card className={cn(isSuccess ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50")}>
      <CardHeader>
        <CardTitle className={cn("text-base flex items-center gap-2", isSuccess ? "text-emerald-800" : "text-red-800")}>
          {isSuccess ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {data.title ?? (isSuccess ? "Success" : "Error")}
        </CardTitle>
      </CardHeader>
      {data.message && (
        <CardContent>
          <p className={cn("text-sm", isSuccess ? "text-emerald-700" : "text-red-700")}>
            {data.message}
          </p>
        </CardContent>
      )}
      <CardFooter>
        <Button variant="outline" size="sm" onClick={() => {}}>
          Dismiss
        </Button>
      </CardFooter>
    </Card>
  );
}
