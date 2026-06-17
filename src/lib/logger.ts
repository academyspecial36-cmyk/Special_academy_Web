type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  source?: string;
  action?: string;
  userId?: string;
  error?: unknown;
  timestamp: string;
}

function formatLog(entry: LogEntry): string {
  const parts = [`[${entry.timestamp}]`, `[${entry.level.toUpperCase()}]`, entry.message];
  if (entry.source) parts.push(`[source=${entry.source}]`);
  if (entry.action) parts.push(`[action=${entry.action}]`);
  if (entry.userId) parts.push(`[user=${entry.userId}]`);
  return parts.join(" ");
}

function createEntry(
  level: LogLevel,
  message: string,
  opts?: { source?: string; action?: string; userId?: string; error?: unknown },
): LogEntry {
  return {
    level,
    message,
    source: opts?.source,
    action: opts?.action,
    userId: opts?.userId,
    error: opts?.error,
    timestamp: new Date().toISOString(),
  };
}

function log(entry: LogEntry) {
  const formatted = formatLog(entry);
  switch (entry.level) {
    case "error":
      console.error(formatted, entry.error ?? "");
      break;
    case "warn":
      console.warn(formatted, entry.error ?? "");
      break;
    default:
      console.log(formatted);
  }
}

export const logger = {
  debug: (message: string, opts?: { source?: string; action?: string; userId?: string }) =>
    log(createEntry("debug", message, opts)),
  info: (message: string, opts?: { source?: string; action?: string; userId?: string }) =>
    log(createEntry("info", message, opts)),
  warn: (message: string, opts?: { source?: string; action?: string; userId?: string; error?: unknown }) =>
    log(createEntry("warn", message, opts)),
  error: (message: string, opts?: { source?: string; action?: string; userId?: string; error?: unknown }) =>
    log(createEntry("error", message, opts)),
};
