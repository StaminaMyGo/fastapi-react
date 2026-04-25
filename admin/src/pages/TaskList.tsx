import { useState, useEffect } from "react";
import { Table, Tag, Spin, message, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { getTasksApi } from "../api/tasks";
import type { TaskItem } from "../api/tasks";

const statusColorMap: Record<string, string> = {
  draft: "default",
  open: "blue",
  closed: "orange",
  scheduled: "purple",
  published: "green",
};

const statusTextMap: Record<string, string> = {
  draft: "草稿",
  open: "填报中",
  closed: "已截止",
  scheduled: "已排班",
  published: "已发布",
};

export default function TaskList() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await getTasksApi();
      setTasks(data);
    } catch {
      message.error("获取排班任务列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const columns = [
    {
      title: "任务名称",
      dataIndex: "name",
      key: "name",
      width: 200,
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (val: string | null) => val || "-",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={statusColorMap[status]}>{statusTextMap[status] || status}</Tag>
      ),
    },
    {
      title: "填报截止",
      dataIndex: "deadline",
      key: "deadline",
      width: 180,
      render: (val: string) => new Date(val).toLocaleString("zh-CN"),
    },
    {
      title: "排班日期",
      key: "date_range",
      width: 200,
      render: (_: unknown, record: TaskItem) =>
        `${record.start_date} ~ ${record.end_date}`,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>排班任务</h2>
        <Button icon={<ReloadOutlined />} onClick={fetchTasks}>刷新</Button>
      </div>
      <Spin spinning={loading}>
        <Table
          dataSource={tasks}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 20 }}
        />
      </Spin>
    </div>
  );
}
