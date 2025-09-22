
# 运维管理控制台 (React + Vite + Fluent UI)

一个示例性的运维管理控制台前端项目，展示：
-- React 19 + Vite 构建
-- Fluent UI v9 组件库统一的 UI 体验
-- React Router (懒加载 + 受保护路由 + 403/404)
-- 权限模型：角色 -> 权限 (menu 基于 required 权限渲染)
-- Zustand 轻量全局状态 (含用户持久化 localStorage)
-- Mock API / 环境变量控制 (支持真实后端切换)
-- 通用表格组件 `DataTable` (排序 / 分页 / 选择 / 导出 / 空状态 / a11y)
-- 可配置菜单 + 自动面包屑
-- 单元测试 (Vitest + React Testing Library)
-- ErrorBoundary 全局错误兜底

## 目录结构
```
src/
  api/                # 统一 API 模块 (mock + fetch)
  assets/             # 静态资源
  components/         # 通用组件 (Header / Sidebar / Breadcrumbs / DataTable / Loading / ErrorMessage / ErrorBoundary)
  config/             # 菜单与权限 (menuConfig / permissions)
  layouts/            # 布局组件 (AdminLayout)
  pages/              # 业务页面 (按领域分子目录：hosts / services / logs / users / settings 等)
  router/             # 路由定义 (懒加载)
  store/              # 全局状态 (Zustand)
  utils/              # 工具函数 (formatDate / validateEmail)
  main.jsx            # 应用入口，包裹 Provider / ErrorBoundary
  App.jsx             # 挂载 Router
```

## 运行 & 开发
### 安装依赖
```
yarn install
```
或
```
npm install
```

### 启动开发服务器
```
yarn dev
```
默认地址：http://localhost:5173

### 构建生产包
```
yarn build
```

### 预览生产构建
```
yarn preview
```

## 环境变量
项目使用 Vite 前缀变量：
- `VITE_USE_MOCK`：控制是否使用内置 mock，非 `'false'` 值都视为启用（默认启用）
- `VITE_API_BASE_URL`：真实后端服务地址（当 mock 关闭时生效）

示例在 .env.example 中：
```
 可配置菜单 + 自动面包屑（运行时 i18nKey 翻译）
VITE_USE_MOCK=true
```
复制为 `.env` 后可按需调整。
### DataTable 列显隐 & 导出可见列
示例：
```
<DataTable
  columns={cols}
  data={rows}
  columnVisibility={{ storageKey:'hosts_cols', defaultVisibleKeys:['name','ip'] }}
  exportOptions={{ enabled:true, respectVisibility:true }}
/>
```
- 所有 fetchXxx / updateXxx / createXxx 函数根据 `isMock` 分流

## 路由 / 权限 / 面包屑
### 动态路由生成
`router/index.jsx` 由 `menuTree` 动态生成全部受保护业务路由：
1. `menuConfig` 是单一数据源：`key / path / required / i18nKey`
2. `flattenMenu(menuTree)` 过滤出包含 `path` 的叶子，映射为 `<Route>`
3. 首页使用 `index`，其它通过去掉前导斜杠作为子路径
4. 懒加载映射放在 `lazyMap`，新增页面只需：
  - 在 `menuTree` 中添加一条带 `path` 的记录
  - 在 `lazyMap` 注册路径 -> 动态 import  (后续可自动化)

这样 Breadcrumbs / Sidebar / 权限守卫共享同一配置，减少重复维护。

### Sidebar 分类展开持久化
侧边栏支持父分类点击展开/折叠：
- 状态存储：`localStorage['sidebar.openCategories']`
- 初始：若当前路径属于某分类，自动展开该分类
- 切换：点击分类标题（`NavCategoryItem`）
- 无障碍：加入 `aria-expanded` 标记；指示符使用 ▾ / ▸

## 国际化 (运行时方案)
当前：
- 轻量 `t(key)` + 内置 zh-CN 词典
- 菜单使用 `i18nKey`（运行时翻译）
- Header 提供语言切换 (zh-CN / en-US)
- DataTable 导出/列配置按钮已接入 t()

