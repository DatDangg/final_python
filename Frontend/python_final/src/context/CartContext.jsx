import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const CartContext = createContext(); 

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
        setCartItems(response.data); 
      })
      .catch((error) => console.error('Error fetching cart items:', error));
  };

  const addToCart = (product_id, variant_id, quantity) => {
    const existingItem = cartItems.find(item => item.product.id === product_id && item.variant.id === variant_id);
    
    if (existingItem) {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.product.id === product_id && item.variant.id === variant_id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      const newItem = {
        product: { id: product_id },
        variant: { id: variant_id }, 
        quantity: quantity,
      };
      setCartItems(prevItems => [...prevItems, newItem]);
    }
  
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
        fetchCartItems();
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
    setCartItems([]); 
  };

  return (
    <CartContext.Provider value={{ cartItems, setCartItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
