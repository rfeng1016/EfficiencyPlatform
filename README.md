# 效率平台 (Efficiency Platform)

基于 Next.js 的企业级效率管理平台，提供流水线编排、工作流管理、任务队列和实时指标监控等功能。

## ✨ 核心功能

- 🔄 **流水线管理** - 创建和管理多阶段流水线配置
- 📊 **工作流引擎** - 支持复杂的工作流编排和状态转换
- 🎯 **任务队列** - 高效的任务队列管理系统
- 🚪 **门控系统** - 灵活的流程门控和验证机制
- 📈 **实时指标** - 全面的性能指标和统计分析
- 🎨 **现代 UI** - 基于 Tailwind CSS 的响应式界面

## 🛠 技术栈

### 核心框架
- **Next.js** 15.1.7 - React 全栈框架
- **React** 19.0.0 - UI 库
- **TypeScript** 5.x - 类型安全

### 样式
- **Tailwind CSS** 4.2.1 - 原子化 CSS 框架
- **PostCSS** 8.5.6 - CSS 处理工具

### 数据层
- **Prisma** 6.4.1 - 现代化 ORM
- **SQLite** - 轻量级数据库
- **Zod** 3.24.2 - 运行时类型验证

### 开发工具
- **ESLint** - 代码质量检查
- **tsx** - TypeScript 执行器

## 📁 项目结构

```
src/
├── app/                      # Next.js App Router
│   ├── api/                 # API 路由
│   │   ├── pipelines/       # 流水线 API
│   │   ├── workflow/        # 工作流 API
│   │   ├── gates/           # 门控 API
│   │   ├── queues/          # 队列 API
│   │   └── metrics/         # 指标 API
│   ├── workflow/            # 工作流页面
│   │   └── [id]/           # 工作流详情
│   ├── metrics/             # 指标仪表板
│   ├── layout.tsx           # 根布局
│   ├── page.tsx             # 首页
│   ├── error.tsx            # 错误页面
│   ├── loading.tsx          # 加载状态
│   └── not-found.tsx        # 404 页面
├── components/              # React 组件
│   ├── ui/                  # UI 组件库
│   │   ├── Badge.tsx       # 徽章组件
│   │   ├── Button.tsx      # 按钮组件
│   │   ├── Card.tsx        # 卡片组件
│   │   ├── Stat.tsx        # 统计组件
│   │   └── Table.tsx       # 表格组件
│   ├── AppShell.tsx        # 应用外壳
│   └── ToastProvider.tsx   # 通知提供者
└── lib/                     # 核心库
    ├── db/                  # 数据库配置
    │   └── prisma.ts       # Prisma 客户端
    ├── services/            # 业务逻辑层
    │   ├── pipeline.service.ts
    │   └── workflow.service.ts
    ├── types/               # TypeScript 类型
    │   ├── pipeline.types.ts
    │   └── workflow.types.ts
    ├── utils/               # 工具函数
    │   ├── errors.ts       # 错误处理
    │   └── response.ts     # 响应格式化
    └── validators/          # Zod 验证模式
        ├── pipeline.schema.ts
        └── workflow.schema.ts

prisma/
├── schema.prisma            # 数据库模式定义
└── seed.ts                  # 数据库种子数据
```

## 🚀 快速开始

### 前置要求

- Node.js 20.x 或更高版本
- npm 或 yarn 或 pnpm

### 安装步骤

1. **克隆仓库**
```bash
git clone https://github.com/rfeng1016/EfficiencyPlatform.git
cd EfficiencyPlatform
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env
```

编辑 `.env` 文件，配置数据库连接等信息。

4. **初始化数据库**
```bash
# 生成 Prisma 客户端
npm run db:generate

# 推送数据库模式
npm run db:push

# 填充种子数据（可选）
npm run db:seed
```

5. **启动开发服务器**
```bash
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📜 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（端口 3000） |
| `npm run build` | 构建生产版本 |
| `npm start` | 启动生产服务器 |
| `npm run lint` | 运行 ESLint 代码检查 |
| `npm run db:generate` | 生成 Prisma 客户端代码 |
| `npm run db:push` | 推送数据库模式变更到数据库 |
| `npm run db:seed` | 填充数据库种子数据 |

## 🔌 API 接口

### 流水线管理 (Pipelines)

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/pipelines` | 获取所有流水线列表 |
| `POST` | `/api/pipelines` | 创建新流水线 |
| `GET` | `/api/pipelines/[id]` | 根据 ID 获取流水线详情 |
| `PUT` | `/api/pipelines/[id]` | 更新指定流水线 |
| `DELETE` | `/api/pipelines/[id]` | 删除指定流水线 |

### 工作流管理 (Workflow)

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/workflow` | 获取工作流列表 |
| `POST` | `/api/workflow` | 创建新工作流 |
| `GET` | `/api/workflow/[id]` | 获取工作流详情 |
| `PUT` | `/api/workflow/[id]` | 更新工作流 |
| `POST` | `/api/workflow/gate` | 执行门控验证 |

### 门控管理 (Gates)

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/gates` | 获取门控列表 |
| `POST` | `/api/gates` | 创建新门控 |

### 队列管理 (Queues)

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/queues` | 获取队列列表 |
| `POST` | `/api/queues` | 创建新队列 |
| `GET` | `/api/queues/items` | 获取队列项 |
| `POST` | `/api/queues/[id]/items` | 添加队列项 |

### 指标统计 (Metrics)

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/metrics` | 获取系统指标统计 |

## 🎨 UI 组件

项目包含一套完整的 UI 组件库：

- **Badge** - 状态徽章（成功、警告、错误等）
- **Button** - 多种样式的按钮组件
- **Card** - 卡片容器组件
- **Stat** - 统计数据展示组件
- **Table** - 数据表格组件
- **AppShell** - 应用布局外壳
- **ToastProvider** - 全局通知系统

## 🗄️ 数据模型

主要数据模型包括：

- **Pipeline** - 流水线配置
- **Workflow** - 工作流实例
- **Task** - 任务节点
- **Gate** - 门控规则
- **Queue** - 任务队列
- **QueueItem** - 队列项

详细的数据模型定义请查看 `prisma/schema.prisma`。

## 🔧 开发指南

### 添加新的 API 路由

在 `src/app/api/` 目录下创建新的路由文件：

```typescript
// src/app/api/your-route/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // 处理 GET 请求
  return NextResponse.json({ data: 'your data' });
}
```

### 添加新的服务

在 `src/lib/services/` 目录下创建服务文件：

```typescript
// src/lib/services/your.service.ts
import { prisma } from '@/lib/db/prisma';

export class YourService {
  async getData() {
    return await prisma.yourModel.findMany();
  }
}
```

### 添加新的验证模式

在 `src/lib/validators/` 目录下使用 Zod 定义验证模式：

```typescript
// src/lib/validators/your.schema.ts
import { z } from 'zod';

export const yourSchema = z.object({
  name: z.string().min(1),
  // 更多字段...
});
```

## 📝 许可证

私有项目 - 保留所有权利

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题或建议，请通过 GitHub Issues 联系。
