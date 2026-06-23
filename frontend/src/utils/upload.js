const BASE = import.meta.env.VITE_UPLOAD_URL || "http://localhost:5173";

/**
 * Returns the full URL for an uploaded file (image or video).
 * @param {string} filename - The stored filename from the DB.
 */
export const uploadUrl = (filename) => `${BASE}/uploads/posts/${filename}`;

/**
 * Returns a profile picture URL, falling back to the default avatar.
 * @param {string|null|undefined} filename
 */
export const profileUrl = (filename) =>
  filename ? uploadUrl(filename) : `${BASE}/default/default_profile.png`;
