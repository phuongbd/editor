import { useState } from 'react';
import './App.css';
import TiptapEditor from './TiptapEditor';
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';

function App() {
  const initialValue = `<tc>
  <p>Die mehrjährige Fleischtomate 'San Marzano' ist eine späte, robuste, alte und traditionelle kleinwüchsige
  Stabtomatensorte. Der Geschmack ist legendär fruchtig-aromatisch und ist hervorragend geeignet zum Herstellung von
  Tomatenmark.&nbsp;<strong>Optimal zum Vorkultivieren, Topfkultur möglich, Aussaat Frühling, gut für Mischkultur, Ernte der
  Früchte.&nbsp;</strong>
</p>
<p>
  <span style="background-color: rgb(228, 204, 153);">
    <strong>
      <span style="color: #1f2124;">&nbsp;</span>
    </strong>
    <strong>
      <span style="color: #1f2124;">
        <u>Beschreibung</u>
      </span>
    </strong>
    <strong>
      <span style="color: #1f2124;">&nbsp;</span>
    </strong>
  </span>
  <br>Die Fleischtomate 'San Marzano' ist eine mehrjährige, alte
  und traditionelle Tomatensorte aus Kampanien in Italien. Diese besondere schmackhafte späte Stabtomaten Sorte ist
  bestens geeignet für Suppen, Soßen und zur Herstellung von Tomatenmark. Die länglich ovalen roten Früchte haben einen
  geringen Wasseranteil und festes Fruchtfleisch. Der Geschmack ist legendär fruchtig-aromatisch. Die
  krankheitstolerante Tomatensorte zeichnet sich besonders durch einen äußerst robusten Wuchs und Ernteertrag
  aus.&nbsp;<br>Die San Marzano ist eine Sorte die 1991 endgültig aus dem offiziellen Sortenkatalog gestrichen wurde,
  abgelöst von resistenteren und pflegeleichteren Sorten. Dank einer Initiative der Region Kampanien, blieb die
  Feinschmecker Sorte in Hausgärten erhalten und kann heute weiter verbreitet werden.<br>
</p>
<p>
  <span style="background-color: rgb(228, 204, 153);">
    <strong>
      <span style="color: #000000;">&nbsp;</span>
    </strong>
    <strong>
      <span style="color: #000000;">
        <u>Allgemeine
        Informationen</u>
      </span>
    </strong>
    <strong>
      <span style="color: #000000;">&nbsp;</span>
    </strong>
  </span>
  <br>
    <strong>Pflanzenfamilie:</strong>
    <span>Solanaceae</span>
    <br>
      <strong>Lebenszyklus:</strong>
      Mehrjährig<br>
      <strong>Tage bis zur Ernte:</strong>
      150
      Tage<br>
      <strong>Pflanzenhöhe ca.:</strong>
      180 cm<br>
      <strong>Wurzeltyp:</strong>
      <span>Tief- und
      flachwurzler</span>
      <br>
        <strong>Nährstoffbedarf:</strong>
        Starkzehrer<br>
        <strong>Wasserbedarf:</strong>
        Hoch<br>
        <strong>Winterhärte:</strong>
        bis 3°C<br>
        <strong>Standort:</strong>
        Sonnig<br>
        <strong>Boden:
      </strong>
      Durchlässiger, humusreicher Lehmboden<strong>
      <br>
        <br>pH-Wert:</strong>
        6 bis 7<strong>
        <br>
          <br>
          </strong>
          <span style="background-color: rgb(228, 204, 153);">
            <strong>&nbsp;</strong>
            <strong>
              <u>Informationen zur Aussaat und
              Pflanzung</u>
            </strong>
            <strong>&nbsp;</strong>
          </span>
          <strong>
            <br>Keimtyp:</strong>
            Dunkelkeimer<strong>
            <br>Saattiefe:</strong>
            1<span>&nbsp;cm</span>
            <strong>
              <br>Optimale Keimtemperatur:</strong>
              22-28°C<strong>
              <br>Keimzeit:</strong>
              5-10 Tage<strong>
              <br>Pflanz-, Reihenabstand:</strong>
              50x70 cm</p>
              <p>
                <strong>Keimfähigkeit der Samen:</strong>
                8-9 Jahre</p>
                <p>
                  <span style="background-color: rgb(228, 204, 153);">
                    <strong>&nbsp;</strong>
                    <strong>
                      <u>Mischkultur</u>
                    </strong>
                    <strong>&nbsp;</strong>
                  </span>
                  <br>
                    <strong>Optimale
                    Mischkultur:</strong>
                    <span>Basilikum, Kapuzinerkresse, Knoblauch, Zwiebel, Kohl, Neuseeländischer Spinat, Spinat,
                    Petersilie, Rettich, Sellerie, Rettich, Ringelblume, Salat</span>
                    <br>
                      <strong>Ungünstige Mischkultur:</strong>
                      <span>Paprika, Aubergine, Physalis, Kartoffel</span>
                    </p>
                    <p>
                      <span style="background-color: rgb(228, 204, 153);">
                        <strong>&nbsp;</strong>
                        <strong>
                          <u>Aussaat nach
                          Klimazone</u>
                        </strong>
                        <strong>&nbsp;</strong>
                      </span>
                      <br>
                        <strong>Subtropen Klima (Mediterran) (z. B. Portugal,
                        Spanien, Italien)</strong>
                        <br>Empfehlenswert ist die Vorkultivierung <span>von Januar bis April. Der Standort der
                        Pflanzen ist idealerweise warm und sonnig.&nbsp;</span>
                        <br>
                          <strong>Gemäßigtes Klima (z. B. Deutschland, Schweiz,
                          Polen)</strong>
                          <br>Empfehlenswert ist eine Vorkultivierung <span>von März bis Mai. Der Standort der Pflanzen ist
                          idealerweise warm und sonnig.&nbsp;</span>
                        </p>
                        <p>
                          <span style="background-color: rgb(228, 204, 153);">
                            <strong>&nbsp;</strong>
                            <strong>
                              <u>Allgemeine
                              Empfehlungen</u>
                            </strong>
                            <strong>&nbsp;</strong>
                          </span>
                          <br>Der optimale Zeitpunkt zum Keimen von Tomaten ist die
                          erste warme Sommerwoche im Frühling. Nachdem die Samen bei warmen Temperaturen gekeimt sind, brauchen die Sämlinge
                          kühlere Temperaturen. Bei der Vorkultur säe die Samen in eine kleine Schale und lasse die Sämlinge bis zu den ersten
                          sichtbaren Tomatenblättern heranwachsen, danach in gewünschte Behälter pikieren. Die Sämlinge nach dem pikieren bei
                          gemäßigten Temperaturen wachsen lassen, bis sie als Setzlinge ausgepflanzt werden. Das pflanzen der Setzlinge ins Beet
                          erfolgt ab dem 2. Blattpaar nach den Keimblättern. Bevorzugt einen durchlässigen, sehr nährstoffreichen, gleichmäßig
                          feuchten und humusreichen Lehmboden.<br>
                          <strong>Die Fleischtomate 'San Marzano' verträgt keine
                          Staunässe.</strong>
                          <br>
                            <br>
                              <span style="background-color: rgb(228, 204, 153);">
                                <strong>&nbsp;</strong>
                                <strong>
                                  <u>Zusätzliche
                                  Tipps</u>
                                </strong>
                                <strong>&nbsp;</strong>
                              </span>
                              <br>
                                <span>Fleischtomatenpflanzen werden generell mit 1 oder 2 Trieben
                                kultiviert. Empfehlenswert ist ein Gerüst zum anbinden der Tomatentriebe mit Tomatenhaken. Um das Wurzelwachstum und
                                somit das Pflanzenwachstum der Pflanzen anzuregen, werden die Sämlinge beim pikieren tiefer in die Erde gesetzt, bis
                                zur Blattachse der Keimblätter. Eine ausreichende und gleichmäßige Bewässerung wirkt sich positiv auf die
                                Fruchtqualität aus. Bei Temperaturen unter 5°C reduziert die Pflanze ihr Wachstum. Eine regelmäßige Ernte fördert
                                den Ertrag. </span>
                                Um zügig einen feinen, krümeligen und durchlässigen Boden mit guter Nährstoff- und
                                Wasserspeicherfähigkeit zu erhalten, empfiehlt sich eine zusätzliche Einarbeitung von Pflanzenkohle und
                                Urgesteinsmehl.<br>
                                <br>
                                  <span style="background-color: rgb(228, 204, 153);">
                                    <strong>&nbsp;</strong>
                                    <strong>
                                      <u>Vermehrungsart</u>
                                    </strong>
                                    <strong>&nbsp;</strong>
                                  </span>
                                  <br>Die
                                  Vermehrung erfolgt über Samen und Stecklinge.<br>
                                  <br>
                                    <span style="background-color: rgb(228, 204, 153);">
                                      <strong>&nbsp;</strong>
                                      <strong>
                                        <u>Pflanzen
                                        Pflege</u>
                                      </strong>
                                      <strong>&nbsp;</strong>
                                    </span>
                                    <br>Ein gelockerter nährstoffreicher und konstant feuchter Boden ist
                                    grundlegend wichtig für das Wachstum und eine qualitative Fruchtbildung. <span>Eine Düngung ist je nach Beschaffenheit
                                    des Bodens nach 10 Wochen empfehlenswert.</span>
                                  </p>
                                  <p>
                                    <span style="background-color: rgb(228, 204, 153);">
                                      <strong>&nbsp;</strong>
                                      <strong>
                                        <u>Andere
                                        Namen</u>
                                      </strong>
                                      <strong>&nbsp;</strong>
                                    </span>
                                    <br>
                                      <strong>Botanische Namen:</strong>
                                      <span>Solanum
                                      lycopersicum</span>
                                      <br>
                                        <strong>Englische Namen:</strong>
                                        Beef tomato, Meat tomato<br>
                                        <strong>Deutsche
                                        Namen:</strong>
                                        <span>Fleischtomate, Flaschentomate</span>
                                        <br>
                                          <strong>Portugiesische Namen:</strong>
                                          <span>Tomate&nbsp;</span>
                                          <br>
                                            <strong>Spanische Namen:</strong>
                                            Tomate&nbsp;<br>
                                            <strong>Französische Namen:</strong>
                                            Tomate</p>
                                            <p>
                                              <span style="color: rgb(31, 33, 36); background-color: rgb(228, 204, 153);">
                                                <strong>&nbsp;</strong>
                                                <strong>
                                                  <u>Herkunft</u>
                                                  &nbsp;</strong>
                                                </span>
                                                <br>
                                                  <strong>Land:</strong>
                                                  Portugal<span>
                                                </span>
                                                <span>
                                                </span>
                                                <span>
                                                </span>
                                                <span>
                                                </span>
                                                <span>
                                                </span>
                                                <span>
                                                </span>
                                                <span>
                                                </span>
                                                <span>
                                                </span>
                                                <span>
                                                </span>
                                              </p>
                                            </tc>`;
  
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
