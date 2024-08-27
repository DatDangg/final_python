import React, { useState, useEffect } from "react";
import axios from "axios";

function UserProfile() {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    profile: {
      date_of_birth: "",
      gender: "",
      phone_number: "",
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("http://127.0.0.1:8000/auth/profile/", {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      console.log('Dữ liệu phản hồi API:', response.data);
      // Cập nhật dữ liệu nếu có profile, nếu không thì giữ nguyên giá trị mặc định
      setUserData(prevState => ({
        ...prevState,
        ...response.data,
        profile: response.data.profile || prevState.profile,
      }));
      setLoading(false);
    })
    .catch(error => {
      console.error('Lỗi API:', error);
      setError(error);
      setLoading(false);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevState => ({
      ...prevState,
      profile: {
        ...prevState.profile,
        [name]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put("http://127.0.0.1:8000/auth/profile/", userData, {
      headers: {
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
    .then(response => {
      alert("Cập nhật hồ sơ thành công!");
    })
    .catch(error => {
      console.log(error);
    });
  };
  

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (error) {
    return <div>Lỗi khi tải hồ sơ!</div>;
  }

  return (
    <div>
      <h2>Hồ sơ</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Tên đăng nhập:</label>
          <input
            type="text"
            value={userData.username}
            disabled
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={userData.email}
            disabled
          />
        </div>
        <div>
          <label>Ngày sinh:</label>
          <input
            type="date"
            name="date_of_birth"
            value={userData.profile.date_of_birth || ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Giới tính:</label>
          <select
            name="gender"
            value={userData.profile.gender || ""}
            onChange={handleChange}
          >
            <option value="">Chọn</option>
            <option value="Male">Nam</option>
            <option value="Female">Nữ</option>
          </select>
        </div>
        <div>
          <label>Số điện thoại:</label>
          <input
            type="text"
            name="phone_number"
            value={userData.profile.phone_number || ""}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Cập nhật hồ sơ</button>
      </form>
    </div>
  );
}

export default UserProfile;
