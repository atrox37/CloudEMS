import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import viteCompression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'
import autoprefixer from 'autoprefixer'

import pxtorem from 'postcss-pxtorem'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(), // 注释掉这行可以禁用Vue DevTools
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      resolvers: [
        ElementPlusResolver({
          importStyle: 'sass',
        }),
      ],
      dts: true,
    }),
    Components({
      resolvers: [
        ElementPlusResolver({
          importStyle: 'sass',
        }),
      ],
      dts: true,
    }),
    // Gzip压缩插件（不压缩图片文件）
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // 10KB以上才压缩
      algorithm: 'gzip',
      ext: '.gz',
      // 只压缩非图片文件
      filter: (file) => {
        // 不压缩常见图片格式
        return !/\.(png|jpe?g|gif|svg|webp|avif|bmp|ico)$/i.test(file)
      },
    }),
    // 打包分析插件
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      emitFile: false,
    }),
  ],
  server: {
    host: '0.0.0.0', // 允许外部访问
    port: 5173, // 指定端口号
    open: true, // 自动打开浏览器
    proxy: {
      '/user-app': {
        target: 'http://192.168.40.114:9000',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 如果需要全局 SCSS 变量，可以在这里添加
        // additionalData: `@use "@/assets/styles/variables.scss" as *;`,
      },
    },
    postcss: {
      plugins: [
        // 自动添加浏览器前缀
        autoprefixer({
          overrideBrowserslist: [
            'last 2 versions',
            '> 1%',
            'iOS 7',
            'last 3 iOS versions',
            'Android >= 4.0',
          ],
          flexbox: 'no-2009',
        }),
        // // px 转 rem
        pxtorem({
          rootValue: 100, // 根元素字体大小，与HTML中的设置保持一致
          unitPrecision: 5, // 转换后的小数点位数
          propList: ['*'], // 需要转换的属性，*表示所有属性
          selectorBlackList: [
            /^\.no-rem/, // 不转换的类名
          ],
          replace: true, // 是否替换原来的值
          mediaQuery: false, // 是否转换媒体查询中的 px
          minPixelValue: 1, // 小于这个值的 px 不转换
          exclude: /node_modules|EnergyBg\.vue/i, // 排除 node_modules 文件夹和 EnergyBg.vue 文件
        }),
      ],
    },
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'element-plus', 'axios', 'echarts'],
  },
  // 构建配置
  build: {
    // 确保CSS正确处理
    cssCodeSplit: true,
    // 生成sourcemap用于调试
    sourcemap: false,
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 移除console
        drop_debugger: true, // 移除debugger
      },
    },
  },
})
