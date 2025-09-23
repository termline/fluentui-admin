
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

## Sidebar 设计说明

### 分类与数据来源
侧边导航的唯一数据来源是 `menuConfig.js` 中的 `menuTree`：
- 字段：`key / label / i18nKey / path? / required / icon / children? / section?`
- `section: 'extra'` 的叶子被归入底部“其他”分区，其余放在主区。
- 仅叶子节点（具备 `path`）生成实际路由与可点击导航；父级只作为逻辑分组（分类手风琴）。

### 权限过滤
渲染前通过：
```js
filterMenu(menuTree, permissionsSet)
```
过滤掉当前用户不具备全部 `required` 权限的节点；对有子节点的父级，若子节点全部被过滤，该父级也被剔除（避免空分类）。

### 动态路由与面包屑复用
`router/index.jsx` 基于同一份 `menuTree` 构建懒加载路由，`Breadcrumbs` 同样通过扁平化结构衍生——实现“单一配置，多处消费”。

### 展开/折叠与持久化
分类采用自定义受控手风琴（button + `aria-expanded` + 内容容器 `role=region`），状态结构：
```
openCategories: Set<string>
localStorage key: 'sidebar.openCategories'
```
初次渲染时：若当前 `location.pathname` 属于某分类的子节点，则自动将该分类加入展开集合，实现“刷新后仍保持当前上下文”。

### 激活态与内置竖条
不额外绘制自定义竖条（曾尝试 ::before 后撤销），完全依赖 Fluent UI `NavItem/NavSubItem` 的激活样式：
- 通过设置 `aria-current="page"` 给匹配当前 `location.pathname` 的叶子菜单项；
- 主题会在对应项左侧/前方渲染内置蓝色指示（或高亮背景，取决于 Fluent UI 版本 token）；
- 未选中项不再出现指示条，避免视觉噪点。

### 图标 filled / regular 逻辑
菜单项 `icon` 字段结构：
```
icon: { filled: FilledIconComponent, regular: RegularIconComponent }
```
渲染时：
1. 叶子：当前路径激活则用 `filled`，否则 `regular`（若缺失 regular 则回退 filled）。
2. 分类父级：若任一子节点激活则使用 filled 版本以提示“组内有活动页面”。

### 无障碍 (a11y)
- 分类按钮：`aria-expanded` + `aria-controls` 指向对应内容容器 id。
- 激活叶子：`aria-current="page"` 提示屏幕阅读器当前所在页面。
- 键盘支持：Enter / Space 触发展开折叠（`onKeyDown` 拦截）。

### 选择放弃的实现方案
| 方案 | 说明 | 放弃原因 |
|------|------|---------|
| Fluent UI `NavCategory` (早期) | 内置分类结构 | 展开状态在特定嵌套下表现不稳定（子菜单不响应） |
| 自定义 ::before 竖条 | 强制所有激活项显示自绘蓝条 | 与 Fluent UI 原生激活视觉重复，增加样式维护成本 /
| 运行时递归反射路由模块名 | 动态匹配 import | 命名/路径变更易引入隐性错误，改为明确 `import.meta.glob` + 映射 |

### 扩展建议
- 添加“折叠全部/展开全部”操作。
- 支持侧边栏收起成仅图标（宽度收缩）。
- 分类内搜索（对长菜单）。
- 键盘上下箭头在同一分类内 roving tabindex 导航。
- 暗色主题适配（依赖 Fluent UI token 切换）。

### Nav 迁移记录 (2025-09)
为减少自定义样式与维护开销，Sidebar 从早期自建 Drawer + 手写手风琴结构迁移为官方 Fluent UI `<Nav>` 体系：

迁移要点：
- 用 `<Nav>` 包裹整体；叶子节点使用 `<NavItem>` / 二级（当前实现视为 `<NavSubItem>`）。
- 父级分类不直接使用内建折叠组件（官方未暴露手风琴 API），改为 `<NavSectionHeader>` + 自定义 `<button>` 控制内容显隐。
- 保留原有权限过滤 / i18n / localStorage 展开持久化逻辑。
- 移除自绘激活竖条 CSS，回归 Fluent UI 内置激活视觉；仅通过设置 `aria-current="page"` 即可。
- 分类图标与叶子图标共用 filled/regular 策略：如果分类任一子项激活则使用 filled 版本，提供组级上下文提示。
- Unicode 箭头指示符替换为 Fluent UI `ChevronRight16Regular` / `ChevronDown16Regular`，视觉与组件库一致。

收益：
- 代码复杂度下降（减少自定义 DOM 结构 & 伪元素）。
- 与 Fluent UI 主题 / 未来 Token 体系兼容性更好。
- a11y 语义更清晰（NavItem 的 `aria-current` 处理由库接管）。

潜在注意：
- 如未来 Fluent UI 提供原生 collapsible section API，可再次精简自定义折叠按钮。
- 需关注版本升级时 Nav 结构或 className 变更带来的测试影响。


---
以上设计文档补充了 Sidebar 的核心决策背景，方便后续维护及新成员理解。

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
