import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// biome-ignore lint/style/noNonNullAssertion: Ignore
ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
