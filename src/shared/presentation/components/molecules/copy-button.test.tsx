// @vitest-environment jsdom
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it, vi } from 'vitest'
import { CopyButton } from './copy-button'
vi.mock('next/font/local', () => ({ default: () => ({ className: 'icons' }) }))
it('copies the supplied value and provides honest feedback for denied or unavailable clipboard', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  const container = document.createElement('div'), root = createRoot(container), writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  await act(async () => root.render(<CopyButton value="1234" label="Salin VA" />))
  const button = container.querySelector('button')!
  expect(button).not.toBeNull()
  await act(async () => button.click())
  expect(writeText).toHaveBeenCalledExactlyOnceWith('1234')
  expect(container.textContent).toContain('Berhasil disalin')
  writeText.mockRejectedValue(new Error('Denied')); await act(async () => button.click())
  expect(container.textContent).toContain('Salin secara manual')
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined }); await act(async () => button.click())
  expect(container.textContent).toContain('Salin secara manual')
  await act(async () => root.unmount())
})
