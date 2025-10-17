// src/redux/StoreProvider.tsx
"use client"; // Đánh dấu đây là một Client Component

import { Provider } from 'react-redux';
import { store } from './store';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}