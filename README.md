# MatrixOne Intelligence - 连接器管理平台

这是一个基于 React + TypeScript + Vite 构建的数据连接器管理前端应用。

## 功能特性

- 📊 连接器列表管理
- 🔍 搜索和筛选功能
- 📝 创建和管理数据连接器
- 🎨 现代化的UI设计
- 📱 响应式布局

## 技术栈

- React 18
- TypeScript
- Vite
- CSS3

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
src/
├── components/          # React组件
│   ├── Header.tsx      # 顶部导航栏
│   ├── Sidebar.tsx     # 左侧导航栏
│   ├── ConnectorList.tsx # 连接器列表页面
│   └── Layout.tsx      # 布局组件
├── App.tsx             # 主应用组件
└── main.tsx            # 应用入口
```

## 组件说明

### Header
顶部导航栏，包含：
- Logo和品牌名称
- 工作区切换
- 用户头像和设置

### Sidebar
左侧导航栏，包含：
- 主要功能菜单
- 子菜单展开/折叠
- 底部辅助功能

### ConnectorList
连接器列表页面，包含：
- 搜索框
- 创建按钮
- 数据表格（当前为空状态）

## 开发说明

所有组件都使用函数式组件和React Hooks编写，样式使用CSS模块化方式组织。
