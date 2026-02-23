# Pipeline Configuration Module

## Goal

实现流水线配置功能,作为整个系统的基础模块.流水线定义了任务(工单)的节点流程.

## Requirements

### 数据模型

**Pipeline (流水线)**
- id: 唯一标识
- name: 流水线名称 (唯一)
- description: 描述
- isDefault: 是否默认流水线 (只能有一个)
- isActive: 是否启用

**PipelineNode (流水线节点)**
- id: 唯一标识
- pipelineId: 所属流水线
- nodeName: 节点名称
- nodeType: 节点类型 (枚举)
- order: 排序序号
- isRequired: 是否必需节点

**NodeType 枚举**
- dev: 研发
- code_review: 代码评审
- arch_review: 架构评审
- admission: 准入验证
- test: 测试
- product_accept: 产品验收
- business_accept: 业务验收
- integration: 集成
- release: 发布
- finish: 完成

### API 接口

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/pipelines | 获取流水线列表 |
| POST | /api/pipelines | 创建流水线 |
| GET | /api/pipelines/[id] | 获取流水线详情(含节点) |
| PUT | /api/pipelines/[id] | 更新流水线 |
| DELETE | /api/pipelines/[id] | 删除流水线 |

### 业务规则

1. 流水线名称必须唯一
2. 只能有一个默认流水线
3. 删除流水线时级联删除节点
4. 节点按 order 排序

## Acceptance Criteria

- [ ] Prisma schema 定义 Pipeline 和 PipelineNode 模型
- [ ] 实现流水线 CRUD API
- [ ] 创建流水线时可同时创建节点
- [ ] 默认流水线唯一性校验
- [ ] Seed 脚本创建默认流水线数据

## Technical Notes

- 数据库: SQLite + Prisma
- 框架: Next.js App Router
- 验证: Zod
