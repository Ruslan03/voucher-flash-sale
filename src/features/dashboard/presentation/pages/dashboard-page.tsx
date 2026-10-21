import { connection } from 'next/server'
import { getDashboardController } from '../../controllers/dashboard-controller'
import { DashboardView } from './dashboard-view'

export async function DashboardPage() {
  await connection()
  return <DashboardView initialResult={await getDashboardController()} />
}
