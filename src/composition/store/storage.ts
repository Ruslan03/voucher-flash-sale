import createWebStorage from 'redux-persist/lib/storage/createWebStorage'

interface WebStorageLike {
  getItem(key: string): Promise<string | null>
  setItem(key: string, item: string): Promise<void>
  removeItem(key: string): Promise<void>
}

const createNoopStorage = (): WebStorageLike => {
  return {
    getItem() {
      return Promise.resolve(null)
    },
    setItem() {
      return Promise.resolve()
    },
    removeItem() {
      return Promise.resolve()
    },
  }
}

const storage: WebStorageLike =
  typeof window !== 'undefined'
    ? createWebStorage('local')
    : createNoopStorage()

export default storage
