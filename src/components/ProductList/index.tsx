import { useState, useEffect, useCallback } from "react";

import { Typography, Pagination, Row, Col, Divider, Skeleton } from "antd";

import ProductCard from "@/components/ProductCard";
import Container from "@/components/Container";

import apiService from "@/services/apiService";

import { generateUniqueKey } from "@/utils/generateUniqueKey";

import { Product } from "@/models";

const pageSizeOptions = [5, 10, 20, 50];
const defaultPageSize = 50;
const defaultPageNumber = 1;

interface ProductState {
  products: Product[];
  total: number;
  pageSize: number;
  pageNumber: number;
  isLoading: boolean;
  errorId: string | null;
}

const ProductList = () => {
  const [state, setState] = useState<ProductState>({
    products: [],
    total: 0,
    pageSize: defaultPageSize,
    pageNumber: defaultPageNumber,
    isLoading: true,
    errorId: null,
  });

  const handlePageChange = useCallback((currentPageNumber: number, currentPageSize: number) => {
    setState((prevState) => ({
      ...prevState,
      pageNumber: currentPageNumber,
      pageSize: currentPageSize,
    }));
  }, []);

  const handlePageSizeChange = useCallback((currentPageSize: number) => {
    setState((prevState) => ({ ...prevState, pageSize: currentPageSize, pageNumber: 1 }));
  }, []);

  useEffect(() => {
    const fetchProducts = () => {
      setState((prevState) => ({ ...prevState, isLoading: true }));
      const offset = (state.pageNumber - 1) * state.pageSize;

      apiService
        .getIds()
        .then((totalItems) => {
          return apiService
            .getIds(offset, state.pageSize)
            .then((ids) => apiService.getItems(ids))
            .then((items) => {
              const uniqueItems = Array.from(new Set(items.map((item) => item.id)))
                .map((id) => items.find((item) => item.id === id))
                .filter((item) => item !== undefined) as Product[];

              setState((prevState) => ({
                ...prevState,
                products: uniqueItems,
                total: totalItems.length,
                isLoading: false,
              }));
            });
        })
        .catch(() => {
          const errorId = generateUniqueKey();
          setState((prevState) => ({ ...prevState, errorId: errorId }));
          console.error(`Error ID: ${errorId}`);

          if (errorId) {
            setTimeout(() => {
              fetchProducts();
            }, 1000);
          }
        });
    };

    fetchProducts();
  }, [state.pageNumber, state.pageSize]);

  return (
    <Container title="Список товаров">
      <Typography.Title level={3} style={{ textAlign: "left" }}>
        Товары
      </Typography.Title>

      <Divider />

      <Row gutter={[16, 16]}>
        {state.isLoading ? (
          <Col span={24}>
            <Skeleton active />
          </Col>
        ) : (
          state.products.map((product) => (
            <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
              <ProductCard product={product} />
            </Col>
          ))
        )}
      </Row>

      <Divider />

      <div style={{ textAlign: "center" }}>
        <Pagination
          showSizeChanger
          current={state.pageNumber}
          total={state.total || 0}
          pageSize={state.pageSize}
          onChange={handlePageChange}
          onShowSizeChange={handlePageSizeChange}
          pageSizeOptions={pageSizeOptions.map(Number)}
        />
      </div>
    </Container>
  );
};

export default ProductList;
