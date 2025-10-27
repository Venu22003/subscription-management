import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Skeleton,
  Paper,
  alpha,
  useTheme,
  Avatar,
  Stack,
  Container,
} from '@mui/material';
import {
  TrendingUp,
  CalendarToday,
  Subscriptions,
  Add,
  AccountBalanceWallet,
  ShowChart,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getDashboardStats } from '../../services/dashboardApi';
import { toast } from 'react-toastify';

// Same categories as other components
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

// Helper function to get category details by ID
const getCategoryById = (categoryId) => {
    return CATEGORIES.find(cat => cat._id === categoryId) || { name: 'Unknown', icon: '📦', color: '#95a5a6' };
};

// Animated counter component
const AnimatedCounter = ({ value, prefix = '', suffix = '', duration = 2 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const target = parseFloat(value) || 0;
    const increment = target / (duration * 60); // 60 fps
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <Typography variant="h3" fontWeight="bold">
      {prefix}{typeof value === 'number' ? count.toFixed(value % 1 === 0 ? 0 : 2) : count.toFixed(0)}{suffix}
    </Typography>
  );
};

function Dashboard() {
    const navigate = useNavigate();
    const theme = useTheme();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is authenticated before fetching
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        if (!token) {
            navigate('/login', { replace: true });
            return;
        }
        
        fetchStats();
    }, [navigate]);

    const fetchStats = async () => {
        // Double-check token before API call
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        if (!token) {
            return;
        }
        
        try {
            const response = await getDashboardStats();
            console.log('Dashboard stats:', response.data);
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            // Don't show error toast if it's an auth error (user logged out)
            if (error.response?.status !== 401) {
                toast.error('Failed to load dashboard stats');
            }
        } finally {
            setLoading(false);
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
            },
        },
    };

    // Stat cards data
    const statCards = [
        {
            title: 'Monthly Total',
            value: stats?.totalMonthly || 0,
            prefix: '₹',
            icon: AccountBalanceWallet,
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#667eea',
        },
        {
            title: 'Yearly Projection',
            value: stats?.totalYearly || 0,
            prefix: '₹',
            icon: TrendingUp,
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: '#f093fb',
        },
        {
            title: 'Total Subscriptions',
            value: stats?.totalSubscriptions || 0,
            prefix: '',
            icon: Subscriptions,
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: '#4facfe',
        },
    ];

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Grid container spacing={3}>
                    {[1, 2, 3].map((i) => (
                        <Grid item xs={12} md={4} key={i}>
                            <Card>
                                <CardContent>
                                    <Skeleton variant="text" width="60%" height={30} />
                                    <Skeleton variant="text" width="80%" height={60} />
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Skeleton variant="rectangular" height={300} />
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Skeleton variant="rectangular" height={300} />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        );
    }

    if (!stats) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Box
                    sx={{
                        textAlign: 'center',
                        py: 8,
                    }}
                >
                    <Typography variant="h5" color="error" gutterBottom>
                        Failed to load dashboard data
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={fetchStats}
                        sx={{ mt: 2 }}
                    >
                        Retry
                    </Button>
                </Box>
            </Container>
        );
    }

    const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#34495e', '#e67e22', '#16a085', '#c0392b', '#95a5a6'];

    // Convert category breakdown to chart data
    const categoryData = Object.keys(stats.categoryBreakdown || {}).map((categoryId) => {
        const category = getCategoryById(categoryId);
        return {
            name: category.name,
            value: parseFloat(stats.categoryBreakdown[categoryId].toFixed(2)),
            color: category.color
        };
    });

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'transparent',
                py: 4,
            }}
        >
            <Container maxWidth="xl">
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
                                Dashboard
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Overview of your subscription expenses
                            </Typography>
                        </Box>
                    </motion.div>

                    {/* Stats Cards */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        {statCards.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <Grid item xs={12} md={4} key={index}>
                                    <motion.div variants={itemVariants}>
                                        <Card
                                            sx={{
                                                background: stat.gradient,
                                                color: 'white',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                '&:hover': {
                                                    transform: 'translateY(-8px)',
                                                    boxShadow: `0 12px 24px ${alpha(stat.color, 0.4)}`,
                                                },
                                                transition: 'all 0.3s ease',
                                            }}
                                        >
                                            <CardContent>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'flex-start',
                                                    }}
                                                >
                                                    <Box>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                opacity: 0.9,
                                                                mb: 2,
                                                                fontWeight: 500,
                                                            }}
                                                        >
                                                            {stat.title}
                                                        </Typography>
                                                        <AnimatedCounter
                                                            value={stat.value}
                                                            prefix={stat.prefix}
                                                            duration={1.5}
                                                        />
                                                    </Box>
                                                    <Avatar
                                                        sx={{
                                                            bgcolor: alpha('#fff', 0.2),
                                                            width: 56,
                                                            height: 56,
                                                        }}
                                                    >
                                                        <Icon sx={{ fontSize: 32 }} />
                                                    </Avatar>
                                                </Box>
                                            </CardContent>
                                            {/* Decorative circles */}
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: -30,
                                                    right: -30,
                                                    width: 120,
                                                    height: 120,
                                                    borderRadius: '50%',
                                                    background: alpha('#fff', 0.1),
                                                }}
                                            />
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: -20,
                                                    right: 60,
                                                    width: 80,
                                                    height: 80,
                                                    borderRadius: '50%',
                                                    background: alpha('#fff', 0.08),
                                                }}
                                            />
                                        </Card>
                                    </motion.div>
                                </Grid>
                            );
                        })}
                    </Grid>

                    {/* Charts */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        {/* Category Breakdown */}
                        <Grid item xs={12} md={6}>
                            <motion.div variants={itemVariants}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        backdropFilter: 'blur(20px)',
                                        backgroundColor: alpha(theme.palette.background.paper, 0.8),
                                        '&:hover': {
                                            boxShadow: theme.shadows[8],
                                        },
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    <CardContent>
                                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                                            <ShowChart color="primary" />
                                            <Typography variant="h6" fontWeight="bold">
                                                Category Breakdown
                                            </Typography>
                                        </Stack>
                                        {categoryData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={300}>
                                                <PieChart>
                                                    <Pie
                                                        data={categoryData}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={(entry) => `${entry.name}: ₹${entry.value}`}
                                                        outerRadius={100}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                    >
                                                        {categoryData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <Box
                                                sx={{
                                                    height: 300,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Typography color="text.secondary">
                                                    No category data available
                                                </Typography>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Grid>

                        {/* Top Subscriptions */}
                        <Grid item xs={12} md={6}>
                            <motion.div variants={itemVariants}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        backdropFilter: 'blur(20px)',
                                        backgroundColor: alpha(theme.palette.background.paper, 0.8),
                                        '&:hover': {
                                            boxShadow: theme.shadows[8],
                                        },
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    <CardContent>
                                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                                            <TrendingUp color="primary" />
                                            <Typography variant="h6" fontWeight="bold">
                                                Top 5 Subscriptions
                                            </Typography>
                                        </Stack>
                                        {stats.topSubscriptions && stats.topSubscriptions.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={stats.topSubscriptions}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.2)} />
                                                    <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                                                    <YAxis stroke={theme.palette.text.secondary} />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: theme.palette.background.paper,
                                                            border: `1px solid ${theme.palette.divider}`,
                                                            borderRadius: 8,
                                                        }}
                                                    />
                                                    <Bar dataKey="monthlyCost" fill="#3498db" radius={[8, 8, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <Box
                                                sx={{
                                                    height: 300,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Typography color="text.secondary">
                                                    No subscriptions yet
                                                </Typography>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Grid>
                    </Grid>

                    {/* Upcoming Payments */}
                    <motion.div variants={itemVariants}>
                        <Card
                            sx={{
                                backdropFilter: 'blur(20px)',
                                backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            }}
                        >
                            <CardContent>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                                    <CalendarToday color="primary" />
                                    <Typography variant="h6" fontWeight="bold">
                                        Upcoming Payments
                                    </Typography>
                                </Stack>
                                {stats.upcomingPayments && stats.upcomingPayments.length > 0 ? (
                                    <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: 'transparent' }}>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell><strong>Subscription</strong></TableCell>
                                                    <TableCell><strong>Amount</strong></TableCell>
                                                    <TableCell><strong>Frequency</strong></TableCell>
                                                    <TableCell><strong>Next Payment</strong></TableCell>
                                                    <TableCell><strong>Category</strong></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                <AnimatePresence>
                                                    {stats.upcomingPayments.map((sub, index) => {
                                                        const category = getCategoryById(sub.category);
                                                        return (
                                                            <motion.tr
                                                                key={sub._id}
                                                                component={TableRow}
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: index * 0.05 }}
                                                                sx={{
                                                                    '&:hover': {
                                                                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                                                    },
                                                                }}
                                                            >
                                                                <TableCell>
                                                                    <Typography fontWeight={500}>{sub.name}</Typography>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Typography fontWeight="bold" color="primary">
                                                                        ₹{sub.price || sub.cost}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Chip
                                                                        label={sub.billingCycle || sub.frequency}
                                                                        size="small"
                                                                        color="info"
                                                                        sx={{ textTransform: 'capitalize' }}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    {new Date(sub.nextBillingDate || sub.nextPaymentDate).toLocaleDateString()}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Chip
                                                                        label={`${category.icon} ${category.name}`}
                                                                        size="small"
                                                                        sx={{
                                                                            backgroundColor: category.color,
                                                                            color: 'white',
                                                                            fontWeight: 500,
                                                                        }}
                                                                    />
                                                                </TableCell>
                                                            </motion.tr>
                                                        );
                                                    })}
                                                </AnimatePresence>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Box
                                        sx={{
                                            textAlign: 'center',
                                            py: 4,
                                        }}
                                    >
                                        <Typography color="text.secondary">
                                            No upcoming payments
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Add Subscription Button */}
                    <motion.div variants={itemVariants}>
                        <Box sx={{ textAlign: 'center', mt: 4 }}>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<Add />}
                                onClick={() => navigate('/subscriptions/add')}
                                sx={{
                                    py: 1.5,
                                    px: 4,
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
                                Add New Subscription
                            </Button>
                        </Box>
                    </motion.div>
                </motion.div>
            </Container>
        </Box>
    );
}

export default Dashboard;