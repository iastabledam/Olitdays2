
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Simple Error Boundary to catch crashes and avoid white screen
class ErrorBoundary extends React.Component<any, { hasError: boolean, error: Error | null }> {
  public state: { hasError: boolean, error: Error | null };
  public props: any;

  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
    this.props = props;
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: 'sans-serif', maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ color: '#e11d48', fontSize: 24, marginBottom: 10 }}>Une erreur est survenue</h1>
          <p style={{ color: '#4b5563', marginBottom: 20 }}>L'application a rencontré un problème critique.</p>
          <div style={{ background: '#f3f4f6', padding: 20, borderRadius: 8, overflow: 'auto', border: '1px solid #d1d5db' }}>
            <pre style={{ color: '#dc2626', fontSize: 12 }}>{this.state.error?.toString()}</pre>
          </div>
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{ marginTop: 20, padding: '10px 20px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}
          >
            Réinitialiser l'application (Effacer les données)
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
