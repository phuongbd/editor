import React, { useState, useRef, useEffect } from "react";
import { ButtonGroup, Button, Icon, Divider } from "@shopify/polaris";
import {
  TextBoldIcon,
  TextItalicIcon,
  CodeIcon,
  TextFontIcon,
  ListBulletedIcon,
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
  ViewIcon,
  HideIcon,
} from "@shopify/polaris-icons";

// components/ToolbarButton.jsx
const ToolbarButton = ({ icon, onClick, title }) => {
  return (
    <button
      onClick={onClick}
      className="p-1.5 mx-1 rounded hover:bg-gray-200"
      title={title}
    >
      {icon}
    </button>
  );
};

// hooks/useEditorState.js
const useEditorState = (initialContent) => {
  const [content, setContent] = useState(initialContent);
  const [previewMode, setPreviewMode] = useState(false);
  const rawContentRef = useRef(content);
  const editorRef = useRef(null);
  const wasInWysiwygMode = useRef(false);
  const initialRender = useRef(true);

  return {
    content,
    setContent,
    previewMode,
    setPreviewMode,
    rawContentRef,
    editorRef,
    wasInWysiwygMode,
    initialRender,
  };
};

// hooks/useVariablePopover.js
const useVariablePopover = (variables) => {
  const [showVariablePopover, setShowVariablePopover] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [filteredVariables, setFilteredVariables] = useState(variables);
  const [searchTerm, setSearchTerm] = useState("");
  const [savedRange, setSavedRange] = useState(null);
  const popoverRef = useRef(null);

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term) {
      const filtered = variables.filter(
        (variable) =>
          variable.name.toLowerCase().includes(term.toLowerCase()) ||
          (variable.description || "")
            .toLowerCase()
            .includes(term.toLowerCase())
      );
      setFilteredVariables(filtered);
    } else {
      setFilteredVariables(variables);
    }
  };

  useEffect(() => {
    setFilteredVariables(variables);
  }, [variables]);

  return {
    showVariablePopover,
    setShowVariablePopover,
    popoverPosition,
    setPopoverPosition,
    filteredVariables,
    searchTerm,
    handleSearch,
    savedRange,
    setSavedRange,
    popoverRef,
  };
};

// utils/contentProcessing.js
const processContent = (rawContent) => {
  const parts = rawContent.split(/({{[^}]+}}|{%[^%]+%})/g);
  return parts
    .map((part) => {
      if (part.startsWith("{{") && part.endsWith("}}")) {
        return `<span class="highlight-liquid">${part}</span>`;
      }
      if (part.startsWith("{%") && part.endsWith("%}")) {
        return `<span class="highlight-liquid-tag preview-hide">${part}</span>`;
      }
      return part;
    })
    .join("");
};

const cleanHighlightTags = (htmlContent) => {
  // Clean all types of highlight spans and their content
  let cleaned = htmlContent;
  
  // Clean spans with style attributes that contain liquid tags
  cleaned = cleaned.replace(/<span[^>]*style="[^"]*"[^>]*>({{[^}]+}}|{%[^%]+%})<\/span>/g, "$1");
  
  // Clean spans with both classes (highlight-liquid-tag and preview-hide)
  cleaned = cleaned.replace(/<span[^>]*class="[^"]*highlight-liquid-tag[^"]*preview-hide[^"]*"[^>]*>(.*?)<\/span>/g, "$1");
  
  // Clean highlight-liquid spans
  cleaned = cleaned.replace(/<span[^>]*class="[^"]*highlight-liquid[^"]*"[^>]*>(.*?)<\/span>/g, "$1");
  
  // Clean any remaining highlight-liquid-tag spans
  cleaned = cleaned.replace(/<span[^>]*class="[^"]*highlight-liquid-tag[^"]*"[^>]*>(.*?)<\/span>/g, "$1");
  
  return cleaned;
};

