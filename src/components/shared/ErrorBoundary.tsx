import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Copy, Check } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, copied: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
    this.setState({ errorInfo: info });
    // Auto-reload on stale chunk / dynamic import failures
    if (error?.message?.includes("dynamically imported module") || error?.message?.includes("Importing a module script failed") || error?.message?.includes("Failed to fetch dynamically imported module")) {
      setTimeout(() => window.location.reload(), 1500);
    }
  }

  handleReset = () => {
    const { error } = this.state;
    // If it's a dynamic import failure (stale cache), hard-reload to get fresh chunks
    if (error?.message?.includes("dynamically imported module") || error?.message?.includes("Importing a module script failed")) {
      window.location.reload();
      return;
    }
    this.setState({ hasError: false, error: null, errorInfo: null, copied: false });
    this.props.onReset?.();
  };

  handleCopyLog = async () => {
    const { error, errorInfo } = this.state;
    const log = [
      `Error: ${error?.message || "Unknown"}`,
      `Stack: ${error?.stack || "N/A"}`,
      `Component: ${errorInfo?.componentStack || "N/A"}`,
      `Time: ${new Date().toISOString()}`,
      `URL: ${window.location.href}`,
      `UA: ${navigator.userAgent}`,
    ].join("\n\n");

    try {
      await navigator.clipboard.writeText(log);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch {
      // Fallback for native webview where clipboard API may fail
      const ta = document.createElement("textarea");
      ta.value = log;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 p-8 text-center min-h-[200px]" style={{ background: "#0a0a0a", color: "#fff" }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(239,68,68,0.15)" }}>
            <AlertTriangle size={24} style={{ color: "#ef4444" }} />
          </div>
          <div>
            <h3 className="text-sm font-bold mb-1">
              {this.props.fallbackTitle || "Something went wrong"}
            </h3>
            <p className="text-xs max-w-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition"
              style={{ background: "#a65eed", color: "#fff" }}
            >
              <RefreshCw size={14} />
              Try Again
            </button>
            <button
              onClick={this.handleCopyLog}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition"
              style={{ background: "rgba(255,255,255,0.1)", color: "#fff" }}
            >
              {this.state.copied ? <Check size={14} /> : <Copy size={14} />}
              {this.state.copied ? "Copied!" : "Copy Log"}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
