import { Select, Button, Space } from "antd";

import { generateUniqueKey } from "@/utils";

interface Props {
  fields: string[];
  selectedField: string | null;
  filterValues: string[];
  selectedValue: string | null;
  onFieldChange: (value: string) => void;
  onValueChange: (value: string) => void;
  onApplyFilter: () => void;
  loadingValues: boolean;
  loadingFields: boolean;
  isApplyingFilter: boolean;
}

const Filters: React.FC<Props> = ({
  fields,
  selectedField,
  filterValues,
  selectedValue,
  onFieldChange,
  onValueChange,
  onApplyFilter,
  loadingValues,
  loadingFields,
  isApplyingFilter,
}) => {
  return (
    <Space>
      <Select
        placeholder="select field"
        value={selectedField}
        onChange={onFieldChange}
        disabled={isApplyingFilter}
        popupMatchSelectWidth={false}
        loading={loadingFields}>
        {fields.map((field) => (
          <Select.Option key={generateUniqueKey()} value={field}>
            {field}
          </Select.Option>
        ))}
      </Select>

      <Select
        placeholder="select value"
        value={selectedValue}
        onChange={onValueChange}
        disabled={!selectedField || isApplyingFilter}
        popupMatchSelectWidth={false}
        loading={loadingValues}>
        {filterValues.map((value) => (
          <Select.Option key={value} value={value}>
            {value}
          </Select.Option>
        ))}
      </Select>

      <Button
        onClick={onApplyFilter}
        disabled={!selectedField || !selectedValue || isApplyingFilter}>
        confirm
      </Button>
    </Space>
  );
};

export default Filters;
