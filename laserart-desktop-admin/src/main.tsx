console.log("REACT MAIN.TSX STARTING...");
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'

console.log("Check for root element...");
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("FATAL: Root element not found");
  alert("FATAL: Root element not found (#root)");
} else {
  try {
    console.log("Initializing React Root...");
    const root = createRoot(rootElement);
    console.log("Rendering App...");
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
    console.log("Render call completed.");
  } catch (err: any) {
    console.error("FATAL: Failed to render app", err);
    alert("Startup Crash: " + err.message);
  }
}
