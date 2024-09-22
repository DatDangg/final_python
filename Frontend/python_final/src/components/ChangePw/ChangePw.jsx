import React, { useState } from "react";
import axios from "axios";
import "./ChangePw.css"

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = localStorage.getItem("token");
  const apiurl = import.meta.env.VITE_REACT_APP_API_URL;

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`${apiurl}/change-password/`, {
        old_password: oldPassword,
        new_password: newPassword
      },
      {
        headers: {
            Authorization: `Token ${token}`,
          },
      }
    )
    .then((response) => {
      setSuccess(response.data.success);
      setError("");
    })
    .catch((error) => {
      setError(error.response.data.error);
      setSuccess("");
    });
  };

  return (
    <div className="container pt-4 mb-4">
      <div className="change-pw row">
        <h2 className="fw-bold">Change Password</h2>
        {success && <p style={{color: "green"}}>{success}</p>}
        {error && <p style={{color: "red"}}>{error}</p>}
        <form className="" onSubmit={handleSubmit}>
          <div>
            <label>Mật khẩu cũ:</label>
            <input
                className="box ml"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-5 pt-4">Mật khẩu mới:</label>
            <input
                className="box"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <button className="btn btn-outline-dark" type="submit">Đổi Mật Khẩu</button>
        </form>
      </div>

    </div>
  );
};

export default ChangePassword;
