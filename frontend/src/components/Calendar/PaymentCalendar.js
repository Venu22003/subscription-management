import React, { useState, useEffect } from 'react';
import { getAllSubscriptions, getPaymentHistory } from '../../services/subscriptionApi';
import { toast } from 'react-toastify';
import './PaymentCalendar.css';

function PaymentCalendar() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [subsResponse, historyResponse] = await Promise.all([
                getAllSubscriptions(),
                getPaymentHistory(),
            ]);
            setSubscriptions(subsResponse.data);
            setPaymentHistory(historyResponse.data);
        } catch (error) {
            toast.error('Failed to load calendar data');
        } finally {
            setLoading(false);
        }
    };

    const getUpcomingPayments = () => {
        const upcoming = subscriptions
            .filter((sub) => {
                const nextDate = sub.nextBillingDate || sub.nextPaymentDate;
                if (!nextDate) return false;
                
                try {
                    const paymentDate = new Date(nextDate);
                    if (isNaN(paymentDate.getTime())) return false;
                    return paymentDate.getMonth() === selectedMonth && paymentDate.getFullYear() === selectedYear;
                } catch (error) {
                    return false;
                }
            })
            .sort((a, b) => {
                const dateA = new Date(a.nextBillingDate || a.nextPaymentDate);
                const dateB = new Date(b.nextBillingDate || b.nextPaymentDate);
                return dateA - dateB;
            });
        return upcoming;
    };

    const getPastPayments = () => {
        // Group payments by subscription to avoid duplicates
        const paymentsBySubscription = {};
        
        paymentHistory.forEach((payment) => {
            const paymentDate = new Date(payment.paidDate);
            if (paymentDate.getMonth() === selectedMonth && paymentDate.getFullYear() === selectedYear) {
                const subId = payment.subscription?._id || payment.subscription;
                const dateKey = paymentDate.toISOString().split('T')[0];
                const key = `${subId}-${dateKey}`;
                
                // Keep only the latest payment for each subscription-date combination
                if (!paymentsBySubscription[key] || 
                    new Date(payment.paidDate) > new Date(paymentsBySubscription[key].paidDate)) {
                    paymentsBySubscription[key] = payment;
                }
            }
        });
        
        // Convert to array and sort by date (newest first)
        return Object.values(paymentsBySubscription)
            .sort((a, b) => new Date(b.paidDate) - new Date(a.paidDate));
    };

    const getDaysInMonth = () => {
        return new Date(selectedYear, selectedMonth + 1, 0).getDate();
    };

    const getFirstDayOfMonth = () => {
        return new Date(selectedYear, selectedMonth, 1).getDay();
    };

    // In PaymentCalendar.js, update the renderCalendar function:

const renderCalendar = () => {
  const daysInMonth = getDaysInMonth();
  const firstDay = getFirstDayOfMonth();
  const days = [];
  const today = new Date();
  const isCurrentMonth = selectedMonth === today.getMonth() && selectedYear === today.getFullYear();
  const currentDay = today.getDate();

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const paymentsOnDay = subscriptions.filter((sub) => {
      const nextDate = sub.nextBillingDate || sub.nextPaymentDate;
      if (!nextDate) return false;
      
      try {
        const paymentDate = new Date(nextDate);
        if (isNaN(paymentDate.getTime())) return false;
        return paymentDate.toISOString().split('T')[0] === dateStr;
      } catch (error) {
        return false;
      }
    });

    const isToday = isCurrentMonth && day === currentDay;

    days.push(
      <div 
        key={day} 
        className={`calendar-day ${paymentsOnDay.length > 0 ? 'has-payment' : ''} ${isToday ? 'today' : ''}`}
      >
        <div className="day-number">{day}</div>
        {paymentsOnDay.length > 0 && (
          <div className="payment-indicator">
            <div className="payment-count">{paymentsOnDay.length}</div>
            {paymentsOnDay.map((sub) => (
              <div key={sub._id} className="payment-item-mini" title={`${sub.name} - ₹${sub.price || sub.cost}`}>
                {sub.name.substring(0, 3)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return days;
};

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const handlePrevMonth = () => {
        if (selectedMonth === 0) {
            setSelectedMonth(11);
            setSelectedYear(selectedYear - 1);
        } else {
            setSelectedMonth(selectedMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (selectedMonth === 11) {
            setSelectedMonth(0);
            setSelectedYear(selectedYear + 1);
        } else {
            setSelectedMonth(selectedMonth + 1);
        }
    };

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    const upcomingPayments = getUpcomingPayments();
    const pastPayments = getPastPayments();

    return (
        <div className="payment-calendar-container">
            <div className="container">
                <h1 className="page-title">Payment Calendar</h1>
                <p className="page-subtitle">Track your upcoming and past payments</p>

                <div className="card card-custom mb-4">
                    <div className="card-body">
                        <div className="calendar-header">
                            <button className="btn btn-outline-primary" onClick={handlePrevMonth}>
                                ◀ Previous
                            </button>
                            <h3 className="calendar-month">
                                {monthNames[selectedMonth]} {selectedYear}
                            </h3>
                            <button className="btn btn-outline-primary" onClick={handleNextMonth}>
                                Next ▶
                            </button>
                        </div>

                        <div className="calendar-grid">
                            <div className="calendar-day-header">Sun</div>
                            <div className="calendar-day-header">Mon</div>
                            <div className="calendar-day-header">Tue</div>
                            <div className="calendar-day-header">Wed</div>
                            <div className="calendar-day-header">Thu</div>
                            <div className="calendar-day-header">Fri</div>
                            <div className="calendar-day-header">Sat</div>
                            {renderCalendar()}
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    <div className="col-md-6">
                        <div className="card card-custom">
                            <div className="card-body">
                                <h5 className="card-title mb-3">⏰ Upcoming Payments</h5>
                                {upcomingPayments.length > 0 ? (
                                    <div className="payment-list">
                                        {upcomingPayments.map((sub) => {
                                            const nextDate = sub.nextBillingDate || sub.nextPaymentDate;
                                            return (
                                                <div key={sub._id} className="payment-item upcoming">
                                                    <div className="payment-info">
                                                        <strong>{sub.name}</strong>
                                                        <span className="text-muted">
                                                            {nextDate ? new Date(nextDate).toLocaleDateString() : 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="payment-amount">₹{sub.price || sub.cost}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted">No upcoming payments this month</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="card card-custom">
                            <div className="card-body">
                                <h5 className="card-title mb-3">✅ Past Payments</h5>
                                {pastPayments.length > 0 ? (
                                    <div className="payment-list">
                                        {pastPayments.map((payment, index) => {
                                            const subName = payment.subscription?.name || 'Unknown Subscription';
                                            return (
                                                <div key={payment._id || index} className="payment-item past">
                                                    <div className="payment-info">
                                                        <strong>{subName}</strong>
                                                        <span className="text-muted">
                                                            {new Date(payment.paidDate).toLocaleDateString()}
                                                        </span>
                                                        {payment.paymentMethod && (
                                                            <span className="badge bg-secondary ms-2">{payment.paymentMethod}</span>
                                                        )}
                                                    </div>
                                                    <div className="payment-amount">₹{payment.amount}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted">No past payments this month</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PaymentCalendar;