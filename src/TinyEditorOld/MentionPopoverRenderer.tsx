import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import { PortalPopover } from './PortalPopover';

/**
 * Renders the MentionPopover component in the provided container
 * 
 * @param container DOM element to render the popover in
 * @param activatorElement DOM element to use as the activator for the Polaris Popover
 * @param variables list of liquid variables to display
 * @param onSelect callback when a variable is selected
 * @param onClose callback when the popover is closed
 */
export const renderMentionPopover = (
  container: HTMLElement,
  activatorElement: HTMLElement,
  variables: string[],
  onSelect: (variable: string) => void,
  onClose: () => void
): void => {
  const root = createRoot(container);
  
  // Get the position of the activator for correct popover positioning
  const activatorRect = activatorElement.getBoundingClientRect();
  
  root.render(
    <AppProvider i18n={enTranslations}>
      <PortalPopover
        position={{ top: activatorRect.top, left: activatorRect.left }}
        variables={variables}
        onSelect={(variable: string) => { // Fixed the TypeScript error
          root.unmount();
          onSelect(variable);
        }}
        onClose={() => {
          root.unmount();
          onClose();
        }}
      />
    </AppProvider>
  );
}; 