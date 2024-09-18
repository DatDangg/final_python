import React, { useState } from "react";
import axios from "axios";
// import { useHistory } from "react-router-dom";

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = localStorage.getItem("token");
//   const history = useHistory();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("http://127.0.0.1:8000/change-password/", {
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
      // Điều hướng người dùng đến trang khác nếu cần
      // history.push('/profile');
    })
    .catch((error) => {
      setError(error.response.data.error);
      setSuccess("");
    });
  };

  return (
    <div>
      <h2>Đổi Mật Khẩu</h2>
      {success && <p style={{ color: "green" }}>{success}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Mật khẩu cũ:</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </div>
        <div>
          <label>Mật khẩu mới:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <button type="submit">Đổi Mật Khẩu</button>
      </form>
    </div>
  );
};

export default ChangePassword;
