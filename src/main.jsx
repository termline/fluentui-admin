import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import ErrorBoundary from './components/ErrorBoundary.jsx';

createRoot(document.getElementById('root')).render(
  <FluentProvider theme={webLightTheme}>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </FluentProvider>
);
