const REGEX = /\[(.*?)\]\(.*?\)/g;

export const removeTagLinksMD = (text: string): string => {
  let match;

  const arr: {
    originalText: string;
    newText: string;
  }[] = [];

  while ((match = REGEX.exec(text)) !== null) {
    arr.push({ originalText: match[0], newText: match[1] });
  }

  while (arr.length) {
    const item = arr.pop() as typeof arr[0];
    text = text.replace(item.originalText, item.newText);
  }

  return text;
};