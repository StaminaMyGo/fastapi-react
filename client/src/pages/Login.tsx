import { useState } from "react";
import { Form, Input, Button, Card, message, Typography } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { loginApi } from "../api/auth";
import { useAuthStore } from "../stores/authStore";

const { Title } = Typography;

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await loginApi(values);
      setAuth(res.user, res.access_token, res.refresh_token);
      message.success("登录成功");
      navigate("/");
    } catch (err: unknown) {
      const resp = (err as { response?: { data?: { detail?: string } } })?.response?.data;
      const detail = resp?.detail;
      if (detail?.includes("pending")) {
        message.warning("账号尚未通过管理员审核，请等待审核");
      } else if (detail?.includes("rejected")) {
        message.error("账号已被管理员拒绝");
      } else if (detail?.includes("Invalid credentials")) {
        message.error("邮箱或密码错误");
      } else {
        message.error("登录失败，请检查网络连接");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f0f2f5" }}>
      <Card style={{ width: 400 }}>
        <Title level={3} style={{ textAlign: "center" }}>志愿排班系统</Title>
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item name="email" rules={[{ required: true, type: "email" }]}>
            <Input prefix={<MailOutlined />} placeholder="邮箱" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            登录
          </Button>
        </Form>
        <div style={{ textAlign: "center", marginTop: 16 }}>
          没有账号？<Link to="/register">立即注册</Link>
        </div>
      </Card>
    </div>
  );
}