// components/Toolbar.jsx
const Toolbar = ({ onToolbarAction, previewMode, onTogglePreview }) => {
  return (
    <div className="flex items-center justify-start gap-x-3 p-2 border-b bg-surface">
      <Button
        icon={<Icon source={TextBoldIcon} />}
        onClick={() => onToolbarAction("bold")}
        tooltip="Bold"
        size="slim"
      />
      <Button
        icon={<Icon source={TextItalicIcon} />}
        onClick={() => onToolbarAction("italic")}
        tooltip="Italic"
        size="slim"
      />
      <Button
        icon={<Icon source={CodeIcon} />}
        onClick={() => onToolbarAction("code")}
        tooltip="Code"
        size="slim"
      />

      <Button
        icon={<Icon source={TextFontIcon} />}
        onClick={() => onToolbarAction("h1")}
        tooltip="Heading 1"
        size="slim"
      />
      <Button
        icon={<Icon source={TextFontIcon} />}
        onClick={() => onToolbarAction("h2")}
        tooltip="Heading 2"
        size="slim"
      />
      <Button
        icon={<Icon source={TextFontIcon} />}
        onClick={() => onToolbarAction("h3")}
        tooltip="Heading 3"
        size="slim"
      />

      <Button
        icon={<Icon source={ListBulletedIcon} />}
        onClick={() => onToolbarAction("ul")}
        tooltip="Unordered List"
        size="slim"
      />
      <Button
        icon={<Icon source={ListBulletedIcon} />}
        onClick={() => onToolbarAction("ol")}
        tooltip="Ordered List"
        size="slim"
      />

      <Button
        icon={<Icon source={TextAlignLeftIcon} />}
        onClick={() => onToolbarAction("align-left")}
        tooltip="Align Left"
        size="slim"
      />
      <Button
        icon={<Icon source={TextAlignCenterIcon} />}
        onClick={() => onToolbarAction("align-center")}
        tooltip="Align Center"
        size="slim"
      />
      <Button
        icon={<Icon source={TextAlignRightIcon} />}
        onClick={() => onToolbarAction("align-right")}
        tooltip="Align Right"
        size="slim"
      />

      <Button
        icon={<Icon source={previewMode ? HideIcon : ViewIcon} />}
        onClick={onTogglePreview}
        pressed={previewMode}
        tooltip="Toggle Edit/Preview"
        size="slim"
      />
    </div>
  );
};

// components/VariablePopover.jsx
const VariablePopover = ({
  show,
  position,
  searchTerm,
  onSearchChange,
  filteredVariables,
  onVariableSelect,
  popoverRef,
}) => {
  if (!show) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute bg-white border rounded-lg shadow-lg p-2 z-50 max-h-60 w-64"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translateY(-100%)",
      }}
    >
      <div className="sticky top-0 bg-white p-2 border-b">
        <input
          type="text"
          placeholder="Search variables..."
          className="w-full px-2 py-1 border border-gray-300 text-black rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={searchTerm}
          onChange={onSearchChange}
        />
      </div>
      <div className="overflow-y-auto max-h-48">
        {filteredVariables.length > 0 ? (
          filteredVariables.map((variable, index) => (
            <div
              key={index}
              className="p-2 hover:bg-blue-50 cursor-pointer flex flex-col"
              onClick={() => onVariableSelect(variable)}
            >
              <span className="font-medium text-blue-600">{variable.name}</span>
            </div>
          ))
        ) : (
          <div className="p-2 text-gray-500 text-center">
            No variables found
          </div>
        )}
      </div>
    </div>
  );
};

