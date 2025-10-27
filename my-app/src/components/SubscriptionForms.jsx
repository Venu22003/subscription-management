import React, { useState } from 'react'

function SubscriptionForm({ addSubs }) {
  const [name, setName] = useState('')
  const [cost, setCost] = useState('');
  const [category, setCategory] = useState('');


  const handleSubmit = (e) => {
    e.preventDefault();

    const newSub = { name, cost, category };
    console.log({ name, cost, category });
    addSubs(newSub)
    setName('');
    setCost('');
    setCategory('');


  }
  return (
    <div className='container' >
      <form onSubmit={handleSubmit} action="">
        <div>
          <input
            type="text"
            placeholder='Name (e.g, Netflix)'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

        </div>
        <div>
          <input
            type="number"
            placeholder="Cost (e.g., 499)"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
          />
        </div>
        <div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Music">Music</option>
            <option value="Sports">Sports</option>
            <option value="Education">Education</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <button type='submit' >Add</button>
      </form>
    </div>
  )
}

export default SubscriptionForm

