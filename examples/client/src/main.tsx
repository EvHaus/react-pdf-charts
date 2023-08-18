import App from './App';
import React from 'react';
import ReactDOM from 'react-dom/client';

// rome-ignore lint/style/noNonNullAssertion: Ignore
ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
