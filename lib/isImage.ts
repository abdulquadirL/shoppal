export function isImage(url: string) {
  return /\.(jpg|jpeg|png|webp|gif)$/i.test(url);
}
