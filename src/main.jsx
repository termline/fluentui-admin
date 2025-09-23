import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { FluentProvider } from '@fluentui/react-components';
import { adminTheme } from './theme/customTheme.js';
import ErrorBoundary from './components/ErrorBoundary.jsx';

createRoot(document.getElementById('root')).render(
  <FluentProvider theme={adminTheme}>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </FluentProvider>
);
