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
          address_type: "home",
        });
      })
      .catch((error) => alert('Bạn cần tạo profile trước!'));

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
    <div className="address-step-container container">
      <div className="row">
        <div className="step-navigation mb-4 gap-3">
          <button onClick={() => navigate("/cart")}>Back</button>
          <button onClick={handleNextStep}>Next</button>
        </div>
        <div className="col-md-5 justify-content-beetween">
          <h2 className=" text-primary">Chọn địa chỉ giao hàng</h2>
          <ul className="address-list">
            {addresses.map((address) => (
                <li
                    key={address.id}
                    className="address-item"
                    onClick={() => setSelectedAddressId(address.id)} 
                    style={{cursor: "pointer"}}
                >
                  <div>
                    <input
                        type="radio"
                        name="selectedAddress"
                        value={address.id}
                        checked={selectedAddressId === address.id}
                        onChange={() => setSelectedAddressId(address.id)}
                        onClick={(e) => e.stopPropagation()} 
                    />
                    <span className="fw-bold">{address.full_name}</span>
                    <ul className="pt-1">
                      <li>{address.phone_number}</li>
                      <li>{address.specific_address}, at {address.address_type} </li>
                    </ul>
                  </div>
                  <div className="info"></div>
                </li>
            ))}
          </ul>
        </div>
        <div className="col-md-7">
          <div className="add-address-form">
            <h2 className="mb-3 text-primary">Thêm mới địa chỉ</h2>
            <input
                className="form-button"
                type="text"
                placeholder="Họ và tên"
                value={newAddress.full_name}
                onChange={(e) =>
                    setNewAddress({...newAddress, full_name: e.target.value})
                }
            />
            <input
                className="form-button"
                type="text"
                placeholder="Số điện thoại"
                value={newAddress.phone_number}
                onChange={(e) =>
                    setNewAddress({...newAddress, phone_number: e.target.value})
                }
            />
            <input
                className="form-button"
                type="text"
                placeholder="Địa chỉ"
                value={newAddress.specific_address}
                onChange={(e) =>
                    setNewAddress({...newAddress, specific_address: e.target.value})
                }
            />
            <select
                className="form-button mb-3"
                value={newAddress.address_type}
                onChange={(e) =>
                    setNewAddress({...newAddress, address_type: e.target.value})
                }
            >
              <option value="HOME">Home</option>
              <option value="OFFICE">Office</option>
            </select>
            <button className="address d-flex btn btn-outline-dark" onClick={handleAddAddress}>Thêm địa chỉ</button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Step1;
