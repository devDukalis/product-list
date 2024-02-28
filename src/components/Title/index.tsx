import { FC, ReactNode } from "react";

import { Typography } from "antd";

interface Props {
  value?: string;
  children?: ReactNode;
}

const Title: FC<Props> = ({ children, value = "your title" }) => {
  return (
    <Typography.Title level={3} style={{ textAlign: "left" }}>
      {value}
      {children}
    </Typography.Title>
  );
};

export default Title;