// Main component
const LiquidCodeEditor = ({ variables = [], value = "" }) => {
  const [filteredVariables, setFilteredVariables] = useState(variables);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    content,
    setContent,
    previewMode,
    setPreviewMode,
    rawContentRef,
    editorRef,
    wasInWysiwygMode,
    initialRender,
  } = useEditorState(value);

  const {
    showVariablePopover,
    setShowVariablePopover,
    popoverPosition,
    setPopoverPosition,
    savedRange,
    setSavedRange,
    popoverRef,
  } = useVariablePopover(variables);

  // Update filtered variables when search term changes
  useEffect(() => {
    if (searchTerm) {
      const filtered = variables.filter(
        (variable) =>
          variable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (variable.description || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
      setFilteredVariables(filtered);
    } else {
      setFilteredVariables(variables);
    }
  }, [searchTerm, variables]);

  // Update filtered variables when variables prop changes
  useEffect(() => {
    setFilteredVariables(variables);
  }, [variables]);

  // Handle key press for variable suggestions and deletion
  const handleKeyDown = (e) => {
    if (e.key === "{") {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const range = selection.getRangeAt(0);
      // Save the current range for later use
      setSavedRange(range.cloneRange());

      const rect = range.getBoundingClientRect();
      const editorRect = editorRef.current.getBoundingClientRect();

      // Calculate position relative to editor
      const x = rect.left - editorRect.left + editorRef.current.scrollLeft;
      const y = rect.top - editorRect.top + editorRef.current.scrollTop;

      // Position popover above the cursor with a small offset
      setPopoverPosition({
        x,
        y: Math.max(0, y - 10),
      });

      setFilteredVariables(variables);
      setShowVariablePopover(true);
      e.preventDefault();
      return;
    }

    if (e.key === "Backspace" && editorRef.current) {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const range = selection.getRangeAt(0);
      if (!range.collapsed) return; // Only handle when cursor is at a single point

      // Get the current node and its parent
      const currentNode = range.startContainer;
      const parentNode = currentNode.parentNode;

      // Case 1: Cursor is at the start of a text node right after a highlight-liquid span
      if (currentNode.nodeType === Node.TEXT_NODE && range.startOffset === 0) {
        const previousSibling = currentNode.previousSibling;
        if (
          previousSibling &&
          previousSibling.classList?.contains("highlight-liquid")
        ) {
          e.preventDefault();
          previousSibling.remove();

          // Update content without reapplying highlight
          const newContent = editorRef.current.innerHTML;
          setContent(newContent);
          rawContentRef.current = newContent;
          return;
        }
      }

      // Case 2: Cursor is at the end of or inside a highlight-liquid span
      if (parentNode.classList?.contains("highlight-liquid")) {
        e.preventDefault();
        const cursorAtEnd = range.startOffset === parentNode.textContent.length;

        if (cursorAtEnd) {
          // If cursor is at the end, move it before deleting
          range.setStartBefore(parentNode);
          range.setEndBefore(parentNode);
          selection.removeAllRanges();
          selection.addRange(range);
        }

        parentNode.remove();

        // Update content without reapplying highlight
        const newContent = editorRef.current.innerHTML;
        setContent(newContent);
        rawContentRef.current = newContent;
        return;
      }

      // Case 3: Cursor is right after a highlight-liquid span
      const previousElement = parentNode.previousElementSibling;
      if (
        previousElement?.classList?.contains("highlight-liquid") &&
        range.startOffset === 0
      ) {
        e.preventDefault();
        previousElement.remove();

        // Update content without reapplying highlight
        const newContent = editorRef.current.innerHTML;
        setContent(newContent);
        rawContentRef.current = newContent;
      }
    }

    // Close popover on Escape
    if (e.key === "Escape") {
      setShowVariablePopover(false);
    }
  };

  // Handle toolbar actions
  const handleToolbarAction = (action) => {
    // Get current selection from the active editor
    let activeEditor;
    let start, end, selectedText;

    if (previewMode) {
      activeEditor = document.getElementById("wysiwyg-editor");
      // For contentEditable, we need to use window.getSelection()
      const selection = window.getSelection();
      // This is a simplification - real-world implementation would need more handling
      selectedText = selection.toString();
    } else {
      activeEditor = document.getElementById("editor-textarea");
      start = activeEditor.selectionStart;
      end = activeEditor.selectionEnd;
      selectedText = activeEditor.value.substring(start, end);
    }

    let newText;

    switch (action) {
      case "bold":
        newText = `<strong>${selectedText}</strong>`;
        break;
      case "italic":
        newText = `<em>${selectedText}</em>`;
        break;
      case "code":
        newText = `<code>${selectedText}</code>`;
        break;
      case "ul":
        newText = `<ul>\n  <li>${selectedText}</li>\n</ul>`;
        break;
      case "ol":
        newText = `<ol>\n  <li>${selectedText}</li>\n</ol>`;
        break;
      case "h1":
        newText = `<h1>${selectedText}</h1>`;
        break;
      case "h2":
        newText = `<h2>${selectedText}</h2>`;
        break;
      case "h3":
        newText = `<h3>${selectedText}</h3>`;
        break;

      case "align-left":
        newText = `<div style="text-align: left">${selectedText}</div>`;
        break;
      case "align-center":
        newText = `<div style="text-align: center">${selectedText}</div>`;
        break;
      case "align-right":
        newText = `<div style="text-align: right">${selectedText}</div>`;
        break;
      default:
        return;
    }

    // Insert the new text based on the active editor
    if (previewMode) {
      // WYSIWYG mode - insert HTML directly at cursor
      document.execCommand("insertHTML", false, newText);
    } else {
      // Raw text mode - update the text value
      const originalText = previewMode
        ? activeEditor.value
        : rawContentRef.current;
      const newContent =
        originalText.substring(0, start) +
        newText +
        originalText.substring(end);
      setContent(newContent);
      rawContentRef.current = newContent;
    }
  };

  const cleanContent = (htmlContent) => {
    // First clean highlight spans
    let cleaned = cleanHighlightTags(htmlContent);

    // Remove empty/unnecessary spans
    cleaned = cleaned.replace(/<span[^>]*>\s*<\/span>/g, "");

    // Remove multiple spaces while preserving newlines
    cleaned = cleaned.replace(/[^\S\n]+/g, " ");

    // Remove spaces before/after HTML tags while preserving newlines
    cleaned = cleaned.replace(/\s*(<[^>]+>)\s*/g, "$1");

    // Remove unnecessary &nbsp;
    cleaned = cleaned.replace(/&nbsp;/g, " ");

    // Clean up multiple newlines
    cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

    return cleaned;
  };

  const togglePreviewMode = () => {
    if (previewMode) {
      // Switching to code mode
      let cleanedContent;
      if (editorRef.current) {
        // Clean from editor's innerHTML if available
        cleanedContent = cleanHighlightTags(editorRef.current.innerHTML);
      } else {
        // Fallback to rawContentRef if editor not available
        cleanedContent = cleanHighlightTags(rawContentRef.current);
      }
      // Clean other HTML formatting
      cleanedContent = cleanContent(cleanedContent);
      setContent(cleanedContent);
      rawContentRef.current = cleanedContent;
    } else {
      // Switching to preview mode
      const cleanedContent = cleanContent(content);
      setContent(cleanedContent);
      rawContentRef.current = cleanedContent;
    }
    setPreviewMode(!previewMode);
  };

  // Handle content changes in WYSIWYG mode
  const handleWysiwygChange = () => {
    if (!editorRef.current) return;

    // Get current selection
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const container = range.startContainer;
    const parentNode = container.parentNode;

    // Check if we're inside a highlight-liquid span
    if (parentNode.classList?.contains("highlight-liquid")) {
      // Get the text content
      const text = parentNode.textContent;
      const liquidMatch = text.match(/{{\s*[\w.]+\s*}}/);

      if (liquidMatch) {
        // If there's text after the liquid variable
        if (text.length > liquidMatch[0].length) {
          // Get the text after the liquid variable
          const afterText = text.substring(liquidMatch[0].length);

          // Create a new text node for the content after the liquid variable
          const textNode = document.createTextNode(afterText);

          // Update the highlight span to only contain the liquid variable
          parentNode.textContent = liquidMatch[0];

          // Insert the text node after the highlight span
          if (parentNode.nextSibling) {
            parentNode.parentNode.insertBefore(
              textNode,
              parentNode.nextSibling
            );
          } else {
            parentNode.parentNode.appendChild(textNode);
          }

          // Move cursor to the end of the new text
          range.setStart(textNode, afterText.length);
          range.setEnd(textNode, afterText.length);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }

    // Get all liquid control flow tags from rawContentRef
    const liquidTags = rawContentRef.current.match(/{%[^%]+%}/g) || [];
    
    // Get current content without liquid tags
    const currentContent = editorRef.current.innerHTML;
    
    // Create a map of text positions to liquid tags
    const tagPositions = new Map();
    let lastIndex = 0;
    let plainText = currentContent.replace(/<[^>]+>/g, ''); // Remove HTML tags
    
    liquidTags.forEach(tag => {
      // Find appropriate position for the tag
      const beforeTag = tag.match(/{%\s*(if|unless|case|for|capture)/);
      const afterTag = tag.match(/{%\s*(endif|endunless|endcase|endfor|endcapture)/);
      
      if (beforeTag) {
        // For opening tags, insert at the next line break or current position
        const nextBreak = plainText.indexOf('\n', lastIndex);
        const position = nextBreak > -1 ? nextBreak : lastIndex;
        tagPositions.set(position, tag);
        lastIndex = position + 1;
      } else if (afterTag) {
        // For closing tags, insert at the previous line break or current position
        const prevBreak = plainText.lastIndexOf('\n', lastIndex);
        const position = prevBreak > -1 ? prevBreak : lastIndex;
        tagPositions.set(position, tag);
        lastIndex = position + 1;
      }
    });

    // Update rawContentRef with the current content and preserved liquid tags
    let newContent = '';
    let currentPos = 0;
    
    Array.from(tagPositions.entries())
      .sort(([a], [b]) => a - b)
      .forEach(([position, tag]) => {
        newContent += currentContent.slice(currentPos, position) + tag;
        currentPos = position;
      });
    
    newContent += currentContent.slice(currentPos);
    
    // Update content state
    setContent(currentContent);
    rawContentRef.current = newContent;
  };

  // Insert variable at cursor position
  const insertVariable = (variable) => {
    if (!editorRef.current) return;

    // Focus the editor
    editorRef.current.focus();

    // Restore the saved range if it exists
    if (savedRange) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedRange);
    }

    const variableText = `{{ ${variable.name} }}`;
    
    // Create a temporary container
    const tempContainer = document.createElement('div');
    
    // Create the highlight span
    const span = document.createElement('span');
    span.className = 'highlight-liquid';
    span.textContent = variableText;
    
    // Create a text node for the space
    const spaceNode = document.createTextNode('\u00A0');
    
    // Add elements to container
    tempContainer.appendChild(span);
    tempContainer.appendChild(spaceNode);
    
    // Get current selection
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    
    // Insert the content
    range.deleteContents();
    const fragment = range.createContextualFragment(tempContainer.innerHTML);
    range.insertNode(fragment);
    
    // Move cursor after the space
    range.setStartAfter(spaceNode);
    range.setEndAfter(spaceNode);
    selection.removeAllRanges();
    selection.addRange(range);

    // Update content state
    const newContent = editorRef.current.innerHTML;
    setContent(newContent);
    rawContentRef.current = newContent;

    // Clear saved range and close popover
    setSavedRange(null);
    setShowVariablePopover(false);
  };

  // Close popover and clear saved range when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setShowVariablePopover(false);
        setSavedRange(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // This effect initializes the contentEditable div when needed
  useEffect(() => {
    if (previewMode) {
      wasInWysiwygMode.current = true;

      // Skip the first render to avoid cursor position issues
      if (!initialRender.current) {
        const editor = editorRef.current;
        if (editor) {
          // Save selection/cursor position
          const selection = window.getSelection();
          let range = null;
          let savedSelection = null;

          if (selection.rangeCount > 0) {
            range = selection.getRangeAt(0);
            if (editor.contains(range.commonAncestorContainer)) {
              savedSelection = {
                startContainer: range.startContainer,
                startOffset: range.startOffset,
                endContainer: range.endContainer,
                endOffset: range.endOffset,
              };
            }
          }

          // Update content
          editor.innerHTML = processContent(rawContentRef.current);

          // Restore selection/cursor position if possible
          if (savedSelection) {
            try {
              // Attempt to restore the selection
              range = document.createRange();
              range.setStart(
                savedSelection.startContainer,
                savedSelection.startOffset
              );
              range.setEnd(
                savedSelection.endContainer,
                savedSelection.endOffset
              );

              selection.removeAllRanges();
              selection.addRange(range);
            } catch (error) {
              // If we can't restore the exact selection (possibly due to DOM changes),
              // set cursor at the end as a fallback
              console.error("Failed to restore selection:", error);
              const newRange = document.createRange();
              newRange.selectNodeContents(editor);
              newRange.collapse(false);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
          }
        }
      }
    } else {
      wasInWysiwygMode.current = false;
    }

    // Mark that we're past the initial render
    initialRender.current = false;
  }, [previewMode]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="flex flex-col w-[1000px] border rounded-lg shadow-lg bg-white">
      <Toolbar
        onToolbarAction={handleToolbarAction}
        previewMode={previewMode}
        onTogglePreview={togglePreviewMode}
      />

      <div className="p-4 relative w-full min-h-64">
        {previewMode ? (
          <>
            <div
              id="wysiwyg-editor"
              ref={editorRef}
              className="w-full min-h-64 p-4 border rounded bg-white preview-content text-black"
              contentEditable={true}
              onInput={handleWysiwygChange}
              onKeyDown={handleKeyDown}
              suppressContentEditableWarning={true}
              dangerouslySetInnerHTML={
                initialRender.current
                  ? { __html: processContent(rawContentRef.current) }
                  : undefined
              }
            />
            <VariablePopover
              show={showVariablePopover}
              position={popoverPosition}
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              filteredVariables={filteredVariables}
              onVariableSelect={insertVariable}
              popoverRef={popoverRef}
            />
          </>
        ) : (
          <textarea
            id="editor-textarea"
            className="w-full min-h-64 p-4 border rounded bg-white text-black"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              rawContentRef.current = e.target.value;
            }}
          />
        )}
      </div>

      <div className="flex justify-end items-center px-4 py-2 border-t bg-gray-50 text-xs text-gray-500">
        <div>{content.length} characters</div>
      </div>

      <EditorStyles />
    </div>
  );
};

// components/EditorStyles.jsx
const EditorStyles = () => (
  <style>{`
    .highlight-liquid {
      background-color: #dbeafe;
      padding: 1px 2px;
      border-radius: 3px;
      color: #1e40af;
      font-weight: bold;
      font-size: 14px;
    }

    .highlight-liquid-tag {
      background-color: #f3f4f6;
      padding: 1px 2px;
      border-radius: 3px;
      color: #374151;
      font-family: monospace;
      font-size: 14px;
    }

    .preview-hide {
      display: none;
    }
    
    .preview-content, #editor-textarea {
      min-height: 16rem;
      font-size: 16px;
      line-height: 1.5;
      color: #1f2937;
    }
    
    #editor-textarea {
      white-space: pre-wrap;
      word-wrap: break-word;
      resize: vertical;
    }
    
    .preview-content h1, #editor-textarea h1 {
      font-size: 2em;
      font-weight: bold;
      margin-top: 0.67em;
      margin-bottom: 0.67em;
    }
    .preview-content h2, #editor-textarea h2 {
      font-size: 1.5em;
      font-weight: bold;
      margin-top: 0.83em;
      margin-bottom: 0.83em;
    }
    .preview-content h3, #editor-textarea h3 {
      font-size: 1.17em;
      font-weight: bold;
      margin-top: 1em;
      margin-bottom: 1em;
    }
    .preview-content p, #editor-textarea p {
      margin-top: 1em;
      margin-bottom: 1em;
    }
    .preview-content strong, .preview-content b,
    #editor-textarea strong, #editor-textarea b {
      font-weight: bold;
    }
    .preview-content em, .preview-content i,
    #editor-textarea em, #editor-textarea i {
      font-style: italic;
    }
    .preview-content code, #editor-textarea code {
      font-family: monospace;
      background-color: #f3f4f6;
      padding: 0.125em 0.25em;
      border-radius: 0.25em;
    }
    .preview-content ul, .preview-content ol,
    #editor-textarea ul, #editor-textarea ol {
      padding-left: 2em;
      margin-top: 1em;
      margin-bottom: 1em;
    }
    .preview-content ul, #editor-textarea ul {
      list-style-type: disc;
    }
    .preview-content ol, #editor-textarea ol {
      list-style-type: decimal;
    }
    .preview-content a, #editor-textarea a {
      color: #2563eb;
      text-decoration: underline;
    }
  `}</style>
);

const LiquidCodeEditorWrapper = () => {
  const variables = [
    { name: "product.title", description: "The title of the product" },
    {
      name: "product.description",
      description: "The description of the product",
    },
    { name: "product.price", description: "The price of the product" },
    {
      name: "product.available",
      description: "Whether the product is available",
    },
  ];
  const value = `{% capture email_title %}
    {% if has_pending_payment %}
      Thank you for your order!
    {% else %}
      Thank you for your purchase!
    {% endif %}
  {% endcapture %}
  {% capture email_body %}
    {% if has_pending_payment %}
      {% if buyer_action_required %}
        You'll get a confirmation email after completing your payment.
      {% else %}
        Your payment is being processed. You'll get an email when your order is confirmed.
      {% endif %}
    {% else %}
      {% if requires_shipping %}
      {% case delivery_method %}
          {% when 'pick-up' %}
            You'll receive an email when your order is ready for pickup.
          {% when 'local' %}
            Hi {{ customer.first_name }}, we're getting your order ready for delivery.
          {% else %}
            We're getting your order ready to be shipped. We will notify you when it has been sent.
        {% endcase %}
          {% if delivery_instructions != blank  %}
            <p><b>Delivery information:</b> {{ delivery_instructions }}</p>
          {% endif %}
         {% if consolidated_estimated_delivery_time %}
          {% if has_multiple_delivery_methods %}
            <h3 class="estimated_delivery__title">Estimated delivery</h3>
            <p>{{ consolidated_estimated_delivery_time }}</p>
          {% else %}
            <p>
              Estimated delivery <b>{{ consolidated_estimated_delivery_time }}</b>
            </p>
          {% endif %}
         {% endif %}
      {% endif %}
    {% endif %}
    {% assign gift_card_line_items = line_items | where: "gift_card" %}
    {% assign found_gift_card_with_recipient_email = false %}
    {% for line_item in gift_card_line_items %}
      {% if line_item.properties["__shopify_send_gift_card_to_recipient"] and line_item.properties["Recipient email"] %}
        {% assign found_gift_card_with_recipient_email = true %}
        {% break %}
      {% endif %}
    {% endfor %}
    {% if found_gift_card_with_recipient_email %}
      <p>Your gift card recipient will receive an email with their gift card code.</p>
    {% elsif gift_card_line_items.first %}
      <p>You'll receive separate emails for any gift cards.</p>
    {% endif %}
  {% endcapture %}`;

  return <LiquidCodeEditor variables={variables} value={value} />;
};

export default LiquidCodeEditorWrapper;
