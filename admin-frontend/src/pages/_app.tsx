// src/pages/_app.tsx  (hoặc /pages/_app.tsx tùy project)
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import '../app/globals.css';
import type { NextPageWithLayout } from '../types/next';
import type { NextComponentType } from 'next'; // optional
import { ReactElement } from 'react';


type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page: ReactElement) => page);
  
  return (
    <Provider store={store}>
      {getLayout(<Component {...pageProps} />)}
    </Provider> 
  );
}

export default MyApp;
