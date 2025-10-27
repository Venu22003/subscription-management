import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  TextField,
  MenuItem,
  Container,
  alpha,
  useTheme,
  Stack,
  Chip,
  InputAdornment,
  FormHelperText,
} from '@mui/material';
import {
  Save,
  Cancel,
  AttachMoney,
  CalendarToday,
  Category as CategoryIcon,
  Description,
} from '@mui/icons-material';
import { addSubscription } from '../../services/subscriptionApi';
import { toast } from 'react-toastify';

// Categories
const CATEGORIES = [
  { _id: 'entertainment', name: "Entertainment", icon: "🎬", color: "#e74c3c" },
  { _id: 'music', name: "Music", icon: "🎵", color: "#3498db" },
  { _id: 'gaming', name: "Gaming", icon: "🎮", color: "#2ecc71" },
  { _id: 'productivity', name: "Productivity", icon: "💼", color: "#f1c40f" },
  { _id: 'cloud', name: "Cloud Storage", icon: "☁️", color: "#9b59b6" },
  { _id: 'software', name: "Software", icon: "💻", color: "#34495e" },
  { _id: 'health', name: "Health & Fitness", icon: "💪", color: "#e67e22" },
  { _id: 'education', name: "Education", icon: "📚", color: "#16a085" },
  { _id: 'news', name: "News & Media", icon: "📰", color: "#c0392b" },
  { _id: 'others', name: "Others", icon: "📦", color: "#95a5a6" }
];

