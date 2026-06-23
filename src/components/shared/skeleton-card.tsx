import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  lines?: number;
  height?: number | string;
  className?: string;
}

export function SkeletonCard({ lines = 3, height, className }: SkeletonCardProps) {
  return (
    <Card className={cn("animate-pulse", className)}>
      <CardContent className="p-5">
        {height ? (
          <div className="bg-primary/5 rounded" style={{ height: typeof height === "number" ? height : height }} />
        ) : (
          <>
            <div className="h-4 bg-primary/5 rounded w-24 mb-3" />
            <div className="h-8 bg-primary/5 rounded w-16 mb-3" />
            {Array.from({ length: lines - 2 }).map((_, i) => (
              <div key={i} className="h-3 bg-primary/5 rounded w-32 mt-2" />
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}
