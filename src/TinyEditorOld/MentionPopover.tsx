import React, { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
import { Popover, ActionList, TextField, EmptySearchResult, Spinner, TextContainer } from '@shopify/polaris';

interface MentionPopoverProps {
  variables: string[];
  onSelect: (variable: string) => void;
  onClose: () => void;
}

export const MentionPopover: React.FC<MentionPopoverProps> = memo(({
  variables,
  onSelect,
  onClose,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [filteredVariables, setFilteredVariables] = useState<string[]>(variables);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activatorRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<number | null>(null);
  
  // Always show the popover
  const [popoverActive, setPopoverActive] = useState(true);

  // Handle clicks on the popover to prevent propagation
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      e.stopPropagation();
    };

    const containerEl = containerRef.current;
    if (containerEl) {
      containerEl.addEventListener('mousedown', handler);
      containerEl.addEventListener('click', handler);
    }

    return () => {
      if (containerEl) {
        containerEl.removeEventListener('mousedown', handler);
        containerEl.removeEventListener('click', handler);
      }
    };
  }, []);

  // Filter variables based on search input - with proper cleanup
  useEffect(() => {
    setIsLoading(true);
    
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = window.setTimeout(() => {
      const filtered = variables.filter(variable => 
        variable.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredVariables(filtered);
      setIsLoading(false);
      searchTimeoutRef.current = null;
    }, 100); // Small delay for better UX

    // Cleanup on unmount or when searchValue/variables change
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchValue, variables]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleSelectVariable = useCallback((variable: string) => {
    // Log để debug
    console.log('Variable selected, inserting at current cursor position:', variable);
    
    // Delay 1 tick để React hoàn thành xử lý sự kiện
    setTimeout(() => {
      onSelect(variable);
    }, 0);
  }, [onSelect]);

  const handleClose = useCallback(() => {
    setPopoverActive(false);
    onClose();
  }, [onClose]);

  // Create the popover content - memoized to prevent recreation
  const popoverContent = useMemo(() => (
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
  ), [searchValue, isLoading, filteredVariables, handleSearchChange, handleSelectVariable]);

  // Memoize the activator element
  const activator = useMemo(() => (
    <div
      ref={activatorRef}
      id="mention-popover-activator-wrapper"
      style={{ position: 'absolute', visibility: 'hidden' }}
    />
  ), []);

  return (
    <>
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
    </>
  );
});

// Add displayName for better debugging
MentionPopover.displayName = 'MentionPopover';

export default MentionPopover; 