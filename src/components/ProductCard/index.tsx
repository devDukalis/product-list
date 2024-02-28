import { Card, Flex, Typography } from "antd";

import { Product } from "@/models";

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

interface Props {
  product: Product;
}

const cardDescription = {
  id: "Id: ",
  title: "Название: ",
  price: "Цена: ",
  brand: "Бренд: ",
  currency: {
    ruble: "₽",
  },
  notExist: "отсутствует",
};

const ProductCard: React.FC<Props> = ({ product }) => {
  return (
    <Card key={product.id} hoverable bordered={false} style={{ ...cardStyle }}>
      <Flex vertical>
        <Typography.Text>
          <span style={paramStyles.id}>{cardDescription.id}</span>
          <span>{product.id || `${cardDescription.notExist}`}</span>
        </Typography.Text>
        <Typography.Text>
          <span style={paramStyles.name}>{cardDescription.title}</span>
          <span>{product.product || `${cardDescription.notExist}`}</span>
        </Typography.Text>
        <Typography.Text>
          <span style={paramStyles.price}>{cardDescription.price}</span>
          <span>
            {`${product.price?.toLocaleString()} ${cardDescription.currency.ruble}` ||
              `${cardDescription.notExist}`}
          </span>
        </Typography.Text>
        <Typography.Text>
          <span style={paramStyles.brand}>{cardDescription.brand}</span>
          <span>{product.brand || `${cardDescription.notExist}`}</span>
        </Typography.Text>
      </Flex>
    </Card>
  );
};

export default ProductCard;
