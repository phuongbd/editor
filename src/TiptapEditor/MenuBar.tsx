import React from 'react';
import { Editor } from '@tiptap/react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Icon, Tooltip, Popover } from '@shopify/polaris';
import {
  DataTableIcon,
  ImageIcon,
  LinkIcon,
  ListBulletedIcon,
  ListNumberedIcon,
  SmileyHappyIcon,
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
  MenuHorizontalIcon,
  TextIcon,
  CodeIcon,
  ColorIcon,
  EyeDropperIcon,
} from '@shopify/polaris-icons';
import ImageUploadModal from './ImageUploadModal';
import LinkModal from './LinkModal';

interface MenuBarProps {
  editor: Editor | null;
}

interface EmojiObject {
  id: string;
  name: string;
  native: string;
  unified: string;
  keywords: string[];
  shortcodes: string;
}

type Level = 1 | 2 | 3 | 4 | 5 | 6;

const MenuBar: React.FC<MenuBarProps> = ({ editor }) => {
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const [showTableDropdown, setShowTableDropdown] = React.useState(false);
  const [showHeadingDropdown, setShowHeadingDropdown] = React.useState(false);
  const [showImageModal, setShowImageModal] = React.useState(false);
  const [showLinkModal, setShowLinkModal] = React.useState(false);
  const [showMoreActions, setShowMoreActions] = React.useState(false);
  const colorInputRef = React.useRef<HTMLInputElement>(null);
  const bgColorInputRef = React.useRef<HTMLInputElement>(null);
  const tableDropdownRef = React.useRef<HTMLDivElement>(null);
  const headingDropdownRef = React.useRef<HTMLDivElement>(null);
  const emojiButtonRef = React.useRef<HTMLButtonElement>(null);
  const viewMoreButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tableDropdownRef.current && !tableDropdownRef.current.contains(event.target as Node)) {
        setShowTableDropdown(false);
      }
      if (headingDropdownRef.current && !headingDropdownRef.current.contains(event.target as Node)) {
        setShowHeadingDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!editor) {
    return null;
  }

  const addEmoji = (emoji: EmojiObject) => {
    editor.commands.focus();

    const { from } = editor.state.selection;

    editor.chain().insertContent(emoji.native).run();

    setShowEmojiPicker(false);
  };

  const handleImageInsert = () => {
    setShowImageModal(true);
  };

  const handleImageSelected = (imageUrl: string) => {
    if (imageUrl && editor) {
      try {
        editor.chain().focus().setImage({ src: imageUrl }).run();
      } catch (error) {
        console.error('Error inserting image:', error);
      }
    }
  };

  const handleLinkInsert = () => {
    setShowLinkModal(true);
  };

  const handleLinkSubmit = (url: string, text: string, openInNewTab: boolean) => {
    if (editor) {
      const { from, to } = editor.state.selection;
      const hasSelectedText = from !== to;

      if (text && !hasSelectedText) {
        editor
          .chain()
          .focus()
          .insertContent(text)
          .setTextSelection({ from: from, to: from + text.length })
          .setLink({ href: url, target: openInNewTab ? '_blank' : null })
          .run();
      } else {
        editor
          .chain()
          .focus()
          .setLink({ href: url, target: openInNewTab ? '_blank' : null })
          .run();
      }

      setShowLinkModal(false);
    }
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const toggleViewMore = () => {
    setShowMoreActions(!showMoreActions);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    if (editor) {
      editor.chain().focus().setColor(color).run();
    }
  };

  const openColorPicker = () => {
    if (colorInputRef.current) {
      colorInputRef.current.click();
    }
  };

  const handleBgColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    if (editor) {
      editor.chain().focus().setBackgroundColor(color).run();
    }
  };

  const openBgColorPicker = () => {
    if (bgColorInputRef.current) {
      bgColorInputRef.current.click();
    }
  };

  return (
    <div className="menuBar">
      <div className="toolbar-wrapper">
        <div className="primary-toolbar-row">
          <Tooltip content="Bold">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'is-active toolbar-button' : 'toolbar-button'}
              type="button"
            >
              <Icon source={TextBoldIcon} tone="base" />
            </button>
          </Tooltip>
          <Tooltip content="Italic">
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'is-active toolbar-button' : 'toolbar-button'}
              type="button"
            >
              <Icon source={TextItalicIcon} tone="base" />
            </button>
          </Tooltip>
          <Tooltip content="Underline">
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={editor.isActive('underline') ? 'is-active toolbar-button' : 'toolbar-button'}
              type="button"
            >
              <Icon source={TextUnderlineIcon} tone="base" />
            </button>
          </Tooltip>

          <div className="dropdown-container" ref={headingDropdownRef}>
            <Tooltip content="Headings">
              <button
                onClick={() => setShowHeadingDropdown(!showHeadingDropdown)}
                className={
                  editor.isActive('heading', { level: 1 }) ||
                  editor.isActive('heading', { level: 2 }) ||
                  editor.isActive('heading', { level: 3 }) ||
                  editor.isActive('heading', { level: 4 }) ||
                  editor.isActive('heading', { level: 5 }) ||
                  editor.isActive('heading', { level: 6 })
                    ? 'is-active toolbar-button heading'
                    : 'toolbar-button heading'
                }
                type="button"
              >
                H
              </button>
            </Tooltip>
            {showHeadingDropdown && (
              <div className="dropdown-menu" style={{ minWidth: '60px' }}>
                {([1, 2, 3, 4, 5, 6] as Level[]).map((level) => (
                  <button
                    key={`heading-${level}`}
                    onClick={() => {
                      editor.chain().focus().toggleHeading({ level }).run();
                      setShowHeadingDropdown(false);
                    }}
                    type="button"
                    className={editor.isActive('heading', { level }) ? 'is-active dropdown-item toolbar-button' : 'dropdown-item toolbar-button'}
                  >
                    <span>H{level}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Tooltip content="Align Left">
            <button
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={editor.isActive({ textAlign: 'left' }) ? 'is-active toolbar-button' : 'toolbar-button'}
              type="button"
              aria-label="Align text left"
            >
              <Icon source={TextAlignLeftIcon} tone="base" />
            </button>
          </Tooltip>
          <Tooltip content="Align Center">
            <button
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={editor.isActive({ textAlign: 'center' }) ? 'is-active toolbar-button' : 'toolbar-button'}
              type="button"
              aria-label="Align text center"
            >
              <Icon source={TextAlignCenterIcon} tone="base" />
            </button>
          </Tooltip>
          <Tooltip content="Align Right">
            <button
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={editor.isActive({ textAlign: 'right' }) ? 'is-active toolbar-button' : 'toolbar-button'}
              type="button"
              aria-label="Align text right"
            >
              <Icon source={TextAlignRightIcon} tone="base" />
            </button>
          </Tooltip>

          <Tooltip content="Insert Image">
            <button onClick={handleImageInsert} type="button" className="toolbar-button">
              <Icon source={ImageIcon} tone="base" />
            </button>
          </Tooltip>

          <Tooltip content="Insert Link">
            <button onClick={handleLinkInsert} className={editor.isActive('link') ? 'is-active toolbar-button' : 'toolbar-button'} type="button">
              <Icon source={LinkIcon} tone="base" />
            </button>
          </Tooltip>

          <Tooltip content="View More">
            <button
              ref={viewMoreButtonRef}
              onClick={toggleViewMore}
              type="button"
              className={showMoreActions ? 'is-active toolbar-button' : 'toolbar-button'}
              aria-label="View more options"
            >
              <Icon source={MenuHorizontalIcon} tone="base" />
            </button>
          </Tooltip>
        </div>

        {showMoreActions && (
          <div className="secondary-toolbar-row">
            <Tooltip content="Remove Link">
              <button
                onClick={() => editor.chain().focus().unsetLink().run()}
                type="button"
                className={editor.isActive('link') ? 'is-active unlink-button toolbar-button' : 'unlink-button toolbar-button'}
                disabled={!editor.isActive('link')}
              >
                <Icon source={LinkIcon} tone="base" />
              </button>
            </Tooltip>
            <Tooltip content="Paragraph">
              <button
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={editor.isActive('paragraph') ? 'is-active toolbar-button' : 'toolbar-button'}
                type="button"
                aria-label="Paragraph"
              >
                <Icon source={TextIcon} tone="base" />
              </button>
            </Tooltip>

            <Tooltip content="Preformatted">
              <button
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={editor.isActive('codeBlock') ? 'is-active toolbar-button' : 'toolbar-button'}
                type="button"
                aria-label="Preformatted text"
              >
                <Icon source={CodeIcon} tone="base" />
              </button>
            </Tooltip>

            <div className="color-picker-container">
              <Tooltip content="Text Color">
                <button
                  onClick={openColorPicker}
                  className={editor.getAttributes('textStyle').color ? 'is-active toolbar-button' : 'toolbar-button'}
                  type="button"
                  aria-label="Text color"
                >
                  <div
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon source={EyeDropperIcon} tone="base" />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '-2px',
                        height: '3px',
                        width: '100%',
                        backgroundColor: editor.getAttributes('textStyle').color || 'transparent',
                        borderRadius: '1px',
                        display: editor.getAttributes('textStyle').color ? 'block' : 'none',
                      }}
                    />
                  </div>
                </button>
              </Tooltip>
              <input
                ref={colorInputRef}
                type="color"
                onChange={handleColorChange}
                value={editor.getAttributes('textStyle').color || '#000000'}
                className="color-input"
                aria-label="Select text color"
              />
            </div>

            <div className="color-picker-container">
              <Tooltip content="Background Color">
                <button
                  onClick={openBgColorPicker}
                  className={editor.getAttributes('textStyle').backgroundColor ? 'is-active toolbar-button' : 'toolbar-button'}
                  type="button"
                  aria-label="Text background color"
                >
                  <div
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon source={ColorIcon} tone="base" />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '-2px',
                        height: '3px',
                        width: '100%',
                        backgroundColor: editor.getAttributes('textStyle').backgroundColor || 'transparent',
                        borderRadius: '1px',
                        display: editor.getAttributes('textStyle').backgroundColor ? 'block' : 'none',
                      }}
                    />
                  </div>
                </button>
              </Tooltip>
              <input
                ref={bgColorInputRef}
                type="color"
                onChange={handleBgColorChange}
                value={editor.getAttributes('textStyle').backgroundColor || '#ffffff'}
                className="color-input"
                aria-label="Select background color"
              />
            </div>

            <Tooltip content="Bullet List">
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'is-active toolbar-button' : 'toolbar-button'}
                type="button"
              >
                <Icon source={ListBulletedIcon} tone="base" />
              </button>
            </Tooltip>

            <Tooltip content="Ordered List">
              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive('orderedList') ? 'is-active toolbar-button' : 'toolbar-button'}
                type="button"
              >
                <Icon source={ListNumberedIcon} tone="base" />
              </button>
            </Tooltip>

            <div className="dropdown-container" ref={tableDropdownRef}>
              <Tooltip content="Table Options">
                <button
                  onClick={() => setShowTableDropdown(!showTableDropdown)}
                  type="button"
                  className={showTableDropdown ? 'is-active toolbar-button' : 'toolbar-button'}
                >
                  <Icon source={DataTableIcon} tone="base" />
                </button>
              </Tooltip>
              {showTableDropdown && (
                <div className="dropdown-menu">
                  <button
                    onClick={() => {
                      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                      setShowTableDropdown(false);
                    }}
                    type="button"
                    title="Insert Table"
                    className="dropdown-item toolbar-button"
                  >
                    <span>Insert Table</span>
                  </button>
                  <button
                    onClick={() => {
                      editor.chain().focus().addColumnBefore().run();
                      setShowTableDropdown(false);
                    }}
                    disabled={!editor.can().addColumnBefore()}
                    type="button"
                    title="Add Column Before"
                    className="dropdown-item toolbar-button"
                  >
                    <span>Add Column Before</span>
                  </button>
                  <button
                    onClick={() => {
                      editor.chain().focus().addColumnAfter().run();
                      setShowTableDropdown(false);
                    }}
                    disabled={!editor.can().addColumnAfter()}
                    type="button"
                    title="Add Column After"
                    className="dropdown-item toolbar-button"
                  >
                    <span>Add Column After</span>
                  </button>
                  <button
                    onClick={() => {
                      editor.chain().focus().deleteColumn().run();
                      setShowTableDropdown(false);
                    }}
                    disabled={!editor.can().deleteColumn()}
                    type="button"
                    title="Delete Column"
                    className="dropdown-item toolbar-button"
                  >
                    <span>Delete Column</span>
                  </button>
                  <button
                    onClick={() => {
                      editor.chain().focus().addRowBefore().run();
                      setShowTableDropdown(false);
                    }}
                    disabled={!editor.can().addRowBefore()}
                    type="button"
                    title="Add Row Before"
                    className="dropdown-item toolbar-button"
                  >
                    <span>Add Row Before</span>
                  </button>
                  <button
                    onClick={() => {
                      editor.chain().focus().addRowAfter().run();
                      setShowTableDropdown(false);
                    }}
                    disabled={!editor.can().addRowAfter()}
                    type="button"
                    title="Add Row After"
                    className="dropdown-item toolbar-button"
                  >
                    <span>Add Row After</span>
                  </button>
                  <button
                    onClick={() => {
                      editor.chain().focus().deleteRow().run();
                      setShowTableDropdown(false);
                    }}
                    disabled={!editor.can().deleteRow()}
                    type="button"
                    title="Delete Row"
                    className="dropdown-item toolbar-button"
                  >
                    <span>Delete Row</span>
                  </button>
                  <button
                    onClick={() => {
                      editor.chain().focus().deleteTable().run();
                      setShowTableDropdown(false);
                    }}
                    disabled={!editor.can().deleteTable()}
                    type="button"
                    title="Delete Table"
                    className="dropdown-item toolbar-button"
                  >
                    <span>Delete Table</span>
                  </button>
                </div>
              )}
            </div>

            <Tooltip content="Insert Emoji">
              <button
                ref={emojiButtonRef}
                onClick={toggleEmojiPicker}
                type="button"
                className={showEmojiPicker ? 'is-active toolbar-button' : 'toolbar-button'}
                aria-label="Insert emoji"
              >
                <Icon source={SmileyHappyIcon} tone="base" />
              </button>
            </Tooltip>

            <Popover active={showEmojiPicker} activator={<div />} onClose={() => setShowEmojiPicker(false)} preferredPosition="below">
              <div className="emoji-picker-wrapper">
                <Picker data={data} onEmojiSelect={addEmoji} previewPosition="none" skinTonePosition="none" />
              </div>
            </Popover>
          </div>
        )}
      </div>
      {showImageModal && <ImageUploadModal onClose={() => setShowImageModal(false)} onImageSelected={handleImageSelected} />}
      {showLinkModal && <LinkModal onClose={() => setShowLinkModal(false)} onLinkSubmit={handleLinkSubmit} editor={editor} />}
    </div>
  );
};

export default MenuBar;
