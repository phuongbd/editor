const useCleanHtml = () => {
  const transformListItemsContent = (html: string): string => {
    return html.replace(/<li[^>]*>([\s\S]*?)<\/li>/g, (match, content) => {
      const transformedContent = content.replace(/<p([^>]*)>([\s\S]*?)<\/p>/g, '<span$1>$2</span>');
      return `<li>${transformedContent}</li>`;
    });
  };

  const cleanHtml = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const mentions = tempDiv.querySelectorAll('span.mention');
    mentions.forEach((mention) => {
      const content = mention.textContent || '';
      mention.replaceWith(content);
    });

    const images = tempDiv.querySelectorAll('img');
    images.forEach((img) => {
      img.removeAttribute('data-transcy-src');
      img.removeAttribute('onerror');
    });

    const cleanedHtml = tempDiv.innerHTML;
    return transformListItemsContent(cleanedHtml);
  };
  return { cleanHtml };
};

export default useCleanHtml;
