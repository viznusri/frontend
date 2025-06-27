import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';
import { auth } from '../services/api';
import { RegisterData } from '../types';
import { AxiosError } from 'axios';

const schema = yup.object({
  username: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
  email: yup.string().required('Email is required').email('Invalid email format'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  role: yup.string().required('Role is required').oneOf(['user', 'admin'] as const, 'Please select a valid role') as yup.StringSchema<'user' | 'admin'>
}).required();

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<RegisterData>({
    resolver: yupResolver(schema)
  });

  const onSubmit: SubmitHandler<RegisterData> = async (data) => {
    if (!acceptedTerms) {
      toast.error('Please accept the terms and conditions to continue');
      return;
    }
    
    try {
      const response = await auth.register(data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Welcome to CREDKarma! 🚀');
      const defaultPath = response.data.user.role === 'admin' ? '/routes/dashboard' : '/routes/feed';
      setTimeout(() => {
        window.location.href = defaultPath;
      }, 1000);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
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
            <h2>Create account</h2>
            <p>Already have an account? <Link to="/login" className="link-minimal">Sign in</Link></p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form-minimal">
            <div className="form-group-minimal">
              <label htmlFor="username">Username</label>
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
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className={errors.email ? 'input-minimal error' : 'input-minimal'}
                autoComplete="email"
              />
              {errors.email && (
                <span className="error-text">{errors.email.message}</span>
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
                  autoComplete="new-password"
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

            <div className="form-group-minimal">
              <label htmlFor="role">Account Type</label>
              <select
                id="role"
                {...register('role')}
                className={errors.role ? 'input-minimal error' : 'input-minimal'}
                defaultValue=""
              >
                <option value="" disabled>Select account type</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && (
                <span className="error-text">{errors.role.message}</span>
              )}
            </div>

            <div className="form-group-minimal checkbox-group">
              <label className="checkbox-minimal">
                <input 
                  type="checkbox" 
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                />
                <span className="checkbox-text">
                  I agree to the <Link to="#" className="link-accent">Terms and Conditions</Link> and <Link to="#" className="link-accent">Privacy Policy</Link>
                </span>
              </label>
              {!acceptedTerms && isSubmitting && (
                <span className="error-text">You must accept the terms and conditions</span>
              )}
            </div>

            <button 
              type="submit" 
              className="button-minimal"
              disabled={isSubmitting || !acceptedTerms}
              style={{ opacity: !acceptedTerms ? 0.6 : 1 }}
            >
              {isSubmitting ? (
                <ClipLoader size={16} color="#000" />
              ) : (
                'Create account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;