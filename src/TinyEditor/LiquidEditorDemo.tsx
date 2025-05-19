import React, { useState } from 'react';
import TinyEditor from './index';
import { Button, Page, Layout, Card, Text, BlockStack } from '@shopify/polaris';
import './liquidStyles.css';
import './mentionStyles.css';

const LiquidEditorDemo: React.FC = () => {
  const [editorContent, setEditorContent] = useState<string>(
    `<title>{{ email_title }}</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta name="viewport" content="width=device-width">
    <link rel="stylesheet" type="text/css" href="/assets/notifications/styles.css">
      <style>
        .button__cell { background: {{ shop.email_accent_color }}; }
        a, a:hover, a:active, a:visited { color: {{ shop.email_accent_color }}; }
      </style>
      <table class="body">
        <tbody>
          <tr>
            <td>
              <table class="header row">
                <tbody>
                  <tr>
                    <td class="header__cell">
                      <center>
                        <table class="container">
                          <tbody>
                            <tr>
                              <td>
                                <table class="row">
                                  <tbody>
                                    <tr>
                                      <td class="shop-name__cell">
                                        {%- if shop.email_logo_url %}
                                        <img src="{{shop.email_logo_url}}" alt="{{ shop.name }}" width="{{ shop.email_logo_width }}">
                                          {%- else %}
                                          <h1 class="shop-name__text">
                                            <a href="{{shop.url}}">{{ shop.name }}</a>
                                          </h1>
                                          {%- endif %}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </center>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table class="row content">
                  <tbody>
                    <tr>
                      <td class="content__cell">
                        <center>
                          <table class="container">
                            <tbody>
                              <tr>
                                <td>
                                  <h2>Bạn đã tạm dừng gói đăng ký</h2>
                                  <p>Bạn đã tạm dừng gói đăng ký và sẽ không nhận được thêm bất kỳ khoản phí hay đơn hàng sắp tới nào. Bạn có thể tiếp tục gói đăng ký bất kỳ lúc nào.</p>
                                  {% if shop.url %}
                                  <table class="row actions">
                                    <tbody>
                                      <tr>
                                        <td class="actions__cell">
                                          <table class="button main-action-cell">
                                            <tbody>
                                              <tr>
                                                <td class="button__cell">
                                                  <a href="{{ subscription_contract_billing_cycle.customer_self_serve_url }}" class="button__text">Quản lý gói đăng ký của bạn</a>
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  {% endif %}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </center>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table class="row footer">
                  <tbody>
                    <tr>
                      <td class="footer__cell">
                        <center>
                          <table class="container">
                            <tbody>
                              <tr>
                                <td>
                                  <p class="disclaimer__subtext">Nếu có bất kỳ câu hỏi nào, hãy phản hồi email này hoặc liên hệ với chúng tôi qua địa chỉ <a href="mailto:{{ shop.email }}">{{ shop.email }}</a>
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </center>
                    </td>
                  </tr>
                </tbody>
              </table>
              <img src="{{ 'notifications/spacer.png' | shopify_asset_url }}" class="spacer" height="1">
              </td>
            </tr>
          </tbody>
        </table>`
  );

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
  };

  const handleShowContent = () => {
    // Display the current HTML content for debugging
    console.log('Current Editor Content:', editorContent);
    alert(`Current Content: ${editorContent}`);
  };

  const handleClearContent = () => {
    setEditorContent('<p>Editor content cleared. Try typing "{{" to trigger the variable popover.</p>');
  };

  const handleInsertTemplate = () => {
    setEditorContent(
      `<p>Hello Customer,</p>
<p>Thank you for your recent order from our shop. Here are your details:</p>
<ul>
  <li>Name: </li>
  <li>Email: </li>
  <li>Order Number: </li>
</ul>
<p>Try typing "{{" after any field to insert a liquid variable!</p>`
    );
  };

  return (
    <Page title="Liquid Editor Demo">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack>
              <div style={{ marginBottom: '1rem' }}>
                <Text as="h2" variant="headingMd">
                  TinyEditor with Liquid Variable Support
                </Text>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <TinyEditor
                  initialValue={editorContent}
                  onChange={handleEditorChange}
                  height={300}
                  liquidSupport={true}
                  mentionSupport={true}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button onClick={handleShowContent}>
                  Show HTML Content
                </Button>
                <Button onClick={handleClearContent}>
                  Clear Editor
                </Button>
                <Button variant="primary" onClick={handleInsertTemplate}>
                  Insert Template
                </Button>
              </div>
            </BlockStack>
          </Card>
        </Layout.Section>
        
        <Layout.Section>
          <Card>
            <BlockStack>
              <Text as="h2" variant="headingMd">Debugging Output</Text>
              <div style={{ marginTop: '1rem' }}>
                <p>Open the browser console to see detailed logging about:</p>
                <ul>
                  <li>Cursor position before adding a variant</li>
                  <li>Cursor position after adding a variant</li>
                  <li>HTML content structure before and after insertion</li>
                </ul>
                <p>This helps diagnose issues with cursor positioning after inserting Liquid variables.</p>
              </div>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default LiquidEditorDemo; 