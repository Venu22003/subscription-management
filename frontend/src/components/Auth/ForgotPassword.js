import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  CircularProgress,
  alpha,
  useTheme,
  Alert,
} from '@mui/material';
import {
  Email,
  ArrowBack,
  CheckCircle,
  LockReset,
} from '@mui/icons-material';
import { forgotPassword } from '../../services/authApi';
import { toast } from 'react-toastify';
import './ForgotPassword.css';

// Validation schema
const schema = yup.object({
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
}).required();

function ForgotPassword() {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [resetLinkSent, setResetLinkSent] = useState(false);
  const [userEmail, setUserEmail] = useState('');

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
    setUserEmail(data.email);

    try {
      const response = await forgotPassword(data.email);
      toast.success('Password reset link sent! Check your email 📧');
      setResetLinkSent(true);
      console.log('Reset URL:', response.data.resetUrl);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
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
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      y: -50,
      transition: { duration: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  const successVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 15,
      },
    },
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
      <AnimatePresence mode="wait">
        {!resetLinkSent ? (
          <motion.div
            key="form"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
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
                    <Box
                      sx={{
                        display: 'inline-flex',
                        p: 2,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        mb: 2,
                      }}
                    >
                      <LockReset sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
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
                      Forgot Password?
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      No worries! Enter your email and we'll send you a reset link
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
                      placeholder="Enter your registered email"
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
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={loading || !isValid}
                      startIcon={loading ? <CircularProgress size={20} /> : <Email />}
                      sx={{
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
                      {loading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                  </motion.div>
                </Box>

                {/* Back to Login */}
                <motion.div variants={itemVariants}>
                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Link
                      component={RouterLink}
                      to="/login"
                      variant="body2"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        textDecoration: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      <ArrowBack sx={{ fontSize: 18, mr: 0.5 }} />
                      Back to Login
                    </Link>
                  </Box>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            variants={successVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
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
                <Box sx={{ textAlign: 'center' }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{
                      type: 'spring',
                      stiffness: 200,
                      damping: 15,
                      delay: 0.2,
                    }}
                  >
                    <CheckCircle
                      sx={{
                        fontSize: 80,
                        color: theme.palette.success.main,
                        mb: 2,
                      }}
                    />
                  </motion.div>

                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    gutterBottom
                    sx={{
                      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Check Your Email!
                  </Typography>

                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    We've sent a password reset link to
                  </Typography>

                  <Alert
                    severity="success"
                    sx={{
                      mb: 3,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                      '& .MuiAlert-icon': {
                        color: theme.palette.success.main,
                      },
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      {userEmail}
                    </Typography>
                  </Alert>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Click the link in the email to reset your password. 
                    The link will expire in 1 hour.
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Didn't receive the email? Check your spam folder or
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setResetLinkSent(false);
                        setUserEmail('');
                      }}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      Try Again
                    </Button>
                    <Button
                      component={RouterLink}
                      to="/login"
                      variant="contained"
                      startIcon={<ArrowBack />}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                        },
                      }}
                    >
                      Back to Login
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}

export default ForgotPassword;