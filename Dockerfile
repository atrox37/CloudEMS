# ---- Build stage ----
    FROM node:22-alpine AS builder

    WORKDIR /app
    
    # 先拷贝锁文件和 package.json，充分利用缓存
    COPY package.json pnpm-lock.yaml ./
    # postinstall 会执行该脚本；须在安装依赖前存在，否则 pnpm install 失败
    COPY scripts/setup-git-hooks.mjs scripts/setup-git-hooks.mjs
    
    # 不用 corepack，直接装指定版本 pnpm
    RUN npm install -g pnpm@10.15.1
    
    # 安装依赖（严格按锁文件）
    RUN pnpm install --frozen-lockfile
    
    # 拷贝源码并构建
    COPY . .
    RUN pnpm run build
    
    # ---- Runtime stage ----
    FROM nginx:alpine
    # 不再内置 nginx.conf，运行时通过卷挂载使用 EC2 上的配置
    # COPY nginx.conf /etc/nginx/conf.d/default.conf
    COPY --from=builder /app/dist /usr/share/nginx/html
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]
    