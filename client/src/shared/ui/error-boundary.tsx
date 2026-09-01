import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <main className="mx-auto max-w-lg p-8 text-ink">
        <h1 className="text-xl font-medium">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted">{this.state.error.message}</p>
      </main>
    );
  }
}
