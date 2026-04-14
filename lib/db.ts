import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'wri-toolkit'
const DB_VERSION = 1

// ── Store names ───────────────────────────────────────────────────────────────

export type StoreName =
  | 'organizations'
  | 'users'
  | 'lp_audits'
  | 'rm_requests'
  | 'shift_handoffs'
  | 'daily_summaries'

// ── Cached record types (subset for offline display) ──────────────────────────

export type CachedOrganization = {
  id: string
  name: string
  owner_email: string
  subscription_status: string
  plan: string
  trial_ends_at: string | null
  cached_at: string
}

export type CachedUser = {
  id: string
  auth_id: string
  email: string
  name: string
  org_id: string
  role: string
  cached_at: string
}

export type CachedLPAudit = {
  id: string
  org_id: string
  audit_date: string
  completed_at: string | null
  cached_at: string
}

export type CachedRMRequest = {
  id: string
  org_id: string
  title: string
  status: string
  created_at: string
  cached_at: string
}

export type CachedShiftHandoff = {
  id: string
  org_id: string
  shift_date: string
  shift_type: string
  cached_at: string
}

export type CachedDailySummary = {
  id: string
  org_id: string
  summary_date: string
  lp_completed: boolean
  rm_opened: number
  rm_resolved: number
  cached_at: string
}

// ── DB open / upgrade ─────────────────────────────────────────────────────────

let dbPromise: Promise<IDBPDatabase> | null = null

export function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // organizations
        if (!db.objectStoreNames.contains('organizations')) {
          const orgStore = db.createObjectStore('organizations', { keyPath: 'id' })
          orgStore.createIndex('owner_email', 'owner_email')
        }

        // users
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' })
          userStore.createIndex('auth_id', 'auth_id')
          userStore.createIndex('org_id', 'org_id')
          userStore.createIndex('email', 'email')
        }

        // lp_audits
        if (!db.objectStoreNames.contains('lp_audits')) {
          const auditStore = db.createObjectStore('lp_audits', { keyPath: 'id' })
          auditStore.createIndex('org_id', 'org_id')
          auditStore.createIndex('audit_date', 'audit_date')
          auditStore.createIndex('completed_at', 'completed_at')
        }

        // rm_requests
        if (!db.objectStoreNames.contains('rm_requests')) {
          const rmStore = db.createObjectStore('rm_requests', { keyPath: 'id' })
          rmStore.createIndex('org_id', 'org_id')
          rmStore.createIndex('status', 'status')
          rmStore.createIndex('created_at', 'created_at')
        }

        // shift_handoffs
        if (!db.objectStoreNames.contains('shift_handoffs')) {
          const handoffStore = db.createObjectStore('shift_handoffs', { keyPath: 'id' })
          handoffStore.createIndex('org_id', 'org_id')
          handoffStore.createIndex('shift_date', 'shift_date')
        }

        // daily_summaries
        if (!db.objectStoreNames.contains('daily_summaries')) {
          const summaryStore = db.createObjectStore('daily_summaries', { keyPath: 'id' })
          summaryStore.createIndex('org_id', 'org_id')
          summaryStore.createIndex('summary_date', 'summary_date')
        }
      },
    })
  }
  return dbPromise
}

// ── Generic CRUD helpers ───────────────────────────────────────────────────────

export async function putRecord<T extends { id: string }>(
  storeName: StoreName,
  record: T
): Promise<void> {
  const db = await getDB()
  await db.put(storeName, record)
}

export async function getRecord<T>(
  storeName: StoreName,
  id: string
): Promise<T | undefined> {
  const db = await getDB()
  return db.get(storeName, id) as Promise<T | undefined>
}

export async function getAllByIndex<T>(
  storeName: StoreName,
  indexName: string,
  value: string
): Promise<T[]> {
  const db = await getDB()
  return db.getAllFromIndex(storeName, indexName, value) as Promise<T[]>
}

export async function deleteRecord(storeName: StoreName, id: string): Promise<void> {
  const db = await getDB()
  await db.delete(storeName, id)
}

export async function clearStore(storeName: StoreName): Promise<void> {
  const db = await getDB()
  await db.clear(storeName)
}
