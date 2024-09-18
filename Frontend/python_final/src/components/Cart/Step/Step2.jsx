import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./step2.css";

function Step2() {
  const [selectedOption, setSelectedOption] = useState("free");
  const navigate = useNavigate();

  const handleNextStep = () => {
    const shippingCost =
      selectedOption === "free" ? 0 : selectedOption === "express" ? 850 : 500;
    localStorage.setItem("selectedShipping", JSON.stringify(shippingCost));
    navigate("/checkout/payment");
  };

  return (
    <div className="shipping-step-container">
      <h2 className="mb-4 fw-bold">Shipment Method</h2>
      <ul className="shipping-options">
        <li>
          <input className="node "
            type="radio"
            id="free"
            name="shipping"
            value="free"
            checked={selectedOption === "free"}
            onChange={(e) => setSelectedOption(e.target.value)}
          />
          <label htmlFor="free">
            <div className="shipping-option">
              <span className="shipping-title">Free  </span>
              <span className="shipping-description">-- Regular shipment -- </span>
              <span className="shipping-date">17 Oct, 2023</span>
            </div>
          </label>
        </li>
        <li>
          <input className="node"
            type="radio"
            id="express"
            name="shipping"
            value="express"
            checked={selectedOption === "express"}
            onChange={(e) => setSelectedOption(e.target.value)}
          />
          <label htmlFor="express">
            <div className="shipping-option">
              <span className="shipping-title"><></>20000đ</span>
              <span className="shipping-description">
                -- Get your delivery as soon as possible --
              </span>
              <span className="shipping-date">1 Oct, 2023</span>
            </div>
          </label>
        </li>
        <li>
          <input className="node"
            type="radio"
            id="schedule"
            name="shipping"
            value="schedule"
            checked={selectedOption === "schedule"}
            onChange={(e) => setSelectedOption(e.target.value)}
          />
          <label htmlFor="schedule">
            <div className="shipping-option">
              <span className="shipping-title"><></>10000đ</span>
              <span className="shipping-description">
               -- Schedule delivery at your convenience --
              </span>
              <span className="shipping-date">5 Oct, 2023</span>
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
