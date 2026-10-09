import { useEffect, useState } from 'react'
import { supabase, missingEnv } from './lib/supabase'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (missingEnv) return
    supabase.from('users').select('*').order('id').then(({ data, error }) => {
      setError(error?.message ?? null)
      setUsers(data ?? [])
      setLoading(false)
    })
  }, [])

  const q = query.trim().toLowerCase()
  const filtered = users.filter(
    u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  )

  if (missingEnv)
    return <p className="error">Supabase 환경 변수(SUPABASE_URL, SUPABASE_ANON_KEY)가 설정되지 않았습니다.</p>
  if (loading) return <p className="muted">불러오는 중…</p>
  if (error) return <p className="error">오류: {error}</p>

  return (
    <>
      <div className="toolbar">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="이름 또는 이메일 검색"
        />
        <span className="muted">총 {filtered.length}명</span>
      </div>
      <table>
        <thead>
          <tr><th>ID</th><th>이름</th><th>이메일</th><th>가입일</th></tr>
        </thead>
        <tbody>
          {filtered.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{new Date(u.created_at).toLocaleDateString('ko-KR')}</td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan="4" className="muted">결과가 없습니다.</td></tr>
          )}
        </tbody>
      </table>
    </>
  )
}
