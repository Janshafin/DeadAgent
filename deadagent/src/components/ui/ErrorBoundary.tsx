'use client';

import React, { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center py-24 gap-6">
          <div className="w-16 h-16 rounded-full border border-red-500/30 bg-red-500/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-red-400 text-[28px]">error</span>
          </div>
          <div className="text-center flex flex-col gap-2">
            <h3 className="font-serif text-[20px] text-[#e4e2e1]">Something went wrong</h3>
            <p className="font-sans text-[12px] text-[#99907e] max-w-md leading-relaxed">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="border border-[#c9a84c]/30 text-[#c9a84c] px-6 py-2 rounded-sm text-[10px] uppercase tracking-[0.2em] hover:bg-[#c9a84c]/10 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
