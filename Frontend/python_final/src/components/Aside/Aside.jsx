import React, { useState, useEffect, useCallback } from 'react';
import './aside.css';
import { debounce } from 'lodash'; // Import hàm debounce

function Aside({ onFilterChange }) {
  const [selectedBrand, setSelectedBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');

  // Sử dụng debounce để trì hoãn việc thay đổi giá
  const debouncedPriceChange = useCallback(
    debounce(() => {
      onFilterChange({
        brand: selectedBrand,
        minPrice,
        maxPrice,
        storage: selectedStorage,
      });
    }, 10), // 500ms là thời gian trì hoãn
    [selectedBrand, minPrice, maxPrice, selectedStorage]
  );

  useEffect(() => {
    debouncedPriceChange();
    // Cleanup debounce khi component unmount
    return () => debouncedPriceChange.cancel();
  }, [minPrice, maxPrice, selectedBrand, selectedStorage]);

  const handleBrandChange = (e) => {
    setSelectedBrand(e.target.value);
  };

  const handleStorageChange = (e) => {
    setSelectedStorage(e.target.value);
  };

  return (
    <aside className="filter-aside">
      <h3>Lọc Sản Phẩm</h3>
      
      <div className="filter-group">
        <label>Thương Hiệu</label>
        <select value={selectedBrand} onChange={handleBrandChange}>
          <option value="">Tất Cả</option>
          <option value="Apple">Apple</option>
          <option value="Samsung">Samsung</option>
          <option value="Sony">Sony</option>
          <option value="Xiaomi">Xiaomi</option>
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
      
      <div className="filter-group">
        <label>Bộ nhớ</label>
        <select value={selectedStorage} onChange={handleStorageChange}>
          <option value="">Tất Cả</option>
          <option value="64GB">64GB</option>
          <option value="128GB">128GB</option>
          <option value="256GB">256GB</option>
        </select>
      </div>
    </aside>
  );
}

export default Aside;
