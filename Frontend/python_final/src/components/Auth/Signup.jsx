import React, { useState, useContext } from 'react';
import axios from 'axios';
import {Link, useNavigate} from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './signup.css';

function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return `Password must be at least ${minLength} characters long.`;
    }
    if (!hasUpperCase) {
      return 'Password must contain at least one uppercase letter.';
    }
    if (!hasLowerCase) {
      return 'Password must contain at least one lowercase letter.';
    }
    if (!hasNumber) {
      return 'Password must contain at least one number.';
    }
    if (!hasSpecialChar) {
      return 'Password must contain at least one special character.';
    }

    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const passwordValidationMessage = validatePassword(password);
    if (passwordValidationMessage) {
      setPasswordError(passwordValidationMessage);
      return;
    }
    
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/auth/register/', {
        username,
        password,
        email,
      });
      login(response.data.token);
      navigate('/');
    } catch (err) {
      setError('Username already exists');
    }
  };

  return (
      <div className="container-fluid">
        <div className="row d-flex section">
          <div className="col-md-7 login-section d-flex align-items-center justify-content-center">
            <div className="login-box mx-auto text-center">
              <h3 className="sign f-prata">Sign Up</h3>
              <div className="signup f-inter">
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError(validatePassword(e.target.value));
                  }}/>
                  {passwordError && <p className="error">{passwordError}</p>}
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (password !== e.target.value) {
                        setConfirmPasswordError('Passwords do not match.');
                      } else {
                        setConfirmPasswordError('');
                      }
                  }}/>
                  {confirmPasswordError && <p className="error">{confirmPasswordError}</p>}
                  <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                  />
                  <button type="submit">Sign Up</button>
                  <Link className="f-inter back text-end text-decoration-underline" to="/auth">
                    Back
                  </Link>
                  {error && <p className="error">{error}</p>}
                </form>
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

  )
      ;
};

export default Signup;
