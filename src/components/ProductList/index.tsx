import { useState, useEffect } from "react";

import { Pagination, Row, Col, Divider, Skeleton, Empty } from "antd";

import ProductCard from "@/components/ProductCard";
import Container from "@/components/Container";
import Filters from "@/components/Filters";
import Title from "@/components/Title";

import apiService from "@/services/apiService";

import { notNull } from "@/utils";

import { FilterParams, Product } from "@/models";

const productListDescription = {
  list: "Product list",
  filters: "Filters",
  products: "Products",
  notExist: "Not exist",
};

const page = {
  pageSizeOptions: [5, 10, 20, 50],
  defaultPageSize: 50,
  defaultPageNumber: 1,
};

interface ProductState {
  products: Product[];
  total: number;
  pageSize: number;
  pageNumber: number;
  isLoading: boolean;
}

interface FilterState {
  fields: string[];
  selectedField: string | null;
  filterValues: string[];
  selectedValue: string | null;
  loadingValues: boolean;
  loadingFields: boolean;
  isApplyingFilter: boolean;
}

const ProductList = () => {
  const [productState, setProductState] = useState<ProductState>({
    products: [],
    total: 0,
    pageSize: page.defaultPageSize,
    pageNumber: page.defaultPageNumber,
    isLoading: false,
  });

  const [filterState, setFilterState] = useState<FilterState>({
    fields: [],
    selectedField: null,
    filterValues: [],
    selectedValue: null,
    loadingValues: false,
    loadingFields: false,
    isApplyingFilter: false,
  });

  const fetchProducts = () => {
    setProductState((prevState) => ({ ...prevState, isLoading: true }));
    const offset = productState.pageNumber * productState.pageSize!;

    apiService.getIds().then(() => {
      apiService
        .getIds(offset, productState.pageSize)
        .then((ids) => apiService.getItems(ids))
        .then((items) => {
          // фильтрация и преобразование полученных элементов в массив уникальных элементов по id
          const uniqueItems = Array.from(new Set(items.map((item) => item.id)))
            .map((id) => items.find((item) => item.id === id))
            .filter((item) => item !== undefined) as Product[];

          setProductState((prevState) => ({
            ...prevState,
            products: uniqueItems,
            total: uniqueItems.length,
            isLoading: false,
          }));
        });
    });
  };

  // получение списка товаров и доступных полей для фильтрации
  useEffect(() => {
    fetchProducts();
    setFilterState((prevState) => ({ ...prevState, loadingFields: true }));

    apiService.getFields().then((fetchedFields) => {
      setFilterState((prevState) => ({
        ...prevState,
        fields: fetchedFields,
      }));

      setFilterState((prevState) => ({ ...prevState, loadingFields: false }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // получение списка значений для фильтрации исходя из введенных полей
  useEffect(() => {
    if (filterState.selectedField) {
      setFilterState((prevState) => ({ ...prevState, loadingValues: true }));

      apiService
        .getFields({
          field: filterState.selectedField,
        })
        .then((values) => {
          const nonNullValues = values.filter(notNull);

          if (filterState.selectedField === "price") {
            nonNullValues.sort((a, b) => Number(a) - Number(b));
          }

          const uniqueValues = [...new Set(nonNullValues)];

          setFilterState((prevState) => ({ ...prevState, filterValues: uniqueValues }));
        });
    }

    setFilterState((prevState) => ({ ...prevState, loadingValues: false }));
  }, [filterState.selectedField]);

  const applyFilter = () => {
    // фильтр не применяется если не был применен фильтр и
    // не было выбрано поле или значение для фильтрации
    if (filterState.isApplyingFilter) return;
    if (!filterState.selectedField || !filterState.selectedValue) return;

    setFilterState((prevState) => ({ ...prevState, isApplyingFilter: true }));
    setProductState((prevState) => ({ ...prevState, isLoading: true }));

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
          setFilterState((prevState) => ({ ...prevState, isApplyingFilter: false }));
          return;
        }

        // Проверка вхождения строки для поля "product"
        const regex = new RegExp(`^${filterState.selectedValue || ""}$`, "ig");
        const testedProducts = uniqueItems.filter((product) => regex.test(product.product || ""));

        setProductState((prevState) => ({
          ...prevState,
          products: testedProducts,
          total: testedProducts.length,
          isLoading: false,
        }));

        setFilterState((prevState) => ({ ...prevState, isApplyingFilter: false }));
      });
  };

  const handleFieldChange = (value: string) => {
    setFilterState((prevState) => ({
      ...prevState,
      selectedField: value,
      selectedValue: null,
      isLoading: false,
    }));
  };

  const handleValueChange = (value: string) => {
    setFilterState((prevState) => ({ ...prevState, selectedValue: value, isLoading: false }));
  };

  const handlePageChange = (currentPageNumber: number, currentPageSize: number) => {
    setProductState((prevState) => ({
      ...prevState,
      pageNumber: currentPageNumber,
      pageSize: currentPageSize,
      isLoading: false,
    }));
  };

  const handlePageSizeChange = (currentPageSize: number) => {
    setProductState((prevState) => ({
      ...prevState,
      pageSize: currentPageSize,
      isLoading: false,
    }));
  };

  return (
    <Container title={productListDescription.list}>
      <Title value={productListDescription.filters} />

      <Divider />

      <Filters
        fields={filterState.fields}
        selectedField={filterState.selectedField}
        filterValues={filterState.filterValues}
        selectedValue={filterState.selectedValue}
        onFieldChange={handleFieldChange}
        onValueChange={handleValueChange}
        onApplyFilter={applyFilter}
        loadingValues={filterState.loadingValues}
        loadingFields={filterState.loadingFields}
        isApplyingFilter={filterState.isApplyingFilter}
      />

      <Divider />

      <Title value={productListDescription.products} />

      <Divider />

      <Row gutter={[16, 16]}>
        {productState.isLoading ? (
          <Col span={24}>
            <Skeleton active />
          </Col>
        ) : (
          <>
            {productState.products.length > 0 && !productState.isLoading ? (
              productState.products
                .slice(
                  (productState.pageNumber - 1) * productState.pageSize,
                  productState.pageNumber * productState.pageSize,
                )
                .map((product) => (
                  <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                    <ProductCard product={product} />
                  </Col>
                ))
            ) : (
              <Col span={24}>
                <Empty description={productListDescription.notExist} />
              </Col>
            )}
          </>
        )}
      </Row>

      <Divider />

      <div style={{ textAlign: "center" }}>
        <Pagination
          showSizeChanger
          current={productState.pageNumber || 1}
          total={productState.total}
          pageSize={productState.pageSize}
          onChange={handlePageChange}
          onShowSizeChange={handlePageSizeChange}
          pageSizeOptions={page.pageSizeOptions.map(Number)}
        />
      </div>
    </Container>
  );
};

export default ProductList;
