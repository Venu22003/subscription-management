import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Stack,
  Container,
  alpha,
  useTheme,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  ContentCopy,
  CheckCircle,
  Search,
  FilterList,
} from '@mui/icons-material';
import {
  getAllSubscriptions,
  deleteSubscription,
  duplicateSubscription,
  markAsPaid,
} from '../../services/subscriptionApi';
import { toast } from 'react-toastify';

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

const getCategoryById = (categoryId) => {
  return CATEGORIES.find(cat => cat._id === categoryId) || { name: 'Unknown', icon: '📦', color: '#95a5a6' };
};

function SubscriptionList() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [frequencyFilter, setFrequencyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });
  const [processingPayment, setProcessingPayment] = useState(new Set()); // Track which subscriptions are being marked as paid

  useEffect(() => {
    let isMounted = true;
    
    const loadSubscriptions = async () => {
      // Check if user is authenticated before fetching
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!token || !isMounted) {
        return;
      }
      await fetchSubscriptions();
    };
    
    loadSubscriptions();
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterAndSortSubscriptions = useCallback(() => {
    let filtered = [...subscriptions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((sub) =>
        sub.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((sub) => sub.category === categoryFilter);
    }

    // Frequency filter (handle both old and new field names)
    if (frequencyFilter !== 'all') {
      filtered = filtered.filter((sub) => {
        const cycle = sub.billingCycle || sub.frequency || '';
        return cycle.toLowerCase() === frequencyFilter.toLowerCase();
      });
    }

    // Sort (handle both old and new field names)
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'cost-asc') {
        const priceA = a.price || a.cost || 0;
        const priceB = b.price || b.cost || 0;
        return priceA - priceB;
      } else if (sortBy === 'cost-desc') {
        const priceA = a.price || a.cost || 0;
        const priceB = b.price || b.cost || 0;
        return priceB - priceA;
      } else if (sortBy === 'date') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });

    setFilteredSubscriptions(filtered);
  }, [subscriptions, searchTerm, categoryFilter, frequencyFilter, sortBy]);

  useEffect(() => {
    filterAndSortSubscriptions();
  }, [filterAndSortSubscriptions]);

  const fetchSubscriptions = async () => {
    // Check authentication before making API call
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await getAllSubscriptions();
      console.log('Fetched subscriptions:', response.data);
      setSubscriptions(response.data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      // Don't show error if it's an auth error (user logged out)
      if (error.response?.status !== 401) {
        toast.error('Failed to load subscriptions');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    setDeleteDialog({ open: false, id: null, name: '' });
    try {
      await deleteSubscription(id);
      toast.success('Subscription deleted successfully');
      fetchSubscriptions();
    } catch (error) {
      console.error('Error deleting subscription:', error);
      toast.error('Failed to delete subscription');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await duplicateSubscription(id);
      toast.success('Subscription duplicated successfully');
      fetchSubscriptions();
    } catch (error) {
      console.error('Error duplicating subscription:', error);
      toast.error('Failed to duplicate subscription');
    }
  };

  const handleMarkPaid = async (id, name) => {
    // Prevent duplicate clicks
    if (processingPayment.has(id)) {
      toast.info('Processing payment, please wait...');
      return;
    }

    try {
      setProcessingPayment(prev => new Set(prev).add(id));
      await markAsPaid(id, 'Manual');
      toast.success(`${name} marked as paid`);
      await fetchSubscriptions();
    } catch (error) {
      console.error('Error marking as paid:', error);
      if (error.response?.status === 400) {
        toast.warning(error.response.data.message || 'Payment already recorded');
      } else {
        toast.error('Failed to mark as paid');
      }
    } finally {
      // Remove from processing set after a delay to prevent rapid clicks
      setTimeout(() => {
        setProcessingPayment(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }, 2000);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={30} sx={{ mb: 2 }} />
                  <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="50%" height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="70%" height={20} sx={{ mb: 2 }} />
                  <Stack direction="row" spacing={1}>
                    <Skeleton variant="rectangular" width={60} height={32} />
                    <Skeleton variant="rectangular" width={80} height={32} />
                    <Skeleton variant="rectangular" width={70} height={32} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'transparent',
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
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
              My Subscriptions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filteredSubscriptions.length} subscription{filteredSubscriptions.length !== 1 ? 's' : ''} found
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/subscriptions/add')}
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
            Add Subscription
          </Button>
        </Box>

        {/* Filters */}
        <Card
          sx={{
            mb: 4,
            backdropFilter: 'blur(20px)',
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
          }}
        >
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <FilterList color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Filters & Search
              </Typography>
            </Stack>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {CATEGORIES.map((cat) => (
                    <MenuItem key={cat._id} value={cat._id}>
                      {cat.icon} {cat.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Frequency"
                  value={frequencyFilter}
                  onChange={(e) => setFrequencyFilter(e.target.value)}
                >
                  <MenuItem value="all">All Frequencies</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Sort By"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="cost-asc">Cost (Low to High)</MenuItem>
                  <MenuItem value="cost-desc">Cost (High to Low)</MenuItem>
                  <MenuItem value="date">Date Added</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Subscriptions Grid */}
        {filteredSubscriptions.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
            }}
          >
            <Typography variant="h5" color="text.secondary" gutterBottom>
              {subscriptions.length === 0 ? '📦 No Subscriptions Yet' : '🔍 No Matches Found'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {subscriptions.length === 0
                ? 'Add your first subscription to get started'
                : 'Try adjusting your filters'}
            </Typography>
            {subscriptions.length === 0 && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/subscriptions/add')}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                  },
                }}
              >
                Add Subscription
              </Button>
            )}
          </Box>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Grid container spacing={3}>
              <AnimatePresence mode="popLayout">
                {filteredSubscriptions.map((sub) => {
                  const category = getCategoryById(sub.category);
                  return (
                    <Grid item xs={12} sm={6} md={4} key={sub._id}>
                      <motion.div variants={cardVariants} layout exit="exit">
                        <Card
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            overflow: 'hidden',
                            backdropFilter: 'blur(20px)',
                            backgroundColor: alpha(theme.palette.background.paper, 0.9),
                            '&:hover': {
                              transform: 'translateY(-8px)',
                              boxShadow: theme.shadows[12],
                            },
                            transition: 'all 0.3s ease',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: 4,
                              background: category.color,
                            },
                          }}
                        >
                          <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                            {/* Header */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1, pr: 1 }}>
                                {sub.name}
                              </Typography>
                              <Chip
                                label={sub.status === 'active' ? 'Active' : sub.status || 'Active'}
                                color={sub.status === 'active' ? 'success' : 'default'}
                                size="small"
                                icon={sub.status === 'active' ? <CheckCircle /> : undefined}
                                sx={{ textTransform: 'capitalize' }}
                              />
                            </Box>

                            {/* Cost */}
                            <Typography
                              variant="h4"
                              fontWeight="bold"
                              color="primary"
                              sx={{ mb: 2 }}
                            >
                              ₹{sub.price || sub.cost || 0}
                              <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1, textTransform: 'capitalize' }}>
                                / {sub.billingCycle || sub.frequency || 'monthly'}
                              </Typography>
                            </Typography>

                            {/* Details */}
                            <Stack spacing={1.5} sx={{ mb: 2 }}>
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Category
                                </Typography>
                                <Box sx={{ mt: 0.5 }}>
                                  <Chip
                                    label={`${category.icon} ${category.name}`}
                                    size="small"
                                    sx={{
                                      backgroundColor: alpha(category.color, 0.15),
                                      color: category.color,
                                      fontWeight: 500,
                                      border: `1px solid ${alpha(category.color, 0.3)}`,
                                    }}
                                  />
                                </Box>
                              </Box>

                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Next Payment
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                  {new Date(sub.nextBillingDate || sub.nextPaymentDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </Typography>
                              </Box>

                              {/* Payment Statistics */}
                              {(sub.paymentCount > 0 || sub.totalSpent > 0) && (
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Payment History
                                  </Typography>
                                  <Typography variant="body2" fontWeight={500}>
                                    {sub.paymentCount || 0} payment{sub.paymentCount !== 1 ? 's' : ''} · ₹{sub.totalSpent || 0} total
                                  </Typography>
                                  {sub.lastPaymentDate && (
                                    <Typography variant="caption" color="text.secondary">
                                      Last: {new Date(sub.lastPaymentDate).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                      })}
                                    </Typography>
                                  )}
                                </Box>
                              )}

                              {sub.notes && (
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Notes
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontStyle: 'italic',
                                      color: 'text.secondary',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                    }}
                                  >
                                    {sub.notes}
                                  </Typography>
                                </Box>
                              )}
                            </Stack>

                            {/* Actions */}
                            <Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => navigate(`/subscriptions/edit/${sub._id}`)}
                                  sx={{
                                    '&:hover': {
                                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    },
                                  }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Duplicate">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleDuplicate(sub._id)}
                                  sx={{
                                    '&:hover': {
                                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                                    },
                                  }}
                                >
                                  <ContentCopy fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={processingPayment.has(sub._id) ? "Processing..." : "Mark as Paid"}>
                                <span>
                                  <IconButton
                                    size="small"
                                    color="success"
                                    onClick={() => handleMarkPaid(sub._id, sub.name)}
                                    disabled={processingPayment.has(sub._id)}
                                    sx={{
                                      '&:hover': {
                                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                                      },
                                      '&.Mui-disabled': {
                                        opacity: 0.5,
                                      },
                                    }}
                                  >
                                    <CheckCircle fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => setDeleteDialog({ open: true, id: sub._id, name: sub.name })}
                                  sx={{
                                    '&:hover': {
                                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                                    },
                                  }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  );
                })}
              </AnimatePresence>
            </Grid>
          </motion.div>
        )}
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, name: '' })}
        PaperProps={{
          sx: {
            backdropFilter: 'blur(20px)',
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
          },
        }}
      >
        <DialogTitle>Delete Subscription?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>"{deleteDialog.name}"</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null, name: '' })}>
            Cancel
          </Button>
          <Button
            onClick={() => handleDelete(deleteDialog.id, deleteDialog.name)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SubscriptionList;