import { useState } from 'react'
import { Modal } from '@/shared/presentation/components/molecules/modal'
import { Button } from '@/shared/presentation/components/atoms/button'
import { buildVoucherShareLinks, copyVoucherLink } from '../lib/share-voucher'
import styles from './voucher-share-modal.module.css'
export function VoucherShareModal({ open, url, title, onClose }: { open: boolean; url: string; title: string; onClose: () => void }) {
  const [message, setMessage] = useState('')
  const links = url ? buildVoucherShareLinks(url, title) : null
  async function copy() { setMessage(await copyVoucherLink(navigator.clipboard, url) ? 'Tautan berhasil disalin' : 'Salin tautan secara manual dari kolom di atas.') }
  return <Modal open={open} title="Bagikan Penawaran Kilat" onClose={onClose}><p className={styles.title}>{title}</p><p className={styles.description}>Ajak teman menikmati penawaran ini sebelum kuota habis.</p>
    <label className={styles.label} htmlFor="voucher-share-url">Tautan voucher</label><div className={styles.copy}><input id="voucher-share-url" readOnly value={url} onFocus={event => event.currentTarget.select()} /><Button onClick={copy}>Salin Tautan</Button></div>
    <p role="status" className={styles.feedback}>{message}</p><div className={styles.links}>{links && Object.entries(links).map(([name, href]) => <a key={name} href={href} target="_blank" rel="noopener noreferrer">{name === 'whatsapp' ? 'WhatsApp' : name === 'telegram' ? 'Telegram' : 'X'}</a>)}</div>
  </Modal>
}
