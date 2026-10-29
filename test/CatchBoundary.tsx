import { Component, type ReactNode } from 'react';

interface CatchBoundaryState {
  message: string | null;
}

export class CatchBoundary extends Component<{ children: ReactNode }, CatchBoundaryState> {
  override state: CatchBoundaryState = { message: null };

  static getDerivedStateFromError(error: Error): CatchBoundaryState {
    return { message: error.message };
  }

  override render() {
    return this.state.message === null ? this.props.children : <p>erro: {this.state.message}</p>;
  }
}
