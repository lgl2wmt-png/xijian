import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  AppRole,
  Order,
  OrderStatus,
  WorkerCertStatus,
  WorkerProfile,
  WorkerTrade,
} from '../types'
import { SEED_ORDERS, SEED_WORKERS } from './orderSeed'

const CHANNEL = 'xijian_orders_sync'
const STORAGE_KEY = 'xijian_order_store'

type OrderState = {
  orders: Order[]
  workers: WorkerProfile[]
  role: AppRole
  /** Simulated current user ids by role */
  clientId: string
  workerId: string
  setRole: (role: AppRole) => void
  listOrders: (status?: OrderStatus | OrderStatus[]) => Order[]
  getOrder: (id: string) => Order | undefined
  createOrder: (input: {
    title: string
    description: string
    budget: number
    trade: WorkerTrade
    clientId?: string
  }) => Order
  updateOrderStatus: (
    id: string,
    status: OrderStatus,
    patch?: Partial<Pick<Order, 'workerId'>>,
  ) => Order | undefined
  claimOrder: (id: string, workerId?: string) => Order | undefined
  setWorkerEnabled: (id: string, enabled: boolean) => void
  setWorkerCertStatus: (id: string, certStatus: WorkerCertStatus) => void
  resetDemoData: () => void
}

function nowIso() {
  return new Date().toISOString()
}

function nextOrderId(orders: Order[]) {
  return `ord_${orders.length + 1}_${Date.now().toString(36).slice(-4)}`
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: SEED_ORDERS.map((o) => ({ ...o })),
      workers: SEED_WORKERS.map((w) => ({ ...w })),
      role: 'client',
      clientId: 'client_demo',
      workerId: 'w1',

      setRole: (role) => set({ role }),

      listOrders: (status) => {
        const all = get().orders
        if (!status) return all
        const setStatus = new Set(Array.isArray(status) ? status : [status])
        return all.filter((o) => setStatus.has(o.status))
      },

      getOrder: (id) => get().orders.find((o) => o.id === id),

      createOrder: (input) => {
        const order: Order = {
          id: nextOrderId(get().orders),
          clientId: input.clientId ?? get().clientId,
          title: input.title.trim(),
          description: input.description.trim(),
          budget: Number(input.budget),
          trade: input.trade,
          status: 'pending_review',
          workerId: null,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        }
        set((s) => ({ orders: [order, ...s.orders] }))
        return order
      },

      updateOrderStatus: (id, status, patch) => {
        let updated: Order | undefined
        set((s) => ({
          orders: s.orders.map((o) => {
            if (o.id !== id) return o
            updated = {
              ...o,
              ...patch,
              status,
              updatedAt: nowIso(),
            }
            return updated
          }),
        }))
        return updated
      },

      claimOrder: (id, workerId) => {
        const wid = workerId ?? get().workerId
        const current = get().getOrder(id)
        if (!current || current.status !== 'open') return undefined
        return get().updateOrderStatus(id, 'in_progress', { workerId: wid })
      },

      setWorkerEnabled: (id, enabled) => {
        set((s) => ({
          workers: s.workers.map((w) =>
            w.id === id
              ? {
                  ...w,
                  enabled,
                  certStatus: enabled ? 'verified' : 'disabled',
                }
              : w,
          ),
        }))
      },

      setWorkerCertStatus: (id, certStatus) => {
        set((s) => ({
          workers: s.workers.map((w) =>
            w.id === id
              ? {
                  ...w,
                  certStatus,
                  enabled: certStatus === 'verified',
                }
              : w,
          ),
        }))
      },

      resetDemoData: () =>
        set({
          orders: SEED_ORDERS.map((o) => ({ ...o })),
          workers: SEED_WORKERS.map((w) => ({ ...w })),
        }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({
        orders: s.orders,
        workers: s.workers,
        role: s.role,
        clientId: s.clientId,
        workerId: s.workerId,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state?.workers) return
        state.workers = state.workers.map((w) => {
          if (w.certStatus) return w
          return {
            ...w,
            certStatus: w.enabled ? 'verified' : 'disabled',
          }
        })
      },
    },
  ),
)

/** Cross-tab sync within the same origin (same browser profile). */
if (typeof window !== 'undefined') {
  let applyingRemote = false

  const broadcast = (payload: unknown) => {
    try {
      const ch = new BroadcastChannel(CHANNEL)
      ch.postMessage(payload)
      ch.close()
    } catch {
      /* BroadcastChannel unsupported — persist alone still covers refresh */
    }
  }

  useOrderStore.subscribe((state) => {
    if (applyingRemote) return
    broadcast({
      orders: state.orders,
      workers: state.workers,
      role: state.role,
      clientId: state.clientId,
      workerId: state.workerId,
    })
  })

  try {
    const ch = new BroadcastChannel(CHANNEL)
    ch.onmessage = (ev) => {
      const data = ev.data as Partial<OrderState> | undefined
      if (!data?.orders) return
      applyingRemote = true
      useOrderStore.setState({
        orders: data.orders,
        workers: data.workers ?? useOrderStore.getState().workers,
        role: data.role ?? useOrderStore.getState().role,
        clientId: data.clientId ?? useOrderStore.getState().clientId,
        workerId: data.workerId ?? useOrderStore.getState().workerId,
      })
      applyingRemote = false
    }
  } catch {
    /* ignore */
  }

  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY || !e.newValue) return
    try {
      const parsed = JSON.parse(e.newValue) as { state?: Partial<OrderState> }
      if (!parsed.state?.orders) return
      applyingRemote = true
      useOrderStore.setState({
        orders: parsed.state.orders,
        workers: parsed.state.workers ?? useOrderStore.getState().workers,
        role: parsed.state.role ?? useOrderStore.getState().role,
        clientId: parsed.state.clientId ?? useOrderStore.getState().clientId,
        workerId: parsed.state.workerId ?? useOrderStore.getState().workerId,
      })
      applyingRemote = false
    } catch {
      /* ignore */
    }
  })
}
