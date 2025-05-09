import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { SuggestionItemVariant, SuggestionListVariant } from './styled';
import { Text } from '@shopify/polaris';

export interface LiquidVariable {
  id: string;
  name: string;
  description?: string;
}

interface LiquidVariablesListProps {
  items: LiquidVariable[];
  command: (item: LiquidVariable) => void;
}

export const LiquidVariablesList = forwardRef<{ onKeyDown: (event: KeyboardEvent) => boolean }, LiquidVariablesListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];

    if (item) {
      props.command(item);
    }
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
    return true;
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
    return true;
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
    return true;
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') {
        return upHandler();
      }

      if (event.key === 'ArrowDown') {
        return downHandler();
      }

      if (event.key === 'Enter') {
        return enterHandler();
      }

      return false;
    },
  }));

  return props.items.length ? (
    <SuggestionListVariant>
      {props.items.map((item, index) => (
        <SuggestionItemVariant active={index === selectedIndex} key={item.id} onClick={() => selectItem(index)}>
          <Text as="p" variant="bodySm" truncate>
            {item.name}
          </Text>
        </SuggestionItemVariant>
      ))}
    </SuggestionListVariant>
  ) : null;
});

LiquidVariablesList.displayName = 'LiquidVariablesList';

export default LiquidVariablesList;
