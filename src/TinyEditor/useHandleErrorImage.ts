import { DEFAULT_IMAGE_URL } from './constants';

const useHandleErrorImage = () => {
  const applyImageErrorHandling = (editorId: string) => {
    setTimeout(() => {
      try {
        const editorSelector = `#${editorId}_ifr`;
        const editorIframe = document.querySelector(editorSelector) as HTMLIFrameElement;

        if (editorIframe && editorIframe.contentDocument) {
          const imgElements = editorIframe.contentDocument.querySelectorAll('img');

          imgElements.forEach((img) => {
            if (img.src === DEFAULT_IMAGE_URL) return;

            img.removeAttribute('onerror');

            img.onerror = function () {
              this.onerror = null;
              this.src = DEFAULT_IMAGE_URL;
            };

            if (img.complete && (img.naturalWidth === 0 || img.naturalHeight === 0)) {
              img.src = DEFAULT_IMAGE_URL;
            } else {
              const testImage = new Image();
              testImage.onerror = function () {
                if (img.src !== DEFAULT_IMAGE_URL) {
                  img.src = DEFAULT_IMAGE_URL;
                }
              };
              testImage.src = img.src;
            }
          });
        }
      } catch (err) {
        console.error('Error applying image error handling', err);
      }
    }, 300);
  };

  return { applyImageErrorHandling };
};

export default useHandleErrorImage;
