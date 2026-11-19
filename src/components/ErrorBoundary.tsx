import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = {
  children: ReactNode
}

type State = {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Find a Park render error', error, info.componentStack)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="app-error" role="alert">
          <h1 className="app-error__title">Unable to display parks</h1>
          <p className="app-error__message">
            Something went wrong while loading this page. Refresh the page to try again.
          </p>
        </div>
      )
    }

    return this.props.children
  }
}