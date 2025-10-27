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
  LinearProgress,
  alpha,
  useTheme,
  Chip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  CheckCircle,
  PersonAdd,
} from '@mui/icons-material';
import { signup } from '../../services/authApi';
import { toast } from 'react-toastify';

// Validation schema
const schema = yup.object({
  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .required('Full name is required'),
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[@$!%*?&]/, 'Password must contain at least one special character (@$!%*?&)')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
}).required();

function Signup() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const password = watch('password', '');

  // Password strength calculation
  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (pwd.length >= 12) strength += 15;
    if (/[a-z]/.test(pwd)) strength += 15;
    if (/[A-Z]/.test(pwd)) strength += 15;
    if (/[0-9]/.test(pwd)) strength += 15;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 15;
    
    if (strength < 40) return { strength, label: 'Weak', color: 'error' };
    if (strength < 70) return { strength, label: 'Medium', color: 'warning' };
    return { strength, label: 'Strong', color: 'success' };
  };

  const passwordStrength = calculatePasswordStrength(password);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      await signup({
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      toast.success('Account created successfully! 🎉 Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
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
        staggerChildren: 0.08,
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
            maxWidth: 500,
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
                  💳 Create Account
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Start managing your subscriptions today
                </Typography>
              </Box>
            </motion.div>

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <motion.div variants={itemVariants}>
                <TextField
                  {...register('name')}
                  fullWidth
                  label="Full Name"
                  placeholder="Enter your full name"
                  type="text"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </motion.div>

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
                  placeholder="Create a strong password"
                  type={showPassword ? 'text' : 'password'}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  sx={{ mb: 1 }}
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
                
                {/* Password Strength Indicator */}
                {password && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Password Strength
                      </Typography>
                      <Chip
                        label={passwordStrength.label}
                        color={passwordStrength.color}
                        size="small"
                        icon={passwordStrength.strength >= 70 ? <CheckCircle /> : undefined}
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={passwordStrength.strength}
                      color={passwordStrength.color}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: alpha(theme.palette.grey[500], 0.2),
                      }}
                    />
                  </Box>
                )}
              </motion.div>

              <motion.div variants={itemVariants}>
                <TextField
                  {...register('confirmPassword')}
                  fullWidth
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
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
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          size="small"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                  startIcon={loading ? <CircularProgress size={20} /> : <PersonAdd />}
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
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </Button>
              </motion.div>
            </Box>

            {/* Footer Links */}
            <motion.div variants={itemVariants}>
              <Divider sx={{ my: 3 }} />
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" component="span">
                  Already have an account?{' '}
                </Typography>
                <Link
                  component={RouterLink}
                  to="/login"
                  variant="body2"
                  sx={{ 
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Login
                </Link>
              </Box>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}

export default Signup;