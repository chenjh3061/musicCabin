import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    cartList: []
  }),
  
  getters: {
    cartMap: (state) => {
      const map = {}
      state.cartList.forEach(item => {
        map[item.id] = item.count
      })
      return map
    },
    
    totalCount: (state) => {
      return state.cartList.reduce((total, item) => total + item.count, 0)
    },
    
    totalPrice: (state) => {
      return state.cartList.reduce((total, item) => total + (item.price * item.count), 0)
    },
    
    cartList: (state) => state.cartList
  },
  
  actions: {
    addToCart(item) {
      const existingItem = this.cartList.find(i => i.id === item.id)
      if (existingItem) {
        existingItem.count += 1
      } else {
        this.cartList.push({ ...item, count: 1 })
      }
    },
    
    decreaseCart(item) {
      const existingItem = this.cartList.find(i => i.id === item.id)
      if (existingItem) {
        if (existingItem.count > 1) {
          existingItem.count -= 1
        } else {
          this.cartList = this.cartList.filter(i => i.id !== item.id)
        }
      }
    },
    
    clearCart() {
      this.cartList = []
    }
  },
  
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'cart',
        storage: localStorage
      }
    ]
  }
})