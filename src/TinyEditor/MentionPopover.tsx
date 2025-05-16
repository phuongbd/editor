import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Popover, ActionList, TextField, EmptySearchResult, Spinner, TextContainer } from '@shopify/polaris';

interface MentionPopoverProps {
  variables: string[];
  onSelect: (variable: string) => void;
  onClose: () => void;
}

export const MentionPopover: React.FC<MentionPopoverProps> = ({
  variables,
  onSelect,
  onClose,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [filteredVariables, setFilteredVariables] = useState<string[]>(variables);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Always show the popover
  const [popoverActive, setPopoverActive] = useState(true);

  // Handle clicks on the popover to prevent propagation
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      e.stopPropagation();
    };

    if (containerRef.current) {
      containerRef.current.addEventListener('mousedown', handler);
      containerRef.current.addEventListener('click', handler);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousedown', handler);
        containerRef.current.removeEventListener('click', handler);
      }
    };
  }, []);

  // Filter variables based on search input
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const filtered = variables.filter(variable => 
        variable.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredVariables(filtered);
      setIsLoading(false);
    }, 100); // Small delay for better UX

    return () => clearTimeout(timer);
  }, [searchValue, variables]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleSelectVariable = useCallback((variable: string) => {
    onSelect(variable);
  }, [onSelect]);

  const handleClose = useCallback(() => {
    setPopoverActive(false);
    onClose();
  }, [onClose]);

  // We need to create a React element as activator, not use the DOM element directly
  // Create a custom activator component
  const CustomActivator = useCallback(() => {
    // Find the element that was created by the Portal
    const activatorElement = document.getElementById('mention-popover-activator');
    // Return an empty div if the element isn't found
    return <div id="mention-popover-activator-wrapper" />;
  }, []);

  // Create the popover content
  const popoverContent = (
    <div
      ref={containerRef}
      style={{ 
        width: '300px',
        maxHeight: '400px',
        padding: '12px'
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ marginBottom: '12px' }}>
        <TextField
          label=""
          value={searchValue}
          onChange={handleSearchChange}
          autoComplete="off"
          placeholder="Search liquid variables..."
          autoFocus
        />
      </div>
      
      <div style={{ 
        maxHeight: '300px', 
        overflowY: 'auto'
      }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
            <Spinner size="small" />
          </div>
        ) : filteredVariables.length > 0 ? (
          <ActionList
            items={filteredVariables.map(variable => ({
              content: variable,
              onAction: () => handleSelectVariable(variable),
            }))}
          />
        ) : (
          <EmptySearchResult
            title="No matching variables found"
            description="Try changing your search term"
          />
        )}
      </div>
    </div>
  );

  // Use a reference to an activator element that will be positioned 
  // correctly by the PortalActivator in MentionPopoverRenderer
  const activatorRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* This is a hidden div that serves as the activator */}
      <div
        ref={activatorRef}
        id="mention-popover-activator-wrapper"
        style={{ position: 'absolute', visibility: 'hidden' }}
      />
      
      <Popover
        active={popoverActive}
        activator={activatorRef.current || <div></div>}
        onClose={handleClose}
        preferredPosition="below"
        preferredAlignment="left"
        fullWidth={false}
        preventCloseOnChildOverlayClick
        autofocusTarget="first-node"
      >
        {popoverContent}
      </Popover>
    </>
  );
};

export default MentionPopover; 