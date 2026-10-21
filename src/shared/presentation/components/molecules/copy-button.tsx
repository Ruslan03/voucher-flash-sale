'use client'
import { useState } from 'react'
import { Button } from '../atoms/button'
import { Icon } from '../atoms/icon'
import styles from './copy-button.module.css'
export function CopyButton({ value, label = 'Salin' }: { value: string; label?: string }) {
  const [message, setMessage] = useState(''), [busy, setBusy] = useState(false)
  async function copy() {
    setBusy(true); setMessage('')
    try { if (!navigator.clipboard) throw new Error('Unavailable'); await navigator.clipboard.writeText(value); setMessage('Berhasil disalin') }
    catch { setMessage('Salin secara manual dari teks yang ditampilkan.') }
    finally { setBusy(false) }
  }
  return <span className={styles.control}><Button className={styles.button} variant="outline" aria-label={label} disabled={busy} onClick={copy}><Icon name="content_copy" />{label}</Button><span className={styles.feedback} role="status">{message}</span></span>
}
