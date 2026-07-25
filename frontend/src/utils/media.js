// Uploaded images get a companion thumbnail stored next to the full file,
// named "thumb-<same filename>" (see backend/src/controllers/playerController.js).
// Deriving the thumb URL by string manipulation avoids any DB schema change.
export const getThumbUrl = (url) => {
  if (!url || url.startsWith('data:')) return url;
  const lastSlash = url.lastIndexOf('/');
  if (lastSlash === -1) return url;
  return `${url.slice(0, lastSlash + 1)}thumb-${url.slice(lastSlash + 1)}`;
};

// For <img onError>: images uploaded before thumbnails existed have no
// "thumb-" counterpart (404s once) — fall back to the full-size image.
export const fallbackToFullImage = (fullUrl) => (e) => {
  e.target.onerror = null;
  e.target.src = fullUrl;
};
