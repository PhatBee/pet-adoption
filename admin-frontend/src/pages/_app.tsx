import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { store, persistor } from '../store/store';
import '../app/globals.css';
import type { NextPageWithLayout } from '../types/next';
import { ReactElement } from 'react';
import { PersistGate } from 'redux-persist/integration/react';

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page: ReactElement) => page);
  
  return (
    <Provider store={store}>
      <PersistGate loading={<p>Loading...</p>} persistor={persistor}>
        {getLayout(<Component {...pageProps} />)}
      </PersistGate>
    </Provider>
  );
}

export default MyApp;
