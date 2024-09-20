import React, { useState, useEffect, useCallback } from 'react';
import './aside.css';
import { debounce } from 'lodash';

function Aside({ onFilterChange, hideCategoryFilter }) {
  const [brands, setBrands] = useState([]);
  const categories = [
    { id: 1, name: 'Smart Phones' },
    { id: 3, name: 'Headphones' },
    { id: 2, name: 'Computers' },
    { id: 4, name: 'Smart Watches' },
  ]; // Danh mục với ID
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(''); // State cho ID danh mục
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const apiurl = import.meta.env.VITE_REACT_APP_API_URL;

  const debouncedPriceChange = useCallback(
    debounce(() => {
      onFilterChange({
        brand: selectedBrand,
        categoryId: selectedCategoryId, // Gửi categoryId
        minPrice,
        maxPrice,
      });
    }, 300),
    [selectedBrand, selectedCategoryId, minPrice, maxPrice]
  );

  useEffect(() => {
    debouncedPriceChange();
    return () => debouncedPriceChange.cancel();
  }, [minPrice, maxPrice, selectedBrand, selectedCategoryId]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch(`${apiurl}/brands/`);
        const data = await response.json();
        setBrands(data);
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };

    fetchBrands();
  }, [apiurl]);

  const handleBrandChange = (e) => {
    setSelectedBrand(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategoryId(e.target.value); // Cập nhật categoryId
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
      {!hideCategoryFilter && (
      <div className="filter-group">
        <label>Danh Mục</label>
        <select value={selectedCategoryId} onChange={handleCategoryChange}>
          <option value="">Tất Cả</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name} {/* Hiển thị tên danh mục */}
            </option>
          ))}
        </select>
      </div>
      )}
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
    </aside>
  );
}

export default Aside;
