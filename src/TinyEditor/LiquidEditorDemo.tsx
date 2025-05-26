import React, { useRef, useState, useEffect } from "react";
import TinyEditor from "./index";
import { Button, Page, Layout, Card, Text, BlockStack } from "@shopify/polaris";
import { initDefault } from "./config";
import useHandleErrorImage from "./useHandleErrorImage";
import {cleanHtmlUseTinyEditor} from "./useCleanHtml";
import { fakeValue } from "./fakeValue";

const LiquidEditorDemo: React.FC = () => {
  const { applyImageErrorHandling } = useHandleErrorImage();
  const editorInstanceId = useRef<string>(`tiny-editor-${Math.random().toString(36).substring(2, 9)}`);
  const [value, setValue] = useState<string>(fakeValue);
  const [valueDefault, setValueDefault] = useState<string>(fakeValue);

  const handleEditorChange = (content: string) => {
    console.log('content', content);
    setValue(content);
  };

  return (
    <Page title="Liquid Editor Demo">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack>
              <div style={{ marginBottom: "1rem" }}>
                <Text as="h2" variant="headingMd">
                  TinyEditor with Liquid Variable Support
                </Text>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <TinyEditor
                  id={editorInstanceId.current}
                  init={{
                    ...initDefault,
                    setup: (editor) => {
                      editor.on("init", () => {
                        setTimeout(() => {
                          applyImageErrorHandling(editorInstanceId.current);
                        }, 100);
                      });

                      editor.on("NodeChange", (e) => {
                        if (e.element && e.element.nodeName === "IMG") {
                          applyImageErrorHandling(editorInstanceId.current);
                        }
                      });

                      editor.on("SetContent", () => {
                        setTimeout(() => {
                          applyImageErrorHandling(editorInstanceId.current);
                        }, 100);
                      });
                    },
                  }}
                  value={value}
                  valueDefault={valueDefault}
                  disabled={false}
                  onChange={handleEditorChange}
                  liquidSupport={false}
                  mentionSupport={false}
                />
              </div>
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Button
            onClick={() => {
              const cleanHtml = cleanHtmlUseTinyEditor(value);
              console.log('cleanHtml', cleanHtml);
              setValue(cleanHtml);
            }}
          >
            Clean Editor
          </Button>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default LiquidEditorDemo;
