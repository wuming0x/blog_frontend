# 个人博客系统前端

基于 Vue 3 + Vite 的个人博客系统前端项目，提供文章浏览、登录注册、文章发布编辑、评论互动和隐藏管理员用户管理页面。

## 技术栈

- Vue 3
- Vue Router
- Pinia
- Vite
- Fetch API

## 主要功能

- 首页文章列表展示
- 用户注册、登录和退出
- 登录用户发布、编辑、删除自己的文章
- 文章详情和评论发布
- 管理员可管理所有文章、评论和用户
- 隐藏管理员用户管理页：`/admin/users`

## 开发环境要求

- Node.js `^20.19.0 || >=22.12.0`
- npm
- 后端 Spring Boot 服务

## 部署环境要求

生产构建后前端为静态文件，可部署到 Nginx 或其他静态资源服务器。

- Nginx
- 后端 Spring Boot 服务
- 将 `dist/` 目录作为静态站点根目录
- 将 `/api` 请求反向代理到后端服务

## 安装依赖

```sh
npm install
```

## 本地开发

```sh
npm run dev
```

启动后按终端提示访问本地地址，通常为：

```text
http://localhost:5173
```

## 生产构建

```sh
npm run build
```

构建产物输出到：

```text
dist/
```

## 预览构建结果

```sh
npm run preview
```

## 代码检查和格式化

```sh
npm run lint
npm run format
```

## 目录说明

```text
src/api/        接口请求封装
src/assets/     全局样式和静态资源
src/router/     前端路由配置
src/stores/     Pinia 状态管理
src/views/      页面组件
public/         favicon 等公开静态资源
```
