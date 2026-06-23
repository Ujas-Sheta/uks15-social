const BASE = import.meta.env.VITE_UPLOAD_URL || "http://localhost:5173";

/**
 * Returns the full URL for an uploaded file (image or video).
 * Supports both ImageKit full URLs and legacy local filenames.
 * @param {string} filename - ImageKit URL or legacy filename from the DB.
 */
export const uploadUrl = (filename) => {
  if (!filename) return "";
  if (filename.startsWith("http")) return filename;
  return `${BASE}/uploads/posts/${filename}`;
};

/**
 * Returns a profile picture URL, falling back to the default avatar.
 * @param {string|null|undefined} filename
 */
export const profileUrl = (filename) => {
  if (!filename) return `${BASE}/default/default_profile.png`;
  if (filename.startsWith("http")) return filename;
  return `${BASE}/uploads/posts/${filename}`;
};
