import { useState, useEffect, useCallback } from "react";

import { Typography, Pagination, Row, Col, Divider, Skeleton, Select, Button, Space } from "antd";

import ProductCard from "@/components/ProductCard";
import Container from "@/components/Container";

import apiService from "@/services/apiService";

import { FilterParams, Product } from "@/models";
import { generateUniqueKey } from "@/utils/generateUniqueKey";
import { notNull } from "@/utils/notNull";

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
  errorCount: number;
}

interface FilterState {
  fields: string[];
  selectedField: string | null;
  filterValues: string[];
  selectedValue: string | null;
  errorId: string | null;
  errorCount: number;
}

const ProductList = () => {
  const [productState, setProductState] = useState<ProductState>({
    products: [],
    total: 0,
    pageSize: defaultPageSize,
    pageNumber: defaultPageNumber,
    isLoading: true,
    errorId: null,
    errorCount: 0,
  });

  const [filterState, setFilterState] = useState<FilterState>({
    fields: [],
    selectedField: null,
    filterValues: [],
    selectedValue: null,
    errorId: null,
    errorCount: 0,
  });

  const [loadingValues, setLoadingValues] = useState(false);
  const [isApplyingFilter, setIsApplyingFilter] = useState(false);

  const handlePageChange = useCallback((currentPageNumber: number, currentPageSize: number) => {
    setProductState((prevState) => ({
      ...prevState,
      pageNumber: currentPageNumber,
      pageSize: currentPageSize,
    }));
  }, []);

  const handlePageSizeChange = useCallback((currentPageSize: number) => {
    setProductState((prevState) => ({ ...prevState, pageSize: currentPageSize, pageNumber: 1 }));
  }, []);

  const fetchProducts = useCallback(() => {
    setProductState((prevState) => ({ ...prevState, isLoading: true }));
    const offset = (productState.pageNumber - 1) * productState.pageSize;

    apiService
      .getIds()
      .then((totalItems) => {
        return apiService
          .getIds(offset, productState.pageSize)
          .then((ids) => apiService.getItems(ids))
          .then((items) => {
            const uniqueItems = Array.from(new Set(items.map((item) => item.id)))
              .map((id) => items.find((item) => item.id === id))
              .filter((item) => item !== undefined) as Product[];

            setProductState((prevState) => ({
              ...prevState,
              products: uniqueItems,
              total: totalItems.length,
              isLoading: false,
            }));
          });
      })
      .catch(() => {
        const errorId = generateUniqueKey();
        setProductState((prevState) => ({
          ...prevState,
          errorId: errorId,
          errorCount: prevState.errorCount + 1,
        }));
      });
  }, [productState.pageNumber, productState.pageSize]);

  useEffect(() => {
    if (productState.errorId && productState.errorCount < 5) {
      console.error(productState.errorId);
      const timeoutId = setTimeout(() => {
        fetchProducts();
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [productState.errorId, productState.errorCount, fetchProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, productState.pageNumber, productState.pageSize]);

  const handleFieldChange = (value: string) => {
    setFilterState((prevState) => ({ ...prevState, selectedField: value }));
  };

  const handleValueChange = (value: string) => {
    setFilterState((prevState) => ({ ...prevState, selectedValue: value }));
  };

  useEffect(() => {
    if (filterState.selectedField) {
      setLoadingValues(true);
      const offset = (productState.pageNumber - 1) * productState.pageSize;

      apiService
        .getFields({
          field: filterState.selectedField,
          offset: offset,
          limit: productState.pageSize,
        })
        .then((values) => {
          const nonNullValues = values.filter(notNull);

          if (filterState.selectedField === "price") {
            nonNullValues.sort((a, b) => Number(a) - Number(b));
          }

          const uniqueValues = [...new Set(nonNullValues)];

          setFilterState((prevState) => ({ ...prevState, filterValues: uniqueValues }));
          setLoadingValues(false);
        });
    }
  }, [productState.pageNumber, productState.pageSize, filterState.selectedField]);

  const applyFilter = useCallback(() => {
    if (isApplyingFilter) return;

    setIsApplyingFilter(true);
    setProductState((prevState) => ({ ...prevState, isLoading: true }));

    if (!filterState.selectedField || !filterState.selectedValue) return;

    const params: FilterParams = {
      [filterState.selectedField]: filterState.selectedValue,
    };

    apiService
      .filter(params)
      .then((filteredIds) => apiService.getItems(filteredIds))
      .then((filteredProducts) => {
        const uniqueItems = Array.from(new Set(filteredProducts.map((item) => item.id)))
          .map((id) => filteredProducts.find((item) => item.id === id))
          .filter((item) => item !== undefined) as Product[];

        if (filterState.selectedField !== "product") {
          setProductState((prevState) => ({
            ...prevState,
            products: uniqueItems,
            total: uniqueItems.length,
            isLoading: false,
          }));
          setIsApplyingFilter(false);
          return;
        }

        // Проверяем вхождение строки для поля "product"
        const regex = new RegExp(`^${filterState.selectedValue || ""}$`, "ig");
        const testedProducts = uniqueItems.filter((product) => regex.test(product.product || ""));

        setProductState((prevState) => ({
          ...prevState,
          products: testedProducts,
          total: testedProducts.length,
          isLoading: false,
        }));

        setIsApplyingFilter(false);
      })
      .catch(() => {
        const errorId = generateUniqueKey();
        setFilterState((prevState) => ({
          ...prevState,
          errorId: errorId,
          errorCount: prevState.errorCount + 1,
        }));
        setProductState((prevState) => ({ ...prevState, isLoading: false }));
        setIsApplyingFilter(false);
      });
  }, [filterState.selectedField, filterState.selectedValue, isApplyingFilter]);

  useEffect(() => {
    if (filterState.errorId && filterState.errorCount < 5) {
      console.error(filterState.errorId);
      const timeoutId = setTimeout(() => {
        applyFilter();
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [filterState.errorId, filterState.errorCount, applyFilter]);

  useEffect(() => {
    apiService.getFields().then((fetchedFields) => {
      setFilterState((prevState) => ({
        ...prevState,
        fields: fetchedFields,
      }));
    });
  }, []);

  return (
    <Container title="Список товаров">
      <Typography.Title level={3} style={{ textAlign: "left" }}>
        Фильтры
      </Typography.Title>

      <Divider />

      <Space>
        <Select
          placeholder="Выберите поле"
          onChange={handleFieldChange}
          popupMatchSelectWidth={false}
          disabled={isApplyingFilter || isApplyingFilter}>
          {filterState.fields.map((field) => (
            <Select.Option key={generateUniqueKey()} value={field}>
              {field}
            </Select.Option>
          ))}
        </Select>

        <Select
          placeholder="Выберите значение"
          onChange={handleValueChange}
          disabled={!filterState.selectedField || isApplyingFilter}
          popupMatchSelectWidth={false}
          loading={loadingValues}>
          {filterState.filterValues.map((value) => (
            <Select.Option key={generateUniqueKey()} value={value}>
              {value}
            </Select.Option>
          ))}
        </Select>

        <Button
          onClick={applyFilter}
          disabled={!filterState.selectedField || !filterState.selectedValue || isApplyingFilter}>
          Применить
        </Button>
      </Space>

      <Divider />

      <Typography.Title level={3} style={{ textAlign: "left" }}>
        Товары
      </Typography.Title>

      <Divider />

      <Row gutter={[16, 16]}>
        {productState.isLoading ? (
          <Col span={24}>
            <Skeleton active />
          </Col>
        ) : (
          productState.products.map((product) => (
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
          current={productState.pageNumber || 1}
          total={productState.total || 0}
          pageSize={productState.pageSize || 5}
          onChange={handlePageChange}
          onShowSizeChange={handlePageSizeChange}
          pageSizeOptions={pageSizeOptions.map(Number)}
        />
      </div>
    </Container>
  );
};

export default ProductList;
