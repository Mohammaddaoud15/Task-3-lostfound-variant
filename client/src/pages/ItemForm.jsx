import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { title: '', description: '', category: 'other', status: 'lost', location: '' }
const categories = ['electronics', 'clothing', 'documents', 'accessories', 'other']
const statuses = ['lost', 'found', 'claimed']

export default function ItemForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
    if (!id) {
      setForm(defaults)
      return
    }

    async function loadItem() {
      try {
        const res = await api.get(`/items/${id}`)
        const item = res.data.item
        setForm({
          title: item.title,
          description: item.description || '',
          category: item.category,
          status: item.status,
          location: item.location || ''
        })
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load item')
      }
    }

    loadItem()
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    const payload = {
      title: form.title,
      status: form.status,
      category: form.category,
      location: form.location,
      description: form.description
    }

    try {
      if (id) {
        await api.patch(`/items/${id}`, payload)
      } else {
        await api.post('/items', payload)
      }
      nav('/items')
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to save item')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'Report'} Item</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <span className="text-sm font-medium">Title</span>
          <input
            className="input mt-1"
            name="title"
            value={form.title}
            onChange={onChange}
            placeholder="Black backpack"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Status</span>
          <select className="input mt-1" name="status" value={form.status} onChange={onChange}>
            {statuses.map(status => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium">Category</span>
          <select className="input mt-1" name="category" value={form.category} onChange={onChange}>
            {categories.map(category => <option key={category} value={category}>{category}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium">Location</span>
          <input
            className="input mt-1"
            name="location"
            value={form.location}
            onChange={onChange}
            placeholder="Library 2nd floor"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Description</span>
          <textarea
            className="input mt-1"
            name="description"
            value={form.description}
            onChange={onChange}
            rows="4"
          />
        </label>

        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
