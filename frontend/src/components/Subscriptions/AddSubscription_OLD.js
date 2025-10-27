import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addSubscription } from '../../services/subscriptionApi';
import { toast } from 'react-toastify';
import './AddSubscription.css';

// Hardcoded categories
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

const FREQUENCY_OPTIONS = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'weekly', label: 'Weekly' }
];

const INITIAL_FORM_STATE = {
    name: '',
    cost: '',
    category: '',
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    notes: '',
    receipt: '',
};

function AddSubscription() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [loading, setLoading] = useState(false);

    // NO useEffect here - we're adding a NEW subscription, not editing!

    const handleChange = ({ target: { name, value } }) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = ({ target: { files } }) => {
        const file = files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size should be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, receipt: reader.result }));
            };
            reader.onerror = () => {
                toast.error('Failed to read file');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            toast.error('Please enter subscription name');
            return;
        }
        
        if (!formData.cost || parseFloat(formData.cost) <= 0) {
            toast.error('Please enter a valid cost');
            return;
        }
        
        if (!formData.category) {
            toast.error('Please select a category');
            return;
        }

        const subscriptionData = {
            name: formData.name.trim(),
            cost: parseFloat(formData.cost),
            category: formData.category,
            frequency: formData.frequency.toLowerCase(),
            startDate: formData.startDate,
            notes: formData.notes.trim(),
        };

        if (formData.receipt) {
            subscriptionData.receipt = formData.receipt;
        }

        console.log('Submitting subscription data:', subscriptionData);

        setLoading(true);
        try {
            const response = await addSubscription(subscriptionData);
            console.log('Subscription added successfully:', response.data);
            toast.success('Subscription added successfully!');
            navigate('/subscriptions');
        } catch (error) {
            console.error('Error adding subscription:', error);
            console.error('Error response:', error.response?.data);
            
            const errorMessage = error.response?.data?.message || 
                                error.response?.data?.error ||
                                error.message ||
                                'Failed to add subscription';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-subscription-container">
            <div className="container">
                <h1 className="page-title">Add New Subscription</h1>
                <div className="card card-custom">
                    <div className="card-body">
                        <form onSubmit={handleSubmit} className="subscription-form">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label htmlFor="name" className="form-label">Subscription Name *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="name"
                                        name="name"
                                        placeholder="e.g., Netflix"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label htmlFor="cost" className="form-label">Cost (₹) *</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="cost"
                                        name="cost"
                                        placeholder="Enter amount"
                                        value={formData.cost}
                                        onChange={handleChange}
                                        step="0.01"
                                        min="0.01"
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label htmlFor="category" className="form-label">Category *</label>
                                    <select
                                        className="form-select"
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select a category</option>
                                        {CATEGORIES.map(category => (
                                            <option 
                                                key={category._id} 
                                                value={category._id}
                                            >
                                                {category.icon} {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label htmlFor="frequency" className="form-label">Billing Frequency *</label>
                                    <select
                                        className="form-select"
                                        id="frequency"
                                        name="frequency"
                                        value={formData.frequency}
                                        onChange={handleChange}
                                        required
                                    >
                                        {FREQUENCY_OPTIONS.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label htmlFor="startDate" className="form-label">Start Date *</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        id="startDate"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-12">
                                    <label htmlFor="notes" className="form-label">Notes</label>
                                    <textarea
                                        className="form-control"
                                        id="notes"
                                        name="notes"
                                        rows="3"
                                        placeholder="Add any additional notes..."
                                        value={formData.notes}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-12">
                                    <label htmlFor="receipt" className="form-label">Upload Receipt (Optional)</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        id="receipt"
                                        name="receipt"
                                        accept="image/*,.pdf"
                                        onChange={handleFileChange}
                                    />
                                    {formData.receipt && (
                                        <small className="text-success d-block mt-1">
                                            ✓ File uploaded successfully
                                        </small>
                                    )}
                                </div>

                                <div className="col-12 mt-4">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Adding...
                                            </>
                                        ) : (
                                            'Add Subscription'
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary ms-2"
                                        onClick={() => navigate('/subscriptions')}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddSubscription;