// Global Error Boundary — Catch errors + Toast
import React, { Component, type ReactNode } from "react";
import { toast } from "sonner";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
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

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Panenku Error:", error, errorInfo);
    toast.error(`Terjadi kesalahan: ${error.message}`);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
          <AlertTriangle className="h-16 w-16 text-danger mb-4" />
          <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan</h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-xs">
            {this.state.error?.message || "Kesalahan yang tidak diketahui terjadi"}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground"
          >
            <RefreshCw className="h-5 w-5" />
            Muat Ulang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Global error handler for async errors (non-React)
export function setupGlobalErrorHandler() {
  if (typeof window === "undefined") return;

  const originalOnError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    const msg = typeof message === "string" ? message : "Kesalahan tak terduga";
    toast.error(msg);
    originalOnError?.(message, source, lineno, colno, error);
  };

  const originalOnRejection = window.onunhandledrejection;
  window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
    const msg = event.reason?.message || "Promise error";
    toast.error(msg);
    (originalOnRejection as any)?.(event);
  });
}