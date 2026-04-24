import { useEffect, useState } from "react";
import { Layout, Card, Button, Typography, List, message } from "antd";
import { CalendarOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import apiClient from "../api/client";

const { Header, Content } = Layout;
const { Title } = Typography;

interface Task {
  id: number;
  name: string;
  description: string;
  status: string;
  deadline: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    apiClient.get("/tasks").then((res) => setTasks(res.data)).catch(() => message.error("获取任务列表失败"));
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ background: "#fff", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Title level={4} style={{ margin: 0 }}>志愿排班系统</Title>
        <div>
          <span style={{ marginRight: 16 }}>{user?.name}</span>
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>退出</Button>
        </div>
      </Header>
      <Content style={{ padding: 24 }}>
        <Title level={3}>我的排班任务</Title>
        <List
          dataSource={tasks}
          renderItem={(task) => (
            <Card
              key={task.id}
              style={{ marginBottom: 16 }}
              actions={[
                <Button type="link" icon={<CalendarOutlined />} onClick={() => navigate(`/tasks/${task.id}`)}>
                  填报志愿
                </Button>,
              ]}
            >
              <Card.Meta title={task.name} description={task.description} />
              <div style={{ marginTop: 8, color: "#888" }}>
                状态: {task.status === "open" ? "填报中" : task.status} | 截止: {new Date(task.deadline).toLocaleString()}
              </div>
            </Card>
          )}
        />
      </Content>
    </Layout>
  );
}
