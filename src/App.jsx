import "./App.css";
import LiquidCodeEditor from "./Editor";

function App() {
  const variables = [
    { name: 'product.title', description: 'The title of the product' },
    { name: 'product.description', description: 'The description of the product' },
    { name: 'product.price', description: 'The price of the product' },
    { name: 'product.available', description: 'Whether the product is available' },
  ];
  return <LiquidCodeEditor variables={variables} />;
}

export default App;
