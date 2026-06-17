"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ConfirmationCardData {
  title?: string;
  message?: string;
  item?: string;
  action?: string;
  payload?: Record<string, unknown>;
  destructive?: boolean;
  _toolName?: string;
  _toolArgs?: Record<string, unknown>;
  _conversationId?: string;
}

export function ConfirmationCardRenderer({
  data,
  onConfirmTool,
}: {
  data: ConfirmationCardData;
  onConfirmTool?: (result: { success: boolean; message: string; result?: unknown }) => void;
}) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isError, setIsError] = useState(false);

  if (isDone) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="p-4 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
          <p className="text-sm text-green-700">Action confirmed and executed</p>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return null;
  }

  async function handleConfirm() {
    if (!data._toolName || !data._conversationId) {
      toast.error("Missing tool or conversation info");
      return;
    }
    setIsConfirming(true);
    try {
      const res = await fetch("/api/ai/confirm-tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: data._conversationId,
          toolName: data._toolName,
          toolArgs: data._toolArgs,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error ?? "Failed to confirm action");
      }

      const result = await res.json();
      setIsDone(true);
      onConfirmTool?.({
        success: result?.result?.success ?? true,
        message: data.action
          ? `${data.action} completed successfully`
          : "Action completed",
        result: result?.result,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
      setIsError(true);
    } finally {
      setIsConfirming(false);
    }
  }

  function handleCancel() {
    setIsError(true);
    toast.info("Action cancelled");
  }

  return (
    <Card className={data.destructive ? "border-red-200 bg-red-50/50" : "border-amber-200 bg-amber-50/50"}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className={cn("w-4 h-4", data.destructive ? "text-red-600" : "text-amber-600")} />
          {data.title ?? "Confirmation Required"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {data.message && (
          <p className="text-sm text-foreground">{data.message}</p>
        )}
        {data.item && (
          <div className="rounded-lg bg-white border px-3 py-2 text-sm font-medium">
            {data.item}
          </div>
        )}
      </CardContent>
      <CardFooter className="gap-2">
        <Button
          variant={data.destructive ? "destructive" : "default"}
          onClick={handleConfirm}
          disabled={isConfirming}
        >
          {isConfirming && <Loader2 className="w-4 h-4 animate-spin" />}
          Confirm
        </Button>
        <Button variant="outline" onClick={handleCancel} disabled={isConfirming}>
          {isConfirming ? <XCircle className="w-4 h-4" /> : null}
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
}
