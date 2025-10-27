import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  CircularProgress,
  Divider,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Login as LoginIcon,
} from '@mui/icons-material';
import { login } from '../../services/authApi';
import { toast } from 'react-toastify';

// Validation schema
const schema = yup.object({
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
}).required();

function Login() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const response = await login(data);
      const { accessToken, refreshToken, user } = response.data;
      
      // Store the tokens and user data
      localStorage.setItem('token', accessToken);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Show success message
      toast.success('Login successful! Welcome back! 🎉');
      
      // Navigate to dashboard
      setTimeout(() => {
        navigate('/dashboard');
        window.location.reload();
      }, 100);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        padding: 3,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card
          sx={{
            maxWidth: 450,
            width: '100%',
            backdropFilter: 'blur(20px)',
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            borderRadius: 4,
            boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.37)}`,
            border: `1px solid ${alpha(theme.palette.common.white, 0.18)}`,
          }}
        >
          <CardContent sx={{ p: 5 }}>
            {/* Header */}
            <motion.div variants={itemVariants}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  gutterBottom
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  💳 Subscription Manager
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Login to manage your subscriptions
                </Typography>
              </Box>
            </motion.div>

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <motion.div variants={itemVariants}>
                <TextField
                  {...register('email')}
                  fullWidth
                  label="Email Address"
                  placeholder="Enter your email"
                  type="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <TextField
                  {...register('password')}
                  fullWidth
                  label="Password"
                  placeholder="Enter your password"
                  type={showPassword ? 'text' : 'password'}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading || !isValid}
                  startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </motion.div>
            </Box>

            {/* Footer Links */}
            <motion.div variants={itemVariants}>
              <Divider sx={{ my: 3 }} />
              <Box sx={{ textAlign: 'center' }}>
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  variant="body2"
                  sx={{ 
                    mr: 2,
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Forgot Password?
                </Link>
                <Typography variant="body2" component="span" color="text.secondary">
                  |
                </Typography>
                <Link
                  component={RouterLink}
                  to="/signup"
                  variant="body2"
                  sx={{ 
                    ml: 2,
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Create Account
                </Link>
              </Box>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}

export default Login;