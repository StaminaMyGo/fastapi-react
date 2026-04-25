import { Layout, Menu, Button, Typography } from "antd";
import { TeamOutlined, CalendarOutlined, SettingOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import Members from "./Members";
import TaskList from "./TaskList";
import Settings from "./Settings";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { key: "members", icon: <TeamOutlined />, label: "成员管理" },
    { key: "tasks", icon: <CalendarOutlined />, label: "排班任务" },
    { key: "settings", icon: <SettingOutlined />, label: "系统设置" },
  ];

  const onMenuClick = (info: { key: string }) => {
    if (info.key === "members") {
      navigate("/members");
    } else if (info.key === "tasks") {
      navigate("/tasks");
    } else if (info.key === "settings") {
      navigate("/settings");
    }
  };

  const pathToKey: Record<string, string> = {
    "/members": "members",
    "/tasks": "tasks",
    "/settings": "settings",
  };
  const selectedKey = pathToKey[location.pathname] || "";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider>
        <div style={{ padding: "16px", color: "#fff", textAlign: "center" }}>
          <Title level={4} style={{ color: "#fff", margin: 0 }}>排班管理系统</Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={onMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ background: "#fff", padding: "0 24px", display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
          <span style={{ marginRight: 16 }}>{user?.name || "管理员"}</span>
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>退出</Button>
        </Header>
        <Content style={{ margin: 24 }}>
          <Routes>
            <Route path="/" element={<div>欢迎使用排班管理系统</div>} />
            <Route path="/members" element={<Members />} />
            <Route path="/tasks" element={<TaskList />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}
