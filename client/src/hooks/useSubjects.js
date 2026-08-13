import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { subjectsAPI } from '../services/api'

export function useSubjects() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSubjects = useCallback(async () => {
    if (!user?._id) {
      setSubjects([])
      setLoading(false)
      return
    }
    try {
      const res = await subjectsAPI.get()
      setSubjects(res.data.subjects || [])
    } catch (err) {
      console.error('Failed to fetch subjects:', err)
      setSubjects([])
    } finally {
      setLoading(false)
    }
  }, [user?._id])

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  const save = async (updated) => {
    setSubjects(updated) // optimistic update
    try {
      await subjectsAPI.update(updated)
    } catch (err) {
      console.error('Failed to save subjects:', err)
      fetchSubjects() // revert to server truth if save fails
    }
  }

  const addSubject = (name) => {
    if (!name || subjects.includes(name)) return
    save([...subjects, name])
  }

  const removeSubject = (name) => {
    save(subjects.filter(s => s !== name))
  }

  return { subjects, addSubject, removeSubject, loading }
}