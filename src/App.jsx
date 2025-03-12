import React from 'react';
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import enTranslations from '@shopify/polaris/locales/en.json';
import LiquidCodeEditorWrapper from './Editor';
import "./App.css";


function App() {
  return (
    <AppProvider i18n={enTranslations}>
      <LiquidCodeEditorWrapper />
    </AppProvider>
  );
}

export default App;
