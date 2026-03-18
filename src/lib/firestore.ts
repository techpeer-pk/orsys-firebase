import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  serverTimestamp,
  QueryConstraint,
  DocumentSnapshot,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'

// ─── Collection names ───────────────────────────────
export const COLLECTIONS = {
  VOUCHERS: 'vouchers',
  HEADS:    'heads',
  USERS:    'users',
} as const

// ─── Types ──────────────────────────────────────────
export type PaymentMode   = 'cash' | 'cheque' | 'online_transfer' | 'bank_deposit'
export type PaymentStatus = 'pending' | 'cleared' | 'cancelled'
export type UserRole      = 'admin' | 'manager' | 'cashier' | 'reports'

export interface Denomination {
  noteValue: number
  quantity:  number
  subtotal:  number
}

export interface Voucher {
  id:            string
  slipNo:        number
  paymentFrom:   string
  pointPerson:   string
  paymentMode:   PaymentMode
  paymentStatus: PaymentStatus
  totalAmount:   number
  denominations: Denomination[]
  headId?:       string
  headName?:     string
  remarks?:      string
  entryDate:     Timestamp
  createdAt:     Timestamp
  createdById:   string
  createdByName: string
  updatedAt?:    Timestamp
  updatedById?:  string
}

export interface Head {
  id:          string
  name:        string
  code:        string
  category:    string
  description?: string
  status:      'active' | 'inactive'
  createdAt:   Timestamp
}

export interface AppUser {
  id:     string
  name:   string
  email:  string
  role:   UserRole
  status: 'active' | 'inactive'
}

// ─── Voucher helpers ─────────────────────────────────

export type VoucherPayload = Omit<Voucher, 'id' | 'createdAt' | 'updatedAt'>

// Get next slip number
export async function getNextSlipNo(): Promise<number> {
  const q = query(
    collection(db, COLLECTIONS.VOUCHERS),
    orderBy('slipNo', 'desc'),
    limit(1)
  )
  const snap = await getDocs(q)
  if (snap.empty) return 1
  return (snap.docs[0].data().slipNo as number) + 1
}

// List vouchers with filters
export interface VoucherFilter {
  status?: PaymentStatus
  from?:   Date
  to?:     Date
  limit?:  number
  after?:  DocumentSnapshot
}

export async function listVouchers(filters: VoucherFilter = {}) {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')]

  if (filters.status) constraints.push(where('paymentStatus', '==', filters.status))
  if (filters.from)   constraints.push(where('entryDate', '>=', Timestamp.fromDate(filters.from)))
  if (filters.to)     constraints.push(where('entryDate', '<=', Timestamp.fromDate(filters.to)))

  constraints.push(limit(filters.limit ?? 20))
  if (filters.after)  constraints.push(startAfter(filters.after))

  const snap = await getDocs(query(collection(db, COLLECTIONS.VOUCHERS), ...constraints))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Voucher))
}

export async function getVoucher(id: string): Promise<Voucher | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.VOUCHERS, id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Voucher
}

export async function getVoucherBySlip(slipNo: number): Promise<Voucher | null> {
  const q    = query(collection(db, COLLECTIONS.VOUCHERS), where('slipNo', '==', slipNo), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) return null
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Voucher
}

export async function createVoucher(payload: Omit<VoucherPayload, 'slipNo' | 'createdAt'>): Promise<string> {
  const slipNo = await getNextSlipNo()
  const ref = await addDoc(collection(db, COLLECTIONS.VOUCHERS), {
    ...payload,
    slipNo,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateVoucher(id: string, payload: Partial<VoucherPayload>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.VOUCHERS, id), {
    ...payload,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteVoucher(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.VOUCHERS, id))
}

// ─── Head helpers ─────────────────────────────────

export async function listHeads(status: 'active' | 'inactive' = 'active'): Promise<Head[]> {
  const q    = query(collection(db, COLLECTIONS.HEADS), where('status', '==', status), orderBy('name'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Head))
}

export async function createHead(payload: Omit<Head, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.HEADS), {
    ...payload,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateHead(id: string, payload: Partial<Head>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.HEADS), payload)
}

export async function deactivateHead(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.HEADS, id), { status: 'inactive' })
}

// ─── User profile (stored in Firestore, not Auth) ──

export async function getAppUser(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as AppUser
}

export async function upsertAppUser(uid: string, data: Partial<AppUser>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), data).catch(async () => {
    // If doesn't exist, use setDoc via writeBatch
    const batch = writeBatch(db)
    batch.set(doc(db, COLLECTIONS.USERS, uid), { ...data, createdAt: serverTimestamp() })
    await batch.commit()
  })
}

export async function listAppUsers(): Promise<AppUser[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.USERS))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as AppUser))
}
