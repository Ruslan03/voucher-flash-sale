export function buildVoucherShareLinks(url: string, title: string): { whatsapp: string; telegram: string; x: string } {
  if (!['https:', 'http:'].includes(new URL(url).protocol)) throw new Error('Unsupported share URL')
  return {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${url}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    x: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  }
}
export async function copyVoucherLink(clipboard: Pick<Clipboard, 'writeText'> | undefined, url: string): Promise<boolean> {
  if (!clipboard) return false
  try { await clipboard.writeText(url); return true } catch { return false }
}
