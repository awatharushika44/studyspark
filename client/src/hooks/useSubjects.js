import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export function useSubjects() {
  const { user } = useAuth()

  const getKey = () => `subjects_${user?._id || 'guest'}`

  const [subjects, setSubjects] = useState(() => {
    if (!user?._id) return []
    const saved = localStorage.getItem(`subjects_${user._id}`)
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    if (user?._id) {
      const saved = localStorage.getItem(`subjects_${user._id}`)
      setSubjects(saved ? JSON.parse(saved) : [])
    }
  }, [user?._id])

  const save = (updated) => {
    setSubjects(updated)
    localStorage.setItem(getKey(), JSON.stringify(updated))
  }

  const addSubject = (name) => {
    if (subjects.includes(name)) return
    save([...subjects, name])
  }

  const removeSubject = (name) => {
    save(subjects.filter(s => s !== name))
  }

  return { subjects, addSubject, removeSubject }
}