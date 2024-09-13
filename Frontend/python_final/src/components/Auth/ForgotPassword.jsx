// src/components/Auth/ForgotPassword.jsx
import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import axios from 'axios';

const ForgotPassword = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');  // Lưu mã xác nhận
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);  // Quản lý bước hiện tại

  // Hàm gửi email với EmailJS
  const sendVerificationCode = async (e) => {
    e.preventDefault();

    // Tạo mã xác nhận ngẫu nhiên
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(generatedCode);

    // Cấu hình thông tin để gửi email qua EmailJS
    const templateParams = {
      to_email: email,
      username: username,
      verification_code: `${generatedCode}`
    };

    try {
      // Gửi email sử dụng EmailJS
      await emailjs.send(
        'service_n57axpe',  // Thay bằng Service ID từ EmailJS
        'template_c5nvl8w',  // Thay bằng Template ID từ EmailJS
        templateParams,
        'S55P341Zxv_KDoxYg'       // Thay bằng User ID từ EmailJS
      );

      alert('Verification code sent to your email.');
      setStep(2);  // Chuyển sang bước nhập mã xác nhận

    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();
    if (code === verificationCode) {
      alert('Code verified. You can now reset your password.');
      setStep(3);  // Chuyển sang bước nhập mật khẩu mới
    } else {
      alert('Incorrect verification code.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      // Gọi API backend để đặt lại mật khẩu mới
      await axios.post('http://localhost:8000/reset-password/', { username, newPassword });
      alert('Password has been reset successfully.');
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Failed to reset password.');
    }
  };

  return (
    <div className="forgot-password">
      {step === 1 && (
        <form onSubmit={sendVerificationCode}>
          <h2>Forgot Password</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Send Code</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyCode}>
          <h2>Enter Verification Code</h2>
          <input
            type="text"
            placeholder="Verification Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <button type="submit">Verify Code</button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword}>
          <h2>Reset Password</h2>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button type="submit">Reset Password</button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
