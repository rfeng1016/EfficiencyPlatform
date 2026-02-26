import Link from "next/link";
import AppShell from "@/components/AppShell";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";

export default function Home() {
  return (
    <AppShell
      title="研发效能平台"
      description="工单流转、卡点检查、效能度量一站式管理。"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/workflow" className="block">
          <Card className="transition hover:shadow-md">
            <CardHeader title="工单管理" description="创建、查看和流转工单" />
            <CardBody className="text-sm text-gray-600">
              进入工单列表，创建新工单并查看节点与卡点检查。
            </CardBody>
          </Card>
        </Link>

        <Link href="/metrics" className="block">
          <Card className="transition hover:shadow-md">
            <CardHeader title="效能度量" description="看见整体与分布" />
            <CardBody className="text-sm text-gray-600">
              查看工单总览、状态分布、业务线与应用维度统计。
            </CardBody>
          </Card>
        </Link>
      </div>
    </AppShell>
  );
}
