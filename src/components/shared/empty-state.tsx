"use client";

import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href: string };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="py-16 text-center">
        <Icon className="w-12 h-12 text-muted mx-auto mb-3" />
        <h3 className="font-semibold text-primary mb-1">{title}</h3>
        <p className="text-sm text-muted">{description}</p>
        {action && (
          <Button className="mt-4" asChild>
            <Link href={action.href}>{action.label}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
