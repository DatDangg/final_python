import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      axios
        .get('http://127.0.0.1:8000/api/cart/', {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        })
        .then((response) => {
          setCartItems(response.data);
        })
        .catch((error) => console.error('Error fetching cart items:', error));
    }
  }, [token]);

  const addToCart = (product_id, variant_id, quantity) => {
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
      .then((response) => {
        setCartItems((prevItems) => [...prevItems, response.data]);
      })
      .catch((error) => console.error('Error adding to cart:', error));
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

  return (
    <CartContext.Provider value={{ cartItems,setCartItems, addToCart, removeFromCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};