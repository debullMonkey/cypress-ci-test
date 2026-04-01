import { useEffect, useState } from 'react'

export default function App() {
  const [health, setHealth] = useState(null)
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setError('서버 연결 실패'))

    fetch('/api/items')
      .then((r) => r.json())
      .then(setItems)
      .catch(() => setError('상품 로딩 실패'))
  }, [])

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 600, margin: '40px auto', padding: '0 20px' }}>
      <h1>Practice App</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <section>
        <h2>서버 상태</h2>
        {health ? (
          <div data-testid="health-status">
            <p>상태: <strong data-testid="status">{health.status}</strong></p>
            <p>환경: <strong data-testid="env">{health.env}</strong></p>
            <p>시간: {health.timestamp ||''}</p>
          </div>
        ) : (
          <p>로딩 중...</p>
        )}
      </section>

      <section>
        <h2>상품 목록</h2>
        {items.length > 0 ? (
          <ul data-testid="item-list">
            {items.map((item) => (
              <li key={item.id} data-testid={`item-${item.id}`}>
                {item.name} - {item.price.toLocaleString()}원
              </li>
            ))}
          </ul>
        ) : (
          <p>상품 없음</p>
        )}
      </section>
    </div>
  )
}
