import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Popover, ActionList, TextField, EmptySearchResult, Spinner } from '@shopify/polaris';

interface Position {
  top: number;
  left: number;
}

interface PortalPopoverProps {
  position: Position;
  variables: string[];
  onSelect: (variable: string) => void;
  onClose: () => void;
}

export const PortalPopover: React.FC<PortalPopoverProps> = ({
  position,
  variables,
  onSelect,
  onClose,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [filteredVariables, setFilteredVariables] = useState<string[]>(variables);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activatorRef = useRef<HTMLDivElement>(null);
  
  // Always show the popover
  const [popoverActive, setPopoverActive] = useState(true);

  // Position the activator element at the cursor position
  useEffect(() => {
    if (activatorRef.current) {
      activatorRef.current.style.top = `${position.top}px`;
      activatorRef.current.style.left = `${position.left}px`;
    }
  }, [position]);

  // Prevent clicks from propagating to document (which would close the popover)
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      e.stopPropagation();
    };

    if (containerRef.current) {
      containerRef.current.addEventListener('mousedown', handler);
      containerRef.current.addEventListener('touchstart', handler);
      containerRef.current.addEventListener('click', handler);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousedown', handler);
        containerRef.current.removeEventListener('touchstart', handler);
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

  // Custom activator that is positioned at the cursor
  const activator = (
    <div 
      ref={activatorRef}
      style={{ 
        position: 'absolute',
        top: position.top,
        left: position.left,
        width: '1px',
        height: '1px',
        padding: 0
      }}
    />
  );

  // Create the popover content
  const popoverContent = (
    <div
      ref={containerRef}
      style={{ 
        width: '300px',
        maxHeight: '400px',
        padding: '12px'
      }}
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

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      {activator}
      <Popover
        active={popoverActive}
        activator={activator}
        onClose={handleClose}
        preferredPosition="below"
        preferredAlignment="left"
        fullWidth={false}
        preventCloseOnChildOverlayClick
        autofocusTarget="first-node"
      >
        {popoverContent}
      </Popover>
    </div>
  );
};

export default PortalPopover; 