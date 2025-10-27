// MongoDB ObjectIds for categories (24 character hex strings)
export const DEFAULT_CATEGORIES = [
    {
        _id: '654321000000000000000001',
        name: "Entertainment",
        icon: "🎬",
        color: "#e74c3c"
    },
    {
        _id: '654321000000000000000002',
        name: "Music",
        icon: "🎵",
        color: "#3498db"
    },
    {
        _id: '654321000000000000000003',
        name: "Gaming",
        icon: "🎮",
        color: "#2ecc71"
    },
    {
        _id: '654321000000000000000004',
        name: "Productivity",
        icon: "💼",
        color: "#f1c40f"
    },
    {
        _id: '654321000000000000000005',
        name: "Cloud Storage",
        icon: "☁️",
        color: "#9b59b6"
    },
    {
        _id: '654321000000000000000006',
        name: "Software",
        icon: "💻",
        color: "#34495e"
    },
    {
        _id: '654321000000000000000007',
        name: "Others",
        icon: "📦",
        color: "#95a5a6"
    }
];

// Frequency options that match backend enum values
export const FREQUENCY_OPTIONS = [
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'QUARTERLY', label: 'Quarterly' },
    { value: 'YEARLY', label: 'Yearly' },
    { value: 'CUSTOM', label: 'Custom' }
];