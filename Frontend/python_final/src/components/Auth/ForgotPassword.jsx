import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import axios from 'axios';
import {useNavigate} from "react-router-dom";
import "./fw.css"

const ForgotPassword = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');  
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);  
  const navigate = useNavigate();
  const apiurl = import.meta.env.VITE_REACT_APP_API_URL;

  const sendVerificationCode = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post(`${apiurl}/check-username-email/`, {
        username,
        email,
      });
  
      if (response.data.exists) {
        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        setVerificationCode(generatedCode);
  
        const templateParams = {
          to_email: email,
          username: username,
          verification_code: `${generatedCode}`,
        };
  
        await emailjs.send(
          'service_n57axpe',
          'template_c5nvl8w',
          templateParams,
          'S55P341Zxv_KDoxYg'
        );
  
        alert('Verification code sent to your email.');
        setStep(2);
      } else {
        alert('Username and email do not match. Please check and try again.');
      }
    } catch (error) {
      console.error('Failed to send verification code:', error);
      alert('Failed to check username and email. Please try again.');
    }
  };
  

  const handleVerifyCode = (e) => {
    e.preventDefault();
    if (code === verificationCode) {
      alert('Code verified. You can now reset your password.');
      setStep(3); 
    } else {
      alert('Incorrect verification code.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiurl}/reset-password/`, { username, newPassword });
      alert('Password has been reset successfully.');
      navigate("/auth/login"); 
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Failed to reset password.');
    }
  };

  return (
      <div className="container-fluid">
        <div className="row d-flex section">
          <div className="col-md-7 login-section d-flex align-items-center justify-content-center">
            <div className="login-box mx-auto text-center">
              <div className="forgot-password">
                {step === 1 && (
                    <form onSubmit={sendVerificationCode}>
                      <h2 className="f-prata">Forgot Password</h2>
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

            </div>

          </div>
          <div className="col-md-5 d-flex image-section justify-content-center align-items-center ">
            <div className="text-center">
              <p className="text-white text-uppercase f-prata">Welcome</p>
              <p className="text-white text-uppercase f-prata p-0">to our website !</p>
              <img className="text-center" src="/photos/giohang.png" alt=""/>
            </div>

          </div>
        </div>
      </div>

  );
};

export default ForgotPassword;
