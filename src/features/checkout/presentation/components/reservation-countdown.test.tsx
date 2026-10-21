import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import { ReservationCountdown } from './reservation-countdown'
vi.mock('next/font/local', () => ({ default: () => ({ className: 'icons' }) }))
it('renders the required reservation-countdown content and state', async () => {
  const markup = renderToStaticMarkup(<ReservationCountdown expiresAt={new Date(225000).toISOString()} now={0} />)
  expect(markup).toContain('03:45')
  expect(markup).toContain('role="timer"')
})
