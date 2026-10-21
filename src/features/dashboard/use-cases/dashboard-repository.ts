import type { DashboardSnapshot } from '../domain/dashboard'

/** Frontend read port, not a backend response schema. */
export interface DashboardRepository { load(): Promise<DashboardSnapshot> }