// Validation schema
const schema = yup.object({
  name: yup
    .string()
    .required('Subscription name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  cost: yup
    .number()
    .typeError('Cost must be a number')
    .required('Cost is required')
    .positive('Cost must be positive')
    .max(1000000, 'Cost is too high'),
  category: yup
    .string()
    .required('Category is required'),
  frequency: yup
    .string()
    .oneOf(['monthly', 'yearly', 'weekly'], 'Invalid frequency')
    .required('Frequency is required'),
  startDate: yup
    .date()
    .required('Start date is required')
    .max(new Date(), 'Start date cannot be in the future'),
  notes: yup
    .string()
    .max(500, 'Notes must be less than 500 characters'),
}).required();

function AddSubscription() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      cost: '',
      category: '',
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  const selectedCategory = watch('category');
  const cost = watch('cost');
  const frequency = watch('frequency');

  // Calculate monthly equivalent
  const getMonthlyEquivalent = () => {
    if (!cost || !frequency) return 0;
    const costNum = parseFloat(cost);
    if (frequency === 'monthly') return costNum;
    if (frequency === 'yearly') return (costNum / 12).toFixed(2);
    if (frequency === 'weekly') return (costNum * 4.33).toFixed(2);
    return 0;
  };

  const onSubmit = async (data) => {
    setLoading(true);

    // Calculate next billing date
    const startDateObj = new Date(data.startDate);
    const nextBillingDate = new Date(startDateObj);
    
    switch (data.frequency) {
      case 'weekly':
        nextBillingDate.setDate(nextBillingDate.getDate() + 7);
        break;
      case 'monthly':
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        break;
      case 'yearly':
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
        break;
      default:
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    }

    const subscriptionData = {
      name: data.name.trim(),
      price: parseFloat(data.cost),
      category: data.category,
      billingCycle: data.frequency.toLowerCase(),
      startDate: data.startDate,
      nextBillingDate: nextBillingDate.toISOString(),
      notes: data.notes.trim(),
      description: data.notes.trim(),
    };

    try {
      await addSubscription(subscriptionData);
      toast.success('Subscription added successfully! 🎉');
      navigate('/subscriptions');
    } catch (error) {
      console.error('Error adding subscription:', error);
      toast.error(error.response?.data?.message || 'Failed to add subscription');
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
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

  const categoryData = CATEGORIES.find(cat => cat._id === selectedCategory);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark'
          ? theme.palette.background.default
          : `linear-gradient(to bottom, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${theme.palette.background.default} 100%)`,
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants}>
            <Box sx={{ mb: 4 }}>
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
                Add New Subscription
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Track a new subscription expense
              </Typography>
            </Box>
          </motion.div>

          {/* Form */}
          <motion.div variants={itemVariants}>
            <Card
              sx={{
                backdropFilter: 'blur(20px)',
                backgroundColor: alpha(theme.palette.background.paper, 0.9),
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                  <Grid container spacing={3}>
                    {/* Name */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...register('name')}
                        fullWidth
                        label="Subscription Name"
                        placeholder="e.g., Netflix"
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Description color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    {/* Cost */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...register('cost')}
                        fullWidth
                        label="Cost"
                        placeholder="Enter amount"
                        type="number"
                        error={!!errors.cost}
                        helperText={errors.cost?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              ₹
                            </InputAdornment>
                          ),
                        }}
                        inputProps={{
                          step: '0.01',
                          min: '0.01',
                        }}
                      />
                    </Grid>

                    {/* Category */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...register('category')}
                        fullWidth
                        select
                        label="Category"
                        error={!!errors.category}
                        helperText={errors.category?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CategoryIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      >
                        <MenuItem value="">Select a category</MenuItem>
                        {CATEGORIES.map((cat) => (
                          <MenuItem key={cat._id} value={cat._id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span>{cat.icon}</span>
                              <span>{cat.name}</span>
                            </Box>
                          </MenuItem>
                        ))}
                      </TextField>
                      {categoryData && (
                        <Box sx={{ mt: 1 }}>
                          <Chip
                            label={`${categoryData.icon} ${categoryData.name}`}
                            size="small"
                            sx={{
                              backgroundColor: alpha(categoryData.color, 0.15),
                              color: categoryData.color,
                              fontWeight: 500,
                              border: `1px solid ${alpha(categoryData.color, 0.3)}`,
                            }}
                          />
                        </Box>
                      )}
                    </Grid>

                    {/* Frequency */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...register('frequency')}
                        fullWidth
                        select
                        label="Billing Frequency"
                        error={!!errors.frequency}
                        helperText={errors.frequency?.message}
                      >
                        <MenuItem value="monthly">Monthly</MenuItem>
                        <MenuItem value="yearly">Yearly</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                      </TextField>
                      {cost && frequency && (
                        <FormHelperText sx={{ color: 'primary.main', fontWeight: 500 }}>
                          ≈ ₹{getMonthlyEquivalent()}/month
                        </FormHelperText>
                      )}
                    </Grid>

                    {/* Start Date */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...register('startDate')}
                        fullWidth
                        label="Start Date"
                        type="date"
                        error={!!errors.startDate}
                        helperText={errors.startDate?.message}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarToday color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    {/* Monthly Cost Preview */}
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 2,
                          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                          borderRadius: 2,
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        }}
                      >
                        <Stack spacing={0.5} alignItems="center">
                          <Typography variant="caption" color="text.secondary">
                            Monthly Cost
                          </Typography>
                          <Typography variant="h5" fontWeight="bold" color="primary">
                            ₹{getMonthlyEquivalent()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ≈ ₹{(getMonthlyEquivalent() * 12).toFixed(2)}/year
                          </Typography>
                        </Stack>
                      </Box>
                    </Grid>

                    {/* Notes */}
                    <Grid item xs={12}>
                      <TextField
                        {...register('notes')}
                        fullWidth
                        label="Notes (Optional)"
                        placeholder="Any additional details..."
                        multiline
                        rows={3}
                        error={!!errors.notes}
                        helperText={errors.notes?.message || `${watch('notes')?.length || 0}/500 characters`}
                      />
                    </Grid>

                    {/* Action Buttons */}
                    <Grid item xs={12}>
                      <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          startIcon={<Cancel />}
                          onClick={() => navigate('/subscriptions')}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<Save />}
                          disabled={loading || !isValid}
                          sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                              transform: 'translateY(-2px)',
                              boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {loading ? 'Adding...' : 'Add Subscription'}
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
}

export default AddSubscription;
