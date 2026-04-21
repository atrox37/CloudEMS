import { type DirectiveBinding } from 'vue'
import { useUserStore } from '@/stores/user'

const permissionDirective = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string[]>) {
    const allowedRoles = binding.value
    const userStore = useUserStore()
    const userRole = userStore.roles

    if (!userRole || !allowedRoles.includes(userRole[0])) {
      const parent = el.parentNode
      if (parent) {
        parent.removeChild(el)
      }
    }
  },
}

export { permissionDirective }
