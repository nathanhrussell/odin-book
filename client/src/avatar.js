export const DEFAULT_AVATAR = "/default-avatar.svg";

export function avatarSrc(url) {
  if (!url) return DEFAULT_AVATAR;
  return url;
}
