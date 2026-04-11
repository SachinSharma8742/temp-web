export function isRemoteUrl(url) {
  return /^https?:\/\//i.test(url || '');
}

export function getDeliveredImageUrl(url, options = {}) {
  if (!url) return url;
  if (!isRemoteUrl(url)) return url;

  const { width = 1600, quality = 72, format = 'webp' } = options;
  const encodedUrl = encodeURIComponent(url);
  return `https://wsrv.nl/?url=${encodedUrl}&w=${width}&q=${quality}&output=${format}`;
}

export function getDeliveredSrcSet(url, widths = [640, 960, 1280], options = {}) {
  if (!isRemoteUrl(url)) return undefined;

  const { quality = 72, format = 'webp' } = options;
  return widths
    .map((width) => `${getDeliveredImageUrl(url, { width, quality, format })} ${width}w`)
    .join(', ');
}
