declare module 'dayjs' {
  import type { PluginFunc } from 'dayjs'
  
  interface Dayjs {
    (date?: string | number | Date | Dayjs): Dayjs
    format(template?: string): string
    subtract(value: number, unit?: string): Dayjs
    add(value: number, unit?: string): Dayjs
    diff(date: string | number | Date | Dayjs, unit?: string): number
    extend(plugin: PluginFunc, option?: any): Dayjs
  }
  
  const dayjs: Dayjs & {
    extend(plugin: PluginFunc, option?: any): Dayjs
  }
  
  export default dayjs
  export type { PluginFunc }
  export type { Dayjs }
}

declare module 'dayjs/plugin/utc' {
  import type { PluginFunc } from 'dayjs'
  const plugin: PluginFunc
  export default plugin
}

declare module 'dayjs/plugin/timezone' {
  import type { PluginFunc } from 'dayjs'
  const plugin: PluginFunc
  export default plugin
}

declare module 'dayjs/plugin/relativeTime' {
  import type { PluginFunc } from 'dayjs'
  const plugin: PluginFunc
  export default plugin
}

declare module 'dayjs/locale/en' {
  const locale: string
  export default locale
}