"use client";

import { Component } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <h2 className="text-lg font-semibold text-primary mb-2">Something went wrong</h2>
          <p className="text-sm text-muted mb-6 max-w-md">
            {this.state.error?.message || "An unexpected error occurred. Please try again."}
          </p>
          <Button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reload page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
