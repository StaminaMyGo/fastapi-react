import { useState, useEffect, useCallback } from "react";
import { Table, Tabs, Button, Tag, message, Popconfirm, Space, Empty, Spin } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import type { TabsProps } from "antd";
import { getPendingUsersApi, getAllUsersApi, reviewUserApi } from "../api/users";
import type { UserDetail } from "../types";

const statusColorMap: Record<string, string> = {
  pending: "orange",
  approved: "green",
  rejected: "red",
};

const statusTextMap: Record<string, string> = {
  pending: "待审核",
  approved: "已通过",
  rejected: "已拒绝",
};

export default function Members() {
  const [pendingUsers, setPendingUsers] = useState<UserDetail[]>([]);
  const [allUsers, setAllUsers] = useState<UserDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewingId, setReviewingId] = useState<number | null>(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPendingUsersApi();
      setPendingUsers(data);
    } catch {
      message.error("获取待审核列表失败");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllUsersApi();
      setAllUsers(data);
    } catch {
      message.error("获取成员列表失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleReview = async (userId: number, action: "approve" | "reject") => {
    setReviewingId(userId);
    try {
      await reviewUserApi(userId, { action });
      message.success(action === "approve" ? "已通过该用户" : "已拒绝该用户");
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch {
      message.error("操作失败，请重试");
    } finally {
      setReviewingId(null);
    }
  };

  const pendingColumns = [
    {
      title: "姓名",
      dataIndex: "name",
      key: "name",
      width: 120,
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
      width: 220,
    },
    {
      title: "注册时间",
      dataIndex: "created_at",
      key: "created_at",
      render: (val: string) => new Date(val).toLocaleString("zh-CN"),
      width: 180,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={statusColorMap[status]}>{statusTextMap[status]}</Tag>
      ),
    },
    {
      title: "操作",
      key: "actions",
      render: (_: unknown, record: UserDetail) => (
        <Space>
          <Popconfirm
            title="确认通过该用户的注册申请？"
            onConfirm={() => handleReview(record.id, "approve")}
          >
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              loading={reviewingId === record.id}
            >
              通过
            </Button>
          </Popconfirm>
          <Popconfirm
            title="确认拒绝该用户的注册申请？"
            onConfirm={() => handleReview(record.id, "reject")}
          >
            <Button
              danger
              size="small"
              icon={<CloseCircleOutlined />}
              loading={reviewingId === record.id}
            >
              拒绝
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const allColumns = [
    {
      title: "姓名",
      dataIndex: "name",
      key: "name",
      width: 120,
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
      width: 220,
    },
    {
      title: "角色",
      dataIndex: "role",
      key: "role",
      width: 100,
      render: (role: string) => (role === "admin" ? "管理员" : "成员"),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={statusColorMap[status]}>{statusTextMap[status]}</Tag>
      ),
    },
    {
      title: "注册时间",
      dataIndex: "created_at",
      key: "created_at",
      render: (val: string) => new Date(val).toLocaleString("zh-CN"),
    },
  ];

  const tabItems: TabsProps["items"] = [
    {
      key: "pending",
      label: `待审核 (${pendingUsers.length})`,
      children: (
        <Spin spinning={loading}>
          {pendingUsers.length === 0 && !loading ? (
            <Empty description="暂无待审核用户" />
          ) : (
            <Table
              dataSource={pendingUsers}
              columns={pendingColumns}
              rowKey="id"
              pagination={false}
            />
          )}
        </Spin>
      ),
    },
    {
      key: "all",
      label: "全部成员",
      children: (
        <Spin spinning={loading}>
          <Table
            dataSource={allUsers}
            columns={allColumns}
            rowKey="id"
            pagination={{ pageSize: 20 }}
          />
        </Spin>
      ),
    },
  ];

  const onTabChange = (key: string) => {
    if (key === "all") {
      fetchAll();
    } else {
      fetchPending();
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>成员管理</h2>
        <Button icon={<ReloadOutlined />} onClick={() => onTabChange("pending")}>
          刷新
        </Button>
      </div>
      <Tabs defaultActiveKey="pending" items={tabItems} onChange={onTabChange} />
    </div>
  );
}
