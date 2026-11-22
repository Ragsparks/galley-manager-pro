// html2canvas renders a clone of the page inside an iframe that the service
// worker does not control, so offline that clone can't load the CSS or fonts.
// Here they are gathered from the page (where the cache works) to be inlined.

const toDataUrl = async (url: string): Promise<string> => {
  const blob = await (await fetch(url)).blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
};

// Only the Latin subsets are cached for offline use (see vite.config.ts).
const isCachedFont = (url: string) => /-latin-(?!ext-)[^/]*\.woff2/.test(url);

const collect = async (): Promise<string> => {
  let css = '';
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      css += Array.from(sheet.cssRules).map(r => r.cssText).join('\n');
    } catch { /* unreadable cross-origin sheet: skip it */ }
  }
  const matches = Array.from(css.matchAll(/url\(["']?([^"')]+)["']?\)/g));
  const urls = new Set(matches.map(m => m[1]).filter(isCachedFont));
  for (const url of urls) {
    try {
      css = css.split(url).join(await toDataUrl(url));
    } catch { /* font unavailable: the fallback family is used */ }
  }
  return css;
};

let cached: Promise<string> | null = null;
export const getCaptureStyles = () => (cached ??= collect());

/** Adds the gathered styles to the cloned document and waits for its fonts. */
export const applyCaptureStyles = async (doc: Document, css: string) => {
  const style = doc.createElement('style');
  style.textContent = css;
  doc.head.appendChild(style);
  doc.body.getBoundingClientRect(); // force layout so needed fonts start loading
  try { await doc.fonts.ready; } catch { /* older browsers: carry on */ }
};
