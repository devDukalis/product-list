import { Card, Typography } from "antd";

const { Title } = Typography;

interface Props {
  title?: string;
  children: React.ReactNode;
}

const Container: React.FC<Props> = ({ title = "your title", children }) => {
  return (
    <Card
      title={
        <Title level={2} style={{ textAlign: "center" }}>
          {title}
        </Title>
      }
      style={{ margin: "0px  24px" }}>
      {children}
    </Card>
  );
};

export default Container;