扩展：
```
import { addMessages, setLocale } from './i18n';
addMessages('en-US', { 'menu.dashboard': 'Dashboard' });
setLocale('en-US');
```

后续可平滑迁移到 react-intl / lingui，保持 key 不变；支持按语言代码拆分与懒加载。
- 使用 `React.lazy` + `Suspense` 对页面代码分包
- `RequireAuth` 保护业务根；未登录跳转 `/login`
- `RequirePermission` 基于菜单项 `required` 权限数组进行 403 判定
- `/403` 提供无权限页面
- 面包屑：`Breadcrumbs` 通过 `flattenMenu + findMenuByPath` 自适应生成层级

### 权限模型
文件：`src/config/permissions.js`

```
export const PERMISSIONS = { HOSTS_READ: 'hosts.read', ... };
export const rolePolicies = {
  admin: ['*'],
  auditor: ['dashboard.view','logs.read', ...],
  operator: [...],
  viewer: ['dashboard.view','profile.view']
};
```

菜单项在 `menuConfig.js` 使用 `required: [PERMISSIONS.HOSTS_READ]` 字段；Sidebar 过滤逻辑与路由守卫共享同一套 required 数组。`'*'` 代表全权限。

如需后端下发：可在登录后请求权限列表覆盖 `rolePolicies[role]` 或直接给 user.permissions，并调整 `getPermissionsByRole`。

#### 动态权限覆盖
支持在用户对象加入 `permissions: string[]`：
```
// 合并模式（默认） viewer 基础权限 + 自定义追加
{ role:'viewer', permissions:['users.read'] }
// 覆盖模式
getEffectivePermissions(user, { override:true })
// 通配符
{ role:'viewer', permissions:['*'] } // 拥有所有权限
```
前端通过 `getEffectivePermissions(user)` 计算最终权限集合。

## 全局错误兜底
`components/ErrorBoundary.jsx` 捕获渲染错误并展示回退界面；在 main.jsx 中包裹 `<App/>`。

## 通用组件
- `Loading`：统一 Spinner + 文本
- `ErrorMessage`：统一错误样式与可选重试
- `Breadcrumbs`：根据当前路径匹配菜单链
- `Sidebar`：根据权限过滤；支持 `section: 'extra'` 分区
- `DataTable`：列 schema 驱动：
  - props: `columns`, `data`, `pageSize`, `onPageChange`, `onSelectionChange`
  - 功能: 排序(单列) / 分页 / 多选 / 导出 CSV & JSON / 空状态 / 可访问性 (`aria-sort`)
  - 待扩展: 列显隐、服务端分页、列宽拖拽

## 状态管理 (Zustand)
`store/index.js`：
- `user` 持久化 localStorage
- `setUser` 负责写入/清除
后续可分拆：`createAuthSlice` / `createUIStateSlice` 等分模块。

## 表格与 UI 一致性
已将多个页面接入统一 Fluent UI 风格；`DataTable` 作为抽象中心。已实现：排序、分页、选择、列显隐、尊重可见列导出。

## 测试
栈：Vitest + React Testing Library。

现有覆盖：
- `Breadcrumbs`：路径 -> 面包屑链
- `DataTable`：排序/选择/空状态
- `roles` 与 `mockLogin` 工具
- `Loading` / `utils`

待补充：Sidebar 权限过滤 & 激活态测试（计划使用 mock Router 与 stub Icon）。

## 后续可扩展建议
- DataTable 列显隐 / 服务端分页 / 列宽拖拽
- 国际化 (首期内置简易字典，后替换为 i18n 框架)
- 细粒度权限动态下发 (user.permissions 覆盖 rolePolicies)
- Sidebar 测试完善 & 可折叠/搜索
- 主题 / 暗色模式切换
- 性能优化：路由级 prefetch / 图标按需加载

<!-- 旧“国际化 (规划)”章节已合并进上方运行时方案，保持单一来源 -->

## License
本示例只作为学习演示用途，可自由复用/修改。
# fluentui-admin
