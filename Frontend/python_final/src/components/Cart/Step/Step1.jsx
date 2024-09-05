import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./step1.css";

function Step1() {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({
    full_name: "",
    phone_number: "",
    specific_address: "",
    address_type: "HOME",
  });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      axios
        .get("http://127.0.0.1:8000/api/addresses/", {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          setAddresses(response.data);
        })
        .catch((error) => console.error("Error fetching addresses:", error));
    }
  }, [token]);

  const handleAddAddress = () => {
    axios
      .post("http://127.0.0.1:8000/api/addresses/", newAddress, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        setAddresses([...addresses, response.data]);
        setNewAddress({
          full_name: "",
          phone_number: "",
          specific_address: "",
          address_type: "HOME",
        });
      })
      .catch((error) => console.error("Error adding address:", error));
  };

  const handleNextStep = () => {
    const selectedAddress = addresses.find(
      (addr) => addr.id === selectedAddressId
    );
    if (selectedAddress) {
      localStorage.setItem("selectedAddress", JSON.stringify(selectedAddress));
      navigate("/checkout/shipping");
    } else {
      alert("Please select an address.");
    }
  };

  return (
    <div className="address-step-container">
      <h2>Select Address</h2>
      <ul className="address-list">
        {addresses.map((address) => (
          <li key={address.id} className="address-item">
            <div>
              <input
                type="radio"
                name="selectedAddress"
                value={address.id}
                onChange={() => setSelectedAddressId(address.id)}
              />
              <span>{address.full_name}</span>
              <span>{address.address_type}</span>
            </div>
            <div>
              <p>{address.specific_address}</p>
              <p>{address.phone_number}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="add-address-form">
        <h3>Add New Address</h3>
        <input
          type="text"
          placeholder="Full Name"
          value={newAddress.full_name}
          onChange={(e) =>
            setNewAddress({ ...newAddress, full_name: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={newAddress.phone_number}
          onChange={(e) =>
            setNewAddress({ ...newAddress, phone_number: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Specific Address"
          value={newAddress.specific_address}
          onChange={(e) =>
            setNewAddress({ ...newAddress, specific_address: e.target.value })
          }
        />
        <select
          value={newAddress.address_type}
          onChange={(e) =>
            setNewAddress({ ...newAddress, address_type: e.target.value })
          }
        >
          <option value="HOME">Home</option>
          <option value="OFFICE">Office</option>
        </select>
        <button onClick={handleAddAddress}>Add Address</button>
      </div>
      <div className="step-navigation">
        <button onClick={() => navigate("/cart")}>Back</button>
        <button onClick={handleNextStep}>Next</button>
      </div>
    </div>
  );
}

export default Step1;
