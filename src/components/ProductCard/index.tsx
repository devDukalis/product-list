import { Card, Flex, Typography } from "antd";

import { Product } from "@/models";

interface Props {
  product: Product;
}

const notExist = "отсутствует";

const ProductCard: React.FC<Props> = ({ product }) => {
  const paramStyles = {
    id: { color: "blue" },
    name: { color: "green" },
    price: { color: "orange" },
    brand: { color: "purple" },
  };

  const cardStyle = {
    backgroundColor: "#e6f7ff",
    borderRadius: "10px",
    minHeight: "150px",
  };

  return (
    <Card key={product.id} hoverable bordered={false} style={{ ...cardStyle }}>
      <Flex vertical>
        <Typography.Text>
          <span style={paramStyles.id}>Id: </span>
          <span>{product.id || `${notExist}`}</span>
        </Typography.Text>
        <Typography.Text>
          <span style={paramStyles.name}>Название: </span>
          <span>{product.product || `${notExist}`}</span>
        </Typography.Text>
        <Typography.Text>
          <span style={paramStyles.price}>Цена: </span>
          <span>{product.price || `${notExist}`}</span>
        </Typography.Text>
        <Typography.Text>
          <span style={paramStyles.brand}>Бренд: </span>
          <span>{product.brand || `${notExist}`}</span>
        </Typography.Text>
      </Flex>
    </Card>
  );
};

export default ProductCard;
