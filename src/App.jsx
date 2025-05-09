import { useState } from 'react';
import './App.css';
import TiptapEditor from './TiptapEditor';
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';

function App() {
  const initialValue = `<p><span style="background-color: rgb(228, 204, 153);"><strong><span style="color: #1f2124;">&nbsp;</span></strong><strong><span style="color: #1f2124;"><u>Beschreibung</u></span></strong><strong><span style="color: #1f2124;">&nbsp;</span></strong></span><br>Die Fleischtomate 'San Marzano' ist eine mehrjährige, alte
  und traditionelle Tomatensorte aus Kampanien in Italien. Diese besondere schmackhafte späte Stabtomaten Sorte ist
  bestens geeignet für Suppen, Soßen und zur Herstellung von Tomatenmark. Die länglich ovalen roten Früchte haben einen
  geringen Wasseranteil und festes Fruchtfleisch. Der Geschmack ist legendär fruchtig-aromatisch. Die
  krankheitstolerante Tomatensorte zeichnet sich besonders durch einen äußerst robusten Wuchs und Ernteertrag
  aus.&nbsp;<br>Die San Marzano ist eine Sorte die 1991 endgültig aus dem offiziellen Sortenkatalog gestrichen wurde,
  abgelöst von resistenteren und pflegeleichteren Sorten. Dank einer Initiative der Region Kampanien, blieb die
  Feinschmecker Sorte in Hausgärten erhalten und kann heute weiter verbreitet werden.<br></p>`;
  
  const [value, setValue] = useState(initialValue);

  return (
    <AppProvider i18n={{}}>
      <div className="App">
        <TiptapEditor value={value} onChange={(value) => setValue(value)} disabled={false} />
      </div>
    </AppProvider>
  );
}

export default App;
