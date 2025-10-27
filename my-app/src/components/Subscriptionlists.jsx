import React, { useEffect, useState } from 'react'
import SubscriptionForm from './SubscriptionForms'
import SubscriptionItem from './SubscriptionItems'

function SubscriptionList() {
  const [subscription, setSubscription] = useState([])
  const [monthlyTotal, setMonthlyTotal] = useState(0)

  console.log({ Before: subscription })
  const addSubs = (sub) => {
    const newSubs = {
      id: Date.now().toString(),
      name: sub.name,
      cost: parseFloat(sub.cost),
      category: sub.category
    }
    setSubscription((prev) => [...prev, newSubs])
  }
  useEffect(() => {
    const total = subscription.reduce((sum, sub) => sum + sub.cost, 0)
    setMonthlyTotal(total)
  }, [subscription])


  const editSubs = (id, newName) => {
    setSubscription((prev) =>
      prev.map((sub) =>
        sub.id === id ? { ...sub, name: newName } : sub
      )
    )

  }
  const deleteSubs = (id) => {
    setSubscription(prev => prev.filter((sub) => sub.id !== id))
  }

  return (
    <>
      <h2>Subscription Manager</h2>
      <SubscriptionForm addSubs={addSubs} />
      <div style={{ marginTop: '20px' }}>
        <strong>Monthly Total:</strong> ₹{monthlyTotal.toFixed(2)}<br />
        <strong>Yearly Total:</strong> ₹{(monthlyTotal * 12).toFixed(2)}
      </div>
      {
        subscription.length > 0 ? (
          <table border={8} cellPadding={8} style={{ borderCollapse: 'true', marginTop: '20px', width: '100%' }} >
            <thead>
              <tr>
                <th>Name</th>
                <th>Cost</th>
                <th>Category</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {
                subscription.map((sub) => {
                  return <SubscriptionItem
                    key={sub.id}
                    sub={sub}
                    editSubs={editSubs}
                    deleteSubs={deleteSubs}
                  />
                })
              }
            </tbody>
          </table>
        ) : (
          <p style={{ marginTop: '20px', color: 'gray', textAlign: 'center' }}>
No data found</p>

        )
      }
    </>
  )
}

export default SubscriptionList
