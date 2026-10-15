FROM node:24-alpine
# 当前文件：只部署网易云接口，不构建或安装 Electron。
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund
COPY server.cjs ./
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000 ENABLE_GENERAL_UNBLOCK=false CORS_ALLOW_ORIGIN=https://localhost
USER node
EXPOSE 3000
CMD ["node", "server.cjs"]
