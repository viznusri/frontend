import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';
import { auth } from '../services/api';
import { LoginCredentials } from '../types';
import { AxiosError } from 'axios';

const schema = yup.object({
  username: yup.string().required('Username or email is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters')
}).required();

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<LoginCredentials>({
    resolver: yupResolver(schema)
  });

  const onSubmit: SubmitHandler<LoginCredentials> = async (data) => {
    try {
      const response = await auth.login(data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Welcome back! 🎉');
      const defaultPath = response.data.user.role === 'admin' ? '/routes/dashboard' : '/routes/feed';
      setTimeout(() => {
        window.location.href = defaultPath;
      }, 1000);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="auth-page-minimal">
      <div className="auth-container-minimal">
        <div className="auth-brand-minimal">
          <h1 className="brand-logo">
            CRED<span className="brand-accent">Karma</span>
          </h1>
        </div>
        
        <div className="auth-content-minimal">
          <div className="auth-header-minimal">
            <h2>Welcome back</h2>
            <p>New to CREDKarma? <Link to="/register" className="link-minimal">Create account</Link></p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form-minimal">
            <div className="form-group-minimal">
              <label htmlFor="username">Username or Email</label>
              <input
                id="username"
                type="text"
                {...register('username')}
                className={errors.username ? 'input-minimal error' : 'input-minimal'}
                autoComplete="username"
              />
              {errors.username && (
                <span className="error-text">{errors.username.message}</span>
              )}
            </div>

            <div className="form-group-minimal">
              <label htmlFor="password">Password</label>
              <div className="password-field">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={errors.password ? 'input-minimal error' : 'input-minimal'}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="show-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <i className="fas fa-eye-slash"></i>
                  ) : (
                    <i className="fas fa-eye"></i>
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="error-text">{errors.password.message}</span>
              )}
            </div>

            <button 
              type="submit" 
              className="button-minimal"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ClipLoader size={16} color="#000" />
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;