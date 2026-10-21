const rupiah = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 })
const clock = new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })
const date = new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short' })

export function formatRupiah(amount: number): string { return `Rp${rupiah.format(amount)}` }
export function formatCountdown(milliseconds: number): string {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000))
  return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map(value => String(value).padStart(2, '0')).join(':')
}
export function formatWib(now: number): string { return clock.format(now).replace(/\./g, ':') }
export function formatDashboardDate(value: string): string { return date.format(new Date(value)) }
