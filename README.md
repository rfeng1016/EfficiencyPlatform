# 效率平台 (Efficiency Platform)

基于 Next.js 的效率管理平台，用于管理流水线和工作流。

## 技术栈

- **框架**: Next.js 15.1.7
- **运行时**: React 19
- **数据库**: Prisma ORM + SQLite
- **语言**: TypeScript
- **验证**: Zod

## 项目结构

```
src/
├── app/              # Next.js App Router
│   ├── api/         # API 路由
│   └── page.tsx     # 主页面
├── lib/
│   ├── db/          # 数据库配置
│   ├── services/    # 业务逻辑服务
│   ├── types/       # TypeScript 类型定义
│   ├── utils/       # 工具函数
│   └── validators/  # Zod 验证模式
prisma/
├── schema.prisma    # 数据库模式
└── seed.ts          # 数据库种子数据
```

## 快速开始

### 前置要求

- Node.js 20+
- npm 或 yarn

### 安装步骤

1. 克隆仓库：
```bash
git clone https://github.com/rfeng1016/EfficiencyPlatform.git
cd EfficiencyPlatform
```

2. 安装依赖：
```bash
npm install
```

3. 配置环境变量：
```bash
cp .env.example .env
```

4. 初始化数据库：
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

5. 启动开发服务器：
```bash
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm start` - 启动生产服务器
- `npm run lint` - 运行 ESLint 检查
- `npm run db:generate` - 生成 Prisma 客户端
- `npm run db:push` - 推送数据库模式变更
- `npm run db:seed` - 填充数据库种子数据

## API 接口

### 流水线 (Pipelines)

- `GET /api/pipelines` - 获取所有流水线列表
- `POST /api/pipelines` - 创建新流水线
- `GET /api/pipelines/[id]` - 根据 ID 获取流水线
- `PUT /api/pipelines/[id]` - 更新流水线
- `DELETE /api/pipelines/[id]` - 删除流水线

## 许可证

私有项目
