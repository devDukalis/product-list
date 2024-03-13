import { Dispatch, useCallback, useEffect, useRef, useState } from "react";

import { Select, Button, Space, Slider, InputNumber } from "antd";

import { FilterState } from "@/components/ProductList";

import { generateUniqueKey } from "@/utils";

const sliderState = {
  min: 1,
  max: 10000000,
  value: 100,
};

const inputState = {
  min: 1,
  max: 10000000,
  value: 100,
};

interface Props {
  onFieldChange: (value: string) => void;
  onValueChange: (value: string) => void;
  onApplyFilter: () => void;
  state: FilterState;
  setFilterState: Dispatch<React.SetStateAction<FilterState>>;
}

const Filters: React.FC<Props> = ({
  state,
  onFieldChange,
  onValueChange,
  onApplyFilter,
  setFilterState,
}) => {
  const {
    fields,
    selectedField,
    filterValues,
    selectedValue,
    loadingValues,
    loadingFields,
    isApplyingFilter,
  } = state;
  const [slider, setSlider] = useState(sliderState);
  const [input, setInput] = useState(inputState);
  const inputNumberRef = useRef<HTMLInputElement>(null);

  const isSelectedFieldPrice = selectedField === "price";

  const handleSliderChange = (value: number) => {
    setSlider((prevState) => ({ ...prevState, value }));
    setInput((prevState) => ({ ...prevState, value }));
    setFilterState((prevState) => ({ ...prevState, selectedValue: value }));
  };

  const handleInputChange = (value: number | null) => {
    if (value === null) {
      return;
    }
    setSlider((prevState) => ({ ...prevState, value }));
    setInput((prevState) => ({ ...prevState, value }));
    setFilterState((prevState) => ({ ...prevState, selectedValue: value }));
  };

  const handleInputClick = () => {
    if (inputNumberRef.current) {
      inputNumberRef.current.select();
    }
  };

  const updateSliderAndInput = useCallback(() => {
    const prices = filterValues.filter((item): item is number => typeof item === "number");
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (input.value < minPrice) {
      setInput({ ...input, value: minPrice });
    } else if (input.value > maxPrice) {
      setInput({ ...input, value: maxPrice });
    }

    setSlider({ min: minPrice, max: maxPrice, value: minPrice });
    setInput({ min: minPrice, max: maxPrice, value: minPrice });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValues, isSelectedFieldPrice]);

  useEffect(() => {
    if (isSelectedFieldPrice && filterValues.length > 0) {
      updateSliderAndInput();
    }
  }, [filterValues.length, isSelectedFieldPrice, updateSliderAndInput]);

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

      {isSelectedFieldPrice ? (
        <>
          <Slider
            min={slider.min}
            max={slider.max}
            value={slider.value}
            onChange={handleSliderChange}
            style={{ width: "200px" }}
          />
          <InputNumber
            min={input.min}
            max={input.max}
            value={input.value}
            onChange={handleInputChange}
            onPressEnter={onApplyFilter}
            onClick={handleInputClick}
            ref={inputNumberRef}
            addonAfter="₽"
          />
        </>
      ) : (
        <Select
          placeholder="select value"
          value={selectedValue?.toString()}
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
      )}

      <Button
        onClick={onApplyFilter}
        disabled={!selectedField || !selectedValue || isApplyingFilter}>
        confirm
      </Button>
    </Space>
  );
};

export default Filters;
