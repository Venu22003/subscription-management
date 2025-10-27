import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Switch,
  FormControlLabel,
  MenuItem,
  Grid,
  Avatar,
  Divider,
  IconButton,
  Chip,
  CircularProgress,
  alpha,
  useTheme,
  Skeleton,
} from '@mui/material';
import {
  Person,
  Email,
  Palette,
  Notifications,
  CalendarToday,
  FileDownload,
  Save,
  Description,
  PictureAsPdf,
  DarkMode,
  LightMode,
} from '@mui/icons-material';
import { getProfile, updateProfile } from '../../services/authApi';
import { getAllSubscriptions } from '../../services/subscriptionApi';
import { toast } from 'react-toastify';
import './Settings.css';

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

const getCategoryNameById = (categoryId) => {
  const category = CATEGORIES.find(cat => cat._id === categoryId);
  return category ? category.name : 'Unknown';
};

function Settings() {
  const theme = useTheme();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    preferences: {
      theme: 'light',
      emailNotifications: true,
      reminderDays: 3,
    },
  });
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  const applyTheme = useCallback(() => {
    const themeValue = profile.preferences?.theme || 'light';
    document.body.setAttribute('data-theme', themeValue);
    localStorage.setItem('theme', themeValue);
  }, [profile.preferences]);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile.preferences?.theme) {
      applyTheme();
    }
  }, [applyTheme, profile.preferences]);

  const fetchProfile = async () => {
    try {
      const response = await getProfile();
      const userData = response.data;
      
      // Get stored user data and theme as fallback
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      // IMPORTANT: localStorage theme takes priority (user's last saved preference)
      const savedTheme = localStorage.getItem('theme');
      
      setProfile({
        name: userData.name || storedUser.name || '',
        email: userData.email || storedUser.email || '',
        preferences: {
          // Use localStorage theme if it exists, otherwise use API response, otherwise default to 'light'
          theme: savedTheme || userData.preferences?.theme || 'light',
          emailNotifications: userData.preferences?.emailNotifications !== undefined 
            ? userData.preferences.emailNotifications 
            : true,
          reminderDays: userData.preferences?.reminderDays || 3,
        },
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Try to use stored user data if API fails
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const savedTheme = localStorage.getItem('theme');
      
      if (storedUser.name || storedUser.email) {
        setProfile({
          name: storedUser.name || '',
          email: storedUser.email || '',
          preferences: {
            theme: savedTheme || 'light',
            emailNotifications: true,
            reminderDays: 3,
          },
        });
      } else {
        toast.error('Failed to load profile');
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('preferences.')) {
      const prefKey = name.split('.')[1];
      setProfile({
        ...profile,
        preferences: {
          ...profile.preferences,
          [prefKey]: type === 'checkbox' ? checked : value,
        },
      });
    } else {
      setProfile({
        ...profile,
        [name]: value,
      });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        preferences: profile.preferences,
      };
      
      // Only include name if it's not empty
      if (profile.name && profile.name.trim() !== '') {
        updateData.name = profile.name.trim();
      }
      
      await updateProfile(updateData);
      applyTheme();
      toast.success('Settings saved successfully! ✨');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await getAllSubscriptions();
      const subscriptions = response.data;

      if (!subscriptions || subscriptions.length === 0) {
        toast.warning('No subscriptions to export');
        return;
      }

      const csvContent = [
        ['Name', 'Cost', 'Category', 'Frequency', 'Next Payment', 'Status', 'Notes'].join(','),
        ...subscriptions.map((sub) =>
          [
            `"${sub.name || 'Untitled'}"`,
            sub.price || sub.cost || 0,
            `"${getCategoryNameById(sub.category)}"`,
            sub.billingCycle || sub.frequency || 'monthly',
            new Date(sub.nextBillingDate || sub.nextPaymentDate).toLocaleDateString(),
            sub.status || 'active',
            `"${sub.notes || sub.description || ''}"`,
          ].join(',')
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscriptions_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('CSV exported successfully! 📄');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await getAllSubscriptions();
      const subscriptions = response.data;

      if (!subscriptions || subscriptions.length === 0) {
        toast.warning('No subscriptions to export');
        return;
      }

      // Calculate total monthly expense
      const totalMonthly = subscriptions.reduce((sum, sub) => {
        const price = sub.price || sub.cost || 0;
        const cycle = (sub.billingCycle || sub.frequency || 'monthly').toLowerCase();
        
        if (cycle === 'monthly') return sum + price;
        if (cycle === 'yearly') return sum + (price / 12);
        if (cycle === 'weekly') return sum + (price * 52 / 12);
        if (cycle === 'quarterly') return sum + (price * 4 / 12);
        if (cycle === 'daily') return sum + (price * 365 / 12);
        return sum;
      }, 0);

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Subscriptions Report</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 40px; 
              color: #2c3e50;
              background: #fff;
            }
            h1 { 
              color: #2c3e50; 
              text-align: center; 
              margin-bottom: 10px;
              font-size: 32px;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              padding-bottom: 20px;
              border-bottom: 3px solid #3498db;
            }
            .date { 
              font-size: 14px; 
              color: #7f8c8d; 
              margin-top: 5px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px; 
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 14px 12px; 
              text-align: left; 
            }
            th { 
              background-color: #3498db; 
              color: white; 
              font-weight: 600;
              text-transform: uppercase;
              font-size: 13px;
              letter-spacing: 0.5px;
            }
            tr:nth-child(even) { 
              background-color: #f8f9fa; 
            }
            tr:hover { 
              background-color: #e8f4f8; 
            }
            .price { 
              font-weight: 600; 
              color: #2c3e50;
            }
            .frequency {
              text-transform: capitalize;
              color: #7f8c8d;
            }
            .summary { 
              margin-top: 30px; 
              padding: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 8px;
              color: white;
            }
            .summary h2 {
              margin-bottom: 15px;
              font-size: 22px;
            }
            .summary-item { 
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 16px;
              border-bottom: 1px solid rgba(255,255,255,0.2);
            }
            .summary-item:last-child {
              border-bottom: none;
              font-size: 20px;
              font-weight: bold;
              margin-top: 10px;
            }
            @media print {
              body { margin: 20px; }
              tr:hover { background-color: transparent; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 Subscription Report</h1>
            <p class="date"><strong>Generated on:</strong> ${new Date().toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Cost (₹)</th>
                <th>Category</th>
                <th>Frequency</th>
                <th>Next Payment</th>
              </tr>
            </thead>
            <tbody>
              ${subscriptions.map(sub => {
                const price = sub.price || sub.cost || 0;
                const cycle = (sub.billingCycle || sub.frequency || 'monthly');
                const nextDate = sub.nextBillingDate || sub.nextPaymentDate;
                
                return `
                <tr>
                  <td>${sub.name || 'Untitled'}</td>
                  <td class="price">₹${price.toFixed(2)}</td>
                  <td>${getCategoryNameById(sub.category)}</td>
                  <td class="frequency">${cycle}</td>
                  <td>${new Date(nextDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}</td>
                </tr>
              `}).join('')}
            </tbody>
          </table>
          <div class="summary">
            <h2>Summary</h2>
            <div class="summary-item">
              <span>Total Subscriptions:</span>
              <span>${subscriptions.length}</span>
            </div>
            <div class="summary-item">
              <span>Estimated Monthly Expense:</span>
              <span>₹${totalMonthly.toFixed(2)}</span>
            </div>
            <div class="summary-item">
              <span>Estimated Yearly Expense:</span>
              <span>₹${(totalMonthly * 12).toFixed(2)}</span>
            </div>
          </div>
        </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow popups to export PDF');
        return;
      }
      
      printWindow.document.write(html);
      printWindow.document.close();
      
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };

      toast.success('PDF export opened! Use Print dialog to save as PDF. 📕');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  if (profileLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={200} height={50} />
          <Skeleton variant="text" width={300} height={30} />
        </Box>
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} md={6} key={i}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 4 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'transparent',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography
              variant="h3"
              fontWeight="bold"
              gutterBottom
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              ⚙️ Settings
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Manage your account and preferences
            </Typography>
          </Box>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={3}>
            {/* Profile Card */}
            <Grid item xs={12} md={6}>
              <motion.div variants={cardVariants}>
                <Card
                  sx={{
                    backdropFilter: 'blur(20px)',
                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                    borderRadius: 4,
                    boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.37)}`,
                    border: `1px solid ${alpha(theme.palette.common.white, 0.18)}`,
                    height: '100%',
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          mr: 2,
                        }}
                      >
                        <Person sx={{ fontSize: 35 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h5" fontWeight="bold">
                          Profile Information
                        </Typography>
                        <Chip
                          label="Active"
                          size="small"
                          color="success"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    <Box component="form" onSubmit={handleSave}>
                      <TextField
                        fullWidth
                        label="Name"
                        name="name"
                        value={profile.name || ''}
                        onChange={handleChange}
                        required
                        sx={{ mb: 3 }}
                        InputProps={{
                          startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                      />

                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        value={profile.email || ''}
                        disabled
                        sx={{ mb: 1 }}
                        InputProps={{
                          startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
                        Email cannot be changed
                      </Typography>

                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                        sx={{
                          py: 1.5,
                          fontSize: '1rem',
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
                        {loading ? 'Saving...' : 'Save Profile'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Preferences Card */}
            <Grid item xs={12} md={6}>
              <motion.div variants={cardVariants}>
                <Card
                  sx={{
                    backdropFilter: 'blur(20px)',
                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                    borderRadius: 4,
                    boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.37)}`,
                    border: `1px solid ${alpha(theme.palette.common.white, 0.18)}`,
                    height: '100%',
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                          mr: 2,
                        }}
                      >
                        <Palette sx={{ fontSize: 35 }} />
                      </Avatar>
                      <Typography variant="h5" fontWeight="bold">
                        Preferences
                      </Typography>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    <Box component="form" onSubmit={handleSave}>
                      <TextField
                        fullWidth
                        select
                        label="Theme"
                        name="preferences.theme"
                        value={profile.preferences?.theme || 'light'}
                        onChange={handleChange}
                        sx={{ mb: 3 }}
                        InputProps={{
                          startAdornment: (
                            <IconButton size="small" sx={{ mr: 0.5 }}>
                              {profile.preferences?.theme === 'dark' ? <DarkMode /> : <LightMode />}
                            </IconButton>
                          ),
                        }}
                      >
                        <MenuItem value="light">🌞 Light Mode</MenuItem>
                        <MenuItem value="dark">🌙 Dark Mode</MenuItem>
                      </TextField>

                      <TextField
                        fullWidth
                        type="number"
                        label="Reminder Days Before Payment"
                        name="preferences.reminderDays"
                        value={profile.preferences?.reminderDays || 3}
                        onChange={handleChange}
                        inputProps={{ min: 1, max: 30 }}
                        sx={{ mb: 3 }}
                        InputProps={{
                          startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                      />

                      <FormControlLabel
                        control={
                          <Switch
                            checked={profile.preferences?.emailNotifications || false}
                            onChange={handleChange}
                            name="preferences.emailNotifications"
                            color="primary"
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Notifications sx={{ mr: 1 }} />
                            Email Notifications
                          </Box>
                        }
                        sx={{ mb: 3 }}
                      />

                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                        sx={{
                          py: 1.5,
                          fontSize: '1rem',
                          fontWeight: 600,
                          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #e084eb 0%, #e5485c 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: `0 6px 20px ${alpha('#f5576c', 0.4)}`,
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {loading ? 'Saving...' : 'Save Preferences'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Data Export Card */}
            <Grid item xs={12}>
              <motion.div variants={cardVariants}>
                <Card
                  sx={{
                    backdropFilter: 'blur(20px)',
                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                    borderRadius: 4,
                    boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.37)}`,
                    border: `1px solid ${alpha(theme.palette.common.white, 0.18)}`,
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                          mr: 2,
                        }}
                      >
                        <FileDownload sx={{ fontSize: 35 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h5" fontWeight="bold">
                          Data Export
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Export your subscription data for backup or analysis
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Button
                          fullWidth
                          variant="contained"
                          size="large"
                          onClick={handleExportCSV}
                          startIcon={<Description />}
                          sx={{
                            py: 1.5,
                            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #0e8c7c 0%, #32d66f 100%)',
                              transform: 'translateY(-2px)',
                              boxShadow: `0 6px 20px ${alpha('#38ef7d', 0.4)}`,
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          Export CSV
                        </Button>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Button
                          fullWidth
                          variant="contained"
                          size="large"
                          onClick={handleExportPDF}
                          startIcon={<PictureAsPdf />}
                          sx={{
                            py: 1.5,
                            background: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #d5086a 0%, #e65e00 100%)',
                              transform: 'translateY(-2px)',
                              boxShadow: `0 6px 20px ${alpha('#ff6a00', 0.4)}`,
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          Export PDF
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
}

export default Settings;