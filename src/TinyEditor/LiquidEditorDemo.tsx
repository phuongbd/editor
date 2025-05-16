import React, { useState } from 'react';
import TinyEditor from './index';
import './liquidStyles.css';
import './mentionStyles.css';

const INITIAL_CONTENT = `
<h2>Liquid Syntax Demo</h2>

<p>This editor highlights Liquid variables and hides Liquid tags:</p>

<ul>
  <li>Liquid variables like {{ customer.name }} are highlighted</li>
  <li>Liquid tags like {% if customer.name %} are hidden</li>
</ul>

<p>Try editing this content with liquid syntax:</p>

<p>Hello {{ customer.first_name }} {{ customer.last_name }}!</p>

<p>Your account balance is {{ customer.account_balance | money_format }}</p>

<div>
  {% if customer.orders.size > 0 %}
    <p>Thanks for your orders!</p>
  {% else %}
    <p>Make your first purchase today!</p>
  {% endif %}
</div>
`;

const LiquidEditorDemo: React.FC = () => {
  const [content, setContent] = useState(INITIAL_CONTENT);

  const handleChange = (newContent: string) => {
    setContent(newContent);
  };

  return (
    <div className="liquid-editor-demo">
      <h1>Liquid Syntax Editor</h1>
      
      <div className="editor-container">
        <TinyEditor 
          initialValue={content}
          onChange={handleChange}
          liquidSupport={true}
          mentionSupport={true}
          height={400}
        />
      </div>
      
      <div className="output-preview">
        <h3>HTML Output:</h3>
        <pre>{content}</pre>
      </div>
      
      <div className="instructions">
        <h3>Instructions:</h3>
        <ul>
          <li>Liquid variables <code>{'{{ variable_name }}'}</code> are highlighted in blue</li>
          <li>Liquid tags <code>{'{% tag_name %}'}</code> are hidden from view</li>
          <li>Try editing the content to add your own variables and tags</li>
          <li>Notice that when you click on a variable, the entire variable is selected</li>
          <li>Try deleting a variable with backspace or delete key</li>
          <li>Type <code>{'{{'}</code> to trigger the mention popover with a list of available Liquid variables</li>
        </ul>
      </div>
    </div>
  );
};

export default LiquidEditorDemo; 