import './App.css';
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import LiquidEditorDemo from './TinyEditor/LiquidEditorDemo';
// import MentionEditorDemo from './TinyEditor/MentionEditorDemo';
import enTranslations from '@shopify/polaris/locales/en.json';

function App() {
  return (
    <AppProvider i18n={enTranslations}>
      <div className="App">
        <LiquidEditorDemo />
        {/* <MentionEditorDemo /> */}
      </div>
    </AppProvider>
  );
}

export default App;
