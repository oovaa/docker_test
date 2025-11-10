import React, { useEffect, useState } from 'react'

const host = import.meta.env.VITE_HOST ?? 'http://localhost'
const server_port = import.meta.env.VITE_SERVER_PORT ?? '4456'

const api = {
  getAll: () => fetchJson(`${host}:${server_port}/getall`),
  getVal: (key) =>
    fetchJson(`${host}:${server_port}/getVal`, {
      method: `POST`,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    }),
  setVal: (key, val) =>
    fetchJson(`${host}:${server_port}/setVal`, {
      method: `POST`,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, val }),
    }),
  deleteVal: (key) =>
    fetchJson(`${host}:${server_port}/deleteV`, {
      method: `DELETE`,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    }),
}

// small fetch helper that returns parsed JSON on success, and throws a helpful
// Error containing status + server body text on failure. This avoids `r.json()`
// throwing "Unexpected end of JSON input" when the server returns empty or
// non-JSON error responses.
async function fetchJson(input, init) {
  const res = await fetch(input, init)
  const text = await res.text()
  if (!res.ok) {
    // include server body text if present, otherwise status text
    const msg = text?.trim()
      ? `${res.status} ${res.statusText}: ${text}`
      : `${res.status} ${res.statusText}`
    throw new Error(msg)
  }
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch (e) {
    // return raw text under a generic shape if JSON parsing fails
    return { status: 'success', data: text }
  }
}

function KeyItem({ k, onGet, onDelete }) {
  return (
    <li className='key-row'>
      <div className='key-name'>{k}</div>
      <div className='key-actions'>
        <button className='small-action' onClick={() => onGet(k)}>
          Get
        </button>
        <button className='small-action danger' onClick={() => onDelete(k)}>
          Del
        </button>
      </div>
    </li>
  )
}

export default function App() {
  const [keys, setKeys] = useState([])
  const [loading, setLoading] = useState(false)
  const [getResult, setGetResult] = useState('—')
  const [delResult, setDelResult] = useState('—')
  const [setKey, setSetKey] = useState('')
  const [setVal, setSetVal] = useState('')
  const [getKey, setGetKey] = useState('')
  const [delKey, setDelKey] = useState('')

  async function refresh() {
    setLoading(true)
    try {
      const res = await api.getAll()
      const list = res.data || res // tolerate stat/data differences
      setKeys(list || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleSet() {
    if (!setKey) return
    const res = await api.setVal(setKey, setVal)
    setSetKey('')
    setSetVal('')
    refresh()
    alert(JSON.stringify(res))
  }

  async function handleGet(k) {
    const key = k || getKey
    if (!key) return
    const res = await api.getVal(key)
    setGetResult(JSON.stringify(res, null, 2))
  }

  async function handleDelete(k) {
    const key = k || delKey
    if (!key) return
    const res = await api.deleteVal(key)
    setDelResult(JSON.stringify(res, null, 2))
    refresh()
  }

  return (
    <main className='container'>
      <header className='hero'>
        <h1>Redis Key Manager</h1>
        <p className='subtitle'>
          React + Vite frontend connected to your Bun server
        </p>
      </header>

      <section className='grid'>
        <div className='card'>
          <h2>Set a key</h2>
          <label>
            Key
            <input
              value={setKey}
              onChange={(e) => setSetKey(e.target.value)}
              placeholder='my:key'
            />
          </label>
          <label>
            Value
            <input
              value={setVal}
              onChange={(e) => setSetVal(e.target.value)}
              placeholder='some value'
            />
          </label>
          <button onClick={handleSet}>Set Value</button>
        </div>

        <div className='card'>
          <h2>Get a key</h2>
          <label>
            Key
            <input
              value={getKey}
              onChange={(e) => setGetKey(e.target.value)}
              placeholder='my:key'
            />
          </label>
          <button onClick={() => handleGet()}>Get Value</button>
          <pre className='result'>{getResult}</pre>
        </div>

        <div className='card'>
          <h2>Delete a key</h2>
          <label>
            Key
            <input
              value={delKey}
              onChange={(e) => setDelKey(e.target.value)}
              placeholder='my:key'
            />
          </label>
          <button className='danger' onClick={() => handleDelete()}>
            Delete
          </button>
          <pre className='result'>{delResult}</pre>
        </div>

        <div className='card wide'>
          <div className='row'>
            <h2>All keys</h2>
            <div>
              <button onClick={refresh}>Refresh</button>
              <button className='secondary' onClick={() => setKeys([])}>
                Clear
              </button>
            </div>
          </div>
          <ul className='keys-list'>
            {loading && <li className='muted'>Loading…</li>}
            {!loading && keys.length === 0 && (
              <li className='muted'>(no keys)</li>
            )}
            {!loading &&
              keys.map((k) => (
                <KeyItem
                  key={k}
                  k={k}
                  onGet={handleGet}
                  onDelete={handleDelete}
                />
              ))}
          </ul>
        </div>
      </section>

      <footer className='footer'>
        Run backend at <code>localhost:3355</code>. Dev server proxies API calls
        to it.
      </footer>
    </main>
  )
}
