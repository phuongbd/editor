import React, { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Code,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Link,
  Eye,
  EyeOff,
  Code2,
  FileCode,
} from "lucide-react";

const LiquidCodeEditor = ({ variables = [] }) => {
  const [content, setContent] = useState(`{% capture email_title %}
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
{% endcapture %}`);
  const [previewMode, setPreviewMode] = useState(false);
  const [showVariablePopover, setShowVariablePopover] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [filteredVariables, setFilteredVariables] = useState(variables);
  const [searchTerm, setSearchTerm] = useState("");
  const popoverRef = useRef(null);

  // Refs for managing cursor position
  const editorRef = useRef(null);
  const wasInWysiwygMode = useRef(false);
  const initialRender = useRef(true);
  const rawContentRef = useRef(content); // Store original content without highlights
  const [savedRange, setSavedRange] = useState(null);

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

  // Function to process the content for display
  const processContent = () => {
    let processedContent = rawContentRef.current;

    // Hide {% %} tags if option is enabled
    processedContent = processedContent.replace(/{%.*?%}/g, "");

    // Split content into parts and process each part
    const parts = processedContent.split(/({{[^}]+}})/g);

    // Process each part and wrap Liquid tags with highlight
    processedContent = parts
      .map((part) => {
        if (part.startsWith("{{") && part.endsWith("}}")) {
          return `<span class="highlight-liquid">${part}</span>`;
        }
        return part;
      })
      .join("");

    return processedContent;
  };

  // Function to clean highlight tags from content
  const cleanHighlightTags = (htmlContent) => {
    // Remove highlight spans but keep their content
    return htmlContent.replace(
      /<span class="highlight-liquid">(.*?)<\/span>/g,
      "$1"
    );
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
      case "link":
        newText = `<a href="#">${selectedText}</a>`;
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

    // Remove multiple spaces
    cleaned = cleaned.replace(/\s+/g, " ");

    // Remove spaces before/after HTML tags
    cleaned = cleaned.replace(/\s*(<[^>]+>)\s*/g, "$1");

    // Remove unnecessary &nbsp;
    cleaned = cleaned.replace(/&nbsp;/g, " ");

    return cleaned;
  };

  const togglePreviewMode = () => {
    // Also clean content when switching preview mode
    const cleanedContent = cleanContent(content);
    setContent(cleanedContent);
    rawContentRef.current = cleanedContent;
    setPreviewMode(!previewMode);
  };

  // Handle content changes in WYSIWYG mode
  const handleWysiwygChange = () => {
    if (!editorRef.current) return;
    const newContent = editorRef.current.innerHTML;
    setContent(newContent);
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
    const tempContainer = document.createElement("div");

    // Create the highlight span
    const span = document.createElement("span");
    span.className = "highlight-liquid";
    span.textContent = variableText;

    // Create a text node for the space
    const spaceNode = document.createTextNode("\u00A0");

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
          editor.innerHTML = processContent();

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

  // Update filteredVariables when variables prop changes
  useEffect(() => {
    setFilteredVariables(variables);
  }, [variables]);

  // Filter variables based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = variables.filter(
        (variable) =>
          variable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          variable.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVariables(filtered);
    } else {
      setFilteredVariables(variables);
    }
  }, [searchTerm, variables]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="w-full max-w-4xl mx-auto border rounded-lg shadow-lg bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center p-2 border-b bg-gray-50">
        <button
          onClick={() => handleToolbarAction("bold")}
          className="p-1.5 mx-1 rounded hover:bg-gray-200"
          title="Bold"
        >
          <Bold size={18} />
        </button>
        <button
          onClick={() => handleToolbarAction("italic")}
          className="p-1.5 mx-1 rounded hover:bg-gray-200"
          title="Italic"
        >
          <Italic size={18} />
        </button>
        <button
          onClick={() => handleToolbarAction("code")}
          className="p-1.5 mx-1 rounded hover:bg-gray-200"
          title="Code"
        >
          <Code size={18} />
        </button>
        <span className="mx-2 h-6 border-l border-gray-300"></span>

        <button
          onClick={() => handleToolbarAction("h1")}
          className="p-1.5 mx-1 rounded hover:bg-gray-200"
          title="Heading 1"
        >
          <Heading1 size={18} />
        </button>
        <button
          onClick={() => handleToolbarAction("h2")}
          className="p-1.5 mx-1 rounded hover:bg-gray-200"
          title="Heading 2"
        >
          <Heading2 size={18} />
        </button>
        <button
          onClick={() => handleToolbarAction("h3")}
          className="p-1.5 mx-1 rounded hover:bg-gray-200"
          title="Heading 3"
        >
          <Heading3 size={18} />
        </button>
        <span className="mx-2 h-6 border-l border-gray-300"></span>

        <button
          onClick={() => handleToolbarAction("ul")}
          className="p-1.5 mx-1 rounded hover:bg-gray-200"
          title="Unordered List"
        >
          <List size={18} />
        </button>
        <button
          onClick={() => handleToolbarAction("ol")}
          className="p-1.5 mx-1 rounded hover:bg-gray-200"
          title="Ordered List"
        >
          <ListOrdered size={18} />
        </button>
        <span className="mx-2 h-6 border-l border-gray-300"></span>

        <button
          onClick={() => handleToolbarAction("align-left")}
          className="p-1.5 mx-1 rounded hover:bg-gray-200"
          title="Align Left"
        >
          <AlignLeft size={18} />
        </button>
        <button
          onClick={() => handleToolbarAction("align-center")}
          className="p-1.5 mx-1 rounded hover:bg-gray-200"
          title="Align Center"
        >
          <AlignCenter size={18} />
        </button>
        <button
          onClick={() => handleToolbarAction("align-right")}
          className="p-1.5 mx-1 rounded hover:bg-gray-200"
          title="Align Right"
        >
          <AlignRight size={18} />
        </button>
        <span className="mx-2 h-6 border-l border-gray-300"></span>

        <button
          onClick={() => handleToolbarAction("link")}
          className="p-1.5 mx-1 rounded hover:bg-gray-200"
          title="Insert Link"
        >
          <Link size={18} />
        </button>

        <span className="mx-2 h-6 border-l border-gray-300"></span>

        <button
          onClick={togglePreviewMode}
          className={`p-1.5 mx-1 rounded hover:bg-gray-200 ${
            previewMode ? "bg-blue-100" : ""
          }`}
          title="Toggle Edit/Preview"
        >
          {previewMode ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* Editor/Preview Area */}
      <div className="p-4 relative">
        {previewMode ? (
          // WYSIWYG HTML editor
          <>
            <div
              id="wysiwyg-editor"
              ref={editorRef}
              className="min-h-64 p-4 border rounded bg-white preview-content text-black"
              contentEditable={true}
              onInput={handleWysiwygChange}
              onKeyDown={handleKeyDown}
              suppressContentEditableWarning={true}
              dangerouslySetInnerHTML={
                initialRender.current ? { __html: processContent() } : undefined
              }
            ></div>

            {/* Variables Popover */}
            {showVariablePopover && (
              <div
                ref={popoverRef}
                className="absolute bg-white border rounded-lg shadow-lg p-2 z-50 max-h-60 w-64"
                style={{
                  left: `${popoverPosition.x}px`,
                  top: `${popoverPosition.y}px`,
                  transform: "translateY(-100%)", // Move entire popover above the position
                }}
              >
                {/* Search input */}
                <div className="sticky top-0 bg-white p-2 border-b">
                  <input
                    type="text"
                    placeholder="Search variables..."
                    className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>

                {/* Variables list */}
                <div className="overflow-y-auto max-h-48">
                  {filteredVariables.length > 0 ? (
                    filteredVariables.map((variable, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-blue-50 cursor-pointer flex flex-col"
                        onClick={() => insertVariable(variable)}
                      >
                        <span className="font-medium text-blue-600">
                          {variable.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {variable.description}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-gray-500 text-center">
                      No variables found
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          // Code editor mode
          <textarea
            id="editor-textarea"
            className="w-full min-h-64 p-4 font-mono text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-black"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              rawContentRef.current = e.target.value;
            }}
          />
        )}
      </div>

      {/* Status bar */}
      <div className="flex justify-between items-center px-4 py-2 border-t bg-gray-50 text-xs text-gray-500">
        <div>{content.length} characters</div>
        <div className="flex space-x-4">
          <span>Mode: {previewMode ? "WYSIWYG Editor" : "Code Editor"}</span>
        </div>
      </div>

      <style>{`
          .highlight-liquid {
            background-color: #dbeafe;
            padding: 1px 2px;
            border-radius: 3px;
            color: #1e40af;
            font-weight: bold;
            font-size: 14px;
          }
          
          .preview-content {
            min-height: 16rem;
          }
          
          .preview-content h1 {
            font-size: 2em;
            font-weight: bold;
            margin-top: 0.67em;
            margin-bottom: 0.67em;
          }
          .preview-content h2 {
            font-size: 1.5em;
            font-weight: bold;
            margin-top: 0.83em;
            margin-bottom: 0.83em;
          }
          .preview-content h3 {
            font-size: 1.17em;
            font-weight: bold;
            margin-top: 1em;
            margin-bottom: 1em;
          }
          .preview-content p {
            margin-top: 1em;
            margin-bottom: 1em;
          }
          .preview-content strong, .preview-content b {
            font-weight: bold;
          }
          .preview-content em, .preview-content i {
            font-style: italic;
          }
          .preview-content code {
            font-family: monospace;
            background-color: #f3f4f6;
            padding: 0.125em 0.25em;
            border-radius: 0.25em;
          }
          .preview-content ul, .preview-content ol {
            padding-left: 2em;
            margin-top: 1em;
            margin-bottom: 1em;
          }
          .preview-content ul {
            list-style-type: disc;
          }
          .preview-content ol {
            list-style-type: decimal;
          }
          .preview-content a {
            color: #2563eb;
            text-decoration: underline;
          }
          .preview-content img {
            max-width: 100%;
            height: auto;
          }
          
        `}</style>
    </div>
  );
};

export default LiquidCodeEditor;
