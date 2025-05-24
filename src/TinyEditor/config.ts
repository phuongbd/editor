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
  extended_valid_elements: '*[*],head,html[lang|xml::lang|xmlns],body[style],meta[*],title[*],style[*],script[*],link[*],!DOCTYPE',
  valid_children: '+body[style|meta|link|script],+html[html|head|body|meta|link|style|script|!DOCTYPE],' + VALID_CHILDREN,
  // extended_valid_elements: '#p[*]',
  // force_p_newlines: false,
  // force_br_newlines : true,
  // forced_root_block: " ",
  // newline_behavior: 'linebreak',
  // forced_root_block_attrs: {
  //   'class': 'myclass',
  //   'data-something': 'my data'
  // },
  end_container_on_empty_block: false,
  verify_html: false,
  cleanup: false,
  allow_html_in_named_anchor: true,
  // allow_conditional_comments: true,
  // allow_script_urls: true,
  // preserve_cdata: true,
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
  // remove_script_host: false,
  // doctype: '<!DOCTYPE html>',
  // force_br_newlines : true,
  // force_p_newlines : false,
  // remove_trailing_brs: false,
  custom_elements: '~tc,~transcy',
  entity_encoding: 'raw',
  // keep_styles: true,
  // protect: [/<!DOCTYPE[\w\W]*?>/g, /<\?php[\w\W]*?\?>/g, /<\?[\w\W]*?\?>/g, /<html[\w\W]*?>/g, /<head[\w\W]*?>/g, /<title[\w\W]*?>/g],
  plugins:
    'preview searchreplace autolink autosave directionality visualblocks visualchars fullscreen image link media table pagebreak nonbreaking anchor advlist lists wordcount code',
  toolbar:
    'blocks | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | outdent indent | numlist bullist | forecolor backcolor removeformat | image media link | code fullscreen preview',
  content_style:
    'html, body { height: 100%; } body { font-size:14px; margin: 0; color: rgba(48, 48, 48, 1)!important; } .highlight-text{ background: #D5F3F8; padding: 0px;} .highlight-text-active{ background: #081362 !important; color: #fff; }',
  sandbox_iframes: false,
};
