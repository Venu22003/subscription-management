import React, { useState } from 'react'

function SubscriptionItem({ sub, deleteSubs, editSubs }) {
  const [isEditing, setEditing] = useState(false)
  const [editedText, setEditedText] = useState('')
  const handleEdit = () => {
    setEditing(true)
  }
  const handleSave = () => {
    setEditing(false)
    editSubs(sub.id, editedText)
  }
  return (
    <>
      <tr>
        <td>
          {
            isEditing ? (
              <input
                type="text"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                onBlur={handleSave}
                autoFocus
              />
            ) : (
              <span onClick={handleEdit} >{sub.name}</span>
            )
          }
        </td>
        <td>{sub.cost}</td>
        <td>{sub.category}</td>
        <td>
          <button onClick={() => deleteSubs(sub.id)}>Delete</button>
        </td>
      </tr>
    </>
  )
}

export default SubscriptionItem
