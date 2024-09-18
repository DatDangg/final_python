import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./step2.css";

const distanceInKm = 5; // Giả sử là 5km.
const baseFee = 20000; // Phí cơ bản cố định.
const distanceFeePerKm = 5000; // Phí tính theo khoảng cách (5,000 VND/km).
const expressAdditionalFee = 0.3; // Phí giao nhanh tăng thêm 30%.
const discountPerDayLate = 0.1; // Giảm 10% mỗi ngày giao chậm hơn 4 ngày.
const extraPerDayEarly = 0.1; // Tăng 10% mỗi ngày giao sớm hơn 4 ngày.

function Step2() {
  const [selectedOption, setSelectedOption] = useState("free");
  const [deliveryDays, setDeliveryDays] = useState(10); // Mặc định là 10 ngày cho giao hàng thường.
  const [freeShippingCost, setFreeShippingCost] = useState(0); // Phí cho giao hàng thường
  const [expressShippingCost, setExpressShippingCost] = useState(0); // Phí cho giao nhanh
  const [scheduledShippingCost, setScheduledShippingCost] = useState(0); // Phí cho tùy chọn ngày
  const navigate = useNavigate();

  const formatPrice = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Tính phí cho giao hàng thường (free)
  const calculateFreeShippingCost = () => {
    setFreeShippingCost(0); // Miễn phí
  };

  // Tính phí cho giao hàng nhanh (express)
  const calculateExpressShippingCost = () => {
    const distanceCost = distanceInKm * distanceFeePerKm;
    const expressFee = distanceCost * expressAdditionalFee;
    const totalCost = baseFee + distanceCost + expressFee;
    setExpressShippingCost(totalCost);
  };

  // Tính phí cho giao hàng tùy chọn (schedule)
  const calculateScheduledShippingCost = () => {
    const distanceCost = distanceInKm * distanceFeePerKm;
    const expressFee = distanceCost * expressAdditionalFee;
    let costadjust = baseFee + distanceCost + expressFee;

    let totalCost = 0
    
    if (deliveryDays === 4) {
      totalCost = costadjust
    } else {
      const additionalDays = deliveryDays - 4;
      let adjustmentFactor =  Math.round(discountPerDayLate * additionalDays * 10) / 10;;
      totalCost = costadjust - costadjust * adjustmentFactor;
    }

    setScheduledShippingCost(totalCost);
  };


  // Chạy tính phí ship khi component khởi tạo
  useEffect(() => {
    calculateFreeShippingCost();
    calculateExpressShippingCost();
    calculateScheduledShippingCost();
  }, []); // Chạy một lần khi component được mount

  // Cập nhật phí ship khi người dùng chọn một tùy chọn khác
  useEffect(() => {
    if (selectedOption === "free") {
      calculateFreeShippingCost();
    } else if (selectedOption === "express") {
      calculateExpressShippingCost();
    } else if (selectedOption === "schedule") {
      calculateScheduledShippingCost();
    }
  }, [selectedOption, deliveryDays]); // Chỉ chạy khi tùy chọn hoặc ngày giao hàng thay đổi

  // Hàm điều hướng và lưu phí ship vào localStorage.
  const handleNextStep = () => {
    let shippingCost = 0;
    if (selectedOption === "free") {
      shippingCost = freeShippingCost;
    } else if (selectedOption === "express") {
      shippingCost = expressShippingCost;
    } else if (selectedOption === "schedule") {
      shippingCost = scheduledShippingCost;
    }

    localStorage.setItem("selectedShipping", JSON.stringify(shippingCost));
    navigate("/checkout/payment");
  };

  const getDeliveryDate = (days) => {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + days);
    return deliveryDate.toLocaleDateString();
  };

  return (
    <div className="shipping-step-container">
      <h2 className="mb-4 fw-bold">Shipment Method</h2>
      <ul className="shipping-options">
        <li>
          <input
            className="node"
            type="radio"
            id="free"
            name="shipping"
            value="free"
            checked={selectedOption === "free"}
            onChange={(e) => {
              setSelectedOption(e.target.value);
              setDeliveryDays(10); // Mặc định là 10 ngày cho giao hàng thường
            }}
          />
          <label htmlFor="free">
            <div className="shipping-option">
              <span className="shipping-title">Free</span>
              <span className="shipping-description">-- Regular shipment --</span>
              <span className="shipping-date">{getDeliveryDate(10)}</span>
            </div>
          </label>
        </li>
        <li>
          <input
            className="node"
            type="radio"
            id="express"
            name="shipping"
            value="express"
            checked={selectedOption === "express"}
            onChange={(e) => {
              setSelectedOption(e.target.value);
              setDeliveryDays(4); // Giao hàng nhanh trong 4 ngày
            }}
          />
          <label htmlFor="express">
            <div className="shipping-option">
              <span className="shipping-title">
              <span style={{ fontSize: '12px', verticalAlign: 'super' }}>đ</span>
              {formatPrice(expressShippingCost)}
              </span>
              <span className="shipping-description">
                -- Get your delivery as soon as possible --
              </span>
              <span className="shipping-date">{getDeliveryDate(4)}</span>
            </div>
          </label>
        </li>
        <li>
          <input
            className="node"
            type="radio"
            id="schedule"
            name="shipping"
            value="schedule"
            checked={selectedOption === "schedule"}
            onChange={(e) => setSelectedOption(e.target.value)}
          />
          <label htmlFor="schedule">
            <div className="shipping-option">
              <span className="shipping-title">
                <span style={{ fontSize: '12px', verticalAlign: 'super' }}>đ</span>
                {formatPrice(scheduledShippingCost)}
              </span>
              <span className="shipping-description">
                 -- Schedule delivery at your convenience --
              </span>
              <input
                type="number"
                value={deliveryDays}
                min="1"
                max="10"
                onChange={(e) => setDeliveryDays(Number(e.target.value))}
              />
              <span className="shipping-date">{getDeliveryDate(deliveryDays)}</span>
            </div>
          </label>
        </li>
      </ul>
      <div className="step-navigation">
        <button onClick={() => navigate("/checkout/address")}>Back</button>
        <button onClick={handleNextStep}>Next</button>
      </div>
    </div>
  );
}

export default Step2;
