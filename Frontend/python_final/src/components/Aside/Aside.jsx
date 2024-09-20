import React, { useState, useEffect, useCallback } from 'react';
import './aside.css';
import { debounce } from 'lodash';

function Aside({ onFilterChange }) {
  const [brands, setBrands] = useState([]); // Tạo state để lưu danh sách thương hiệu
  const [selectedBrand, setSelectedBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');
  const apiurl = import.meta.env.VITE_REACT_APP_API_URL;

  // Sử dụng debounce để trì hoãn việc thay đổi giá
  const debouncedPriceChange = useCallback(
    debounce(() => {
      onFilterChange({
        brand: selectedBrand,
        minPrice,
        maxPrice,
        storage: selectedStorage,
      });
    }, 5),
    [selectedBrand, minPrice, maxPrice, selectedStorage]
  );

  useEffect(() => {
    debouncedPriceChange();
    return () => debouncedPriceChange.cancel();
  }, [minPrice, maxPrice, selectedBrand, selectedStorage]);

  useEffect(() => {
    // Gọi API để lấy danh sách thương hiệu
    const fetchBrands = async () => {
      try {
        const response = await fetch(`${apiurl}/brands/`);
        const data = await response.json();
        setBrands(data); // Lưu danh sách thương hiệu vào state
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };

    fetchBrands();
  }, []);

  const handleBrandChange = (e) => {
    setSelectedBrand(e.target.value);
  };

  const handleStorageChange = (e) => {
    setSelectedStorage(e.target.value);
  };

  return (
    <aside className="filter-aside">
      <h4 className="text-primary">Lọc Sản Phẩm</h4>

      <div className="filter-group">
        <label>Thương Hiệu</label>
        <select value={selectedBrand} onChange={handleBrandChange}>
          <option value="">Tất Cả</option>
          {brands.map((brand, index) => (
            <option key={index} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Giá Tiền (VNĐ)</label>
        <input
          type="number"
          placeholder="Giá tối thiểu"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Giá tối đa"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </div>

      {/* Bạn có thể bật lại bộ lọc bộ nhớ nếu cần */}
      {/* <div className="filter-group">
        <label>Bộ nhớ</label>
        <select value={selectedStorage} onChange={handleStorageChange}>
          <option value="">Tất Cả</option>
          <option value="64GB">64GB</option>
          <option value="128GB">128GB</option>
          <option value="256GB">256GB</option>
        </select>
      </div> */}
    </aside>
  );
}

export default Aside;
