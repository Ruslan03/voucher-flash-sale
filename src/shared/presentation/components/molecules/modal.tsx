'use client'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Button } from '../atoms/button'
import styles from './modal.module.css'

export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null), titleId = useId()
  useEffect(() => { const dialog = ref.current; if (!dialog) return; if (open && !dialog.open) dialog.showModal(); else if (!open && dialog.open) dialog.close() }, [open])
  return <dialog ref={ref} className={styles.dialog} aria-labelledby={titleId} onCancel={event => { event.preventDefault(); onClose() }}>
    <header className={styles.header}><h2 id={titleId}>{title}</h2><Button variant="outline" onClick={onClose} aria-label="Tutup dialog">Tutup</Button></header>
    {children}
  </dialog>
}
