const date = new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', year: 'numeric' })
const time = new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
export function formatPaymentDate(value: string, includeTime = true): string {
  const instant = new Date(value)
  return includeTime ? `${date.format(instant)}, ${time.format(instant).replace(/\./g, ':')} WIB` : date.format(instant)
}
