export const ID_EDITOR = 'editor-translation';

export const VALID_CHILDREN = `+a[div|p|ul|ol|li|span|i|h1|h2|h3|h4|h5|h5|h6],+p[tc|transcy|link|script],+body[style|meta|link|script],+div[meta|link|script],+object[object|param|embed],+span[div|p|ul|ol|li|h1|h2|h3|h4|h5|h6|i|article|section|meta],+tc[link|script|div|p|ul|ol|li|span|h1|h2|h3|h4|h5|h6|i|article|section|meta],+transcy[link|script|div|p|ul|ol|li|span|h1|h2|h3|h4|h5|h6|i|article|section|meta],+li[link|script|div|p|ul|ol|li|span|h1|h2|h3|h4|h5|h6|i|article|section|meta]`;
export const initInine: any = {
  license_key: 'gpl',
  valid_elements: 'mark[class],tc[class],transcy[class],br',
  statusbar: false,
  menubar: false,
  toolbar_sticky: false,
  plugins: '',
  toolbar: false,
  forced_root_block: ' ',
  relative_urls: false,
  custom_elements: '~tc,~transcy',
  entity_encoding: 'raw',
  content_style:
    'html, body { height: 100%; } body { font-size:14px; margin: 0; color: rgba(48, 48, 48, 1) !important;} .highlight-text{ background: #D5F3F8; padding: 0px;} .highlight-text-active{ background: #081362 !important; color: #fff; }',
  sandbox_iframes: false,
};

export const initDefault: any = {
  license_key: 'gpl',
  valid_elements: '*[*]',
  extended_valid_elements: '*[*]',
  valid_children: '+body[style|meta|link|script],+html[html|head|body|meta|link|style|script|!DOCTYPE],' + VALID_CHILDREN,
  end_container_on_empty_block: false,
  verify_html: false,
  cleanup: false,
  allow_html_in_named_anchor: true,
  prevent_list_wrap: true,
  browser_spellcheck: true,
  statusbar: false,
  menubar: false,
  toolbar_sticky: false,
  forced_root_block: 'div',
  forced_root_block_attrs: {
    'data-editor-transcy': 'true',
  },
  relative_urls: false,
  convert_urls: false,
  custom_elements: '~tc,~transcy,~liquid-if,~liquid-unless,~liquid-case,~liquid-when,~liquid-else',
  entity_encoding: 'raw',
  plugins:
    'preview searchreplace autolink autosave directionality visualblocks visualchars fullscreen image link media table pagebreak nonbreaking anchor advlist lists wordcount code',
  toolbar:
    'blocks | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | outdent indent | numlist bullist | forecolor backcolor removeformat | image media link | code fullscreen preview',
  content_style:
    'html, body { height: 100%; } body { font-size:14px; margin: 0; color: rgba(48, 48, 48, 1)!important; } .highlight-text{ background: #D5F3F8; padding: 0px;} .highlight-text-active{ background: #081362 !important; color: #fff; }',
  sandbox_iframes: false,
  preserve_cdata: true,
  preserve_whitespace: true,
  indent: true,
  indent_before: '\n',
  indent_after: '\n',
  block_formats: 'Paragraph=p;Header 1=h1;Header 2=h2;Header 3=h3',
  extended_valid_elements: '*[*],liquid-if[*],liquid-else[*],liquid-endif[*]',
  custom_elements: '~liquid-if,~liquid-else,~liquid-endif,~tc,~transcy',
  valid_children: '+body[liquid-if|liquid-else|liquid-endif|*]',
  content_css: false,
  noneditable_class: 'liquid-tag',
  protect: [
    /({%-?\s*.*?\s*-?%})/g,
    /({{-?\s*.*?\s*-?}})/g
  ]
};
