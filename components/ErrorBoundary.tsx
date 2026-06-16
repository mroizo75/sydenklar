"use client"

import { Component, ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
}

interface State {
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    // Logg til konsollet med full stack for enklere debugging
    console.error("[ErrorBoundary]", error.message, info.componentStack)
  }

  reset = () => this.setState({ error: null })

  render() {
    const { error } = this.state
    if (error) {
      if (this.props.fallback) {
        return this.props.fallback(error, this.reset)
      }
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center">
          <p className="text-sm font-semibold text-red-600 mb-1">Noe gikk galt</p>
          <p className="text-xs text-[var(--muted)] mb-4 max-w-xs">{error.message}</p>
          <button
            onClick={this.reset}
            className="text-xs px-4 py-2 rounded-lg bg-[var(--coral)] text-white hover:opacity-90 transition-opacity"
          >
            Prøv igjen
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
