import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const CartContext = createContext(); // Đảm bảo export đúng

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      fetchCartItems();
    }
  }, [token]);

  const fetchCartItems = () => {
    axios
      .get('http://127.0.0.1:8000/api/cart/', {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        setCartItems(response.data); // Cập nhật cartItems
      })
      .catch((error) => console.error('Error fetching cart items:', error));
  };

  const addToCart = (product_id, variant_id, quantity) => {
    // Cập nhật giỏ hàng ngay lập tức trên giao diện
    const existingItem = cartItems.find(item => item.product.id === product_id && item.variant.id === variant_id);
    
    if (existingItem) {
      // Nếu sản phẩm đã có trong giỏ hàng, chỉ tăng số lượng
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.product.id === product_id && item.variant.id === variant_id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      // Nếu sản phẩm chưa có, thêm mới sản phẩm vào giỏ hàng ngay trên giao diện
      const newItem = {
        product: { id: product_id }, // Giả lập thông tin sản phẩm
        variant: { id: variant_id }, // Giả lập thông tin biến thể
        quantity: quantity,
      };
      setCartItems(prevItems => [...prevItems, newItem]);
    }
  
    // Sau đó mới thực hiện gọi API để đồng bộ với backend
    axios
      .post(
        'http://127.0.0.1:8000/api/cart/',
        { product_id, variant_id, quantity },
        {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      .then(response => {
        console.log("Product added to cart:", response.data);
        // Đồng bộ lại giỏ hàng từ API sau khi API trả về thành công
        fetchCartItems(); // Gọi lại hàm này để cập nhật dữ liệu từ API
      })
      .catch(error => {
        console.error('Error adding to cart:', error);
      });
  };
  

  const removeFromCart = (itemId) => {
    axios
      .delete(`http://127.0.0.1:8000/api/cart/${itemId}/`, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      })
      .then(() => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
      })
      .catch((error) => console.error('Error removing item from cart:', error));
  };

  const updateQuantity = (itemId, quantity) => {
    const item = cartItems.find((item) => item.id === itemId);

    if (quantity > 0 && quantity <= item.variant.quantity) {
      axios
        .patch(
          `http://127.0.0.1:8000/api/cart/${itemId}/`,
          { quantity },
          {
            headers: {
              Authorization: `Token ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )
        .then(() => {
          setCartItems((prevItems) =>
            prevItems.map((item) =>
              item.id === itemId ? { ...item, quantity } : item
            )
          );
        })
        .catch((error) => console.error('Error updating quantity:', error));
    }
  };

  const clearCart = () => {
    setCartItems([]); // Xóa giỏ hàng trong UI
  };

  return (
    <CartContext.Provider value={{ cartItems, setCartItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
