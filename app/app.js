const $ = (sel) => document.querySelector(sel)
const api = {
  getAll: () => fetch('/getall').then((r) => r.json()),
  getVal: (key) =>
    fetch('/getVal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    }).then((r) => r.json()),
  setVal: (key, val) =>
    fetch('/setVal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, val }),
    }).then((r) => r.json()),
  deleteVal: (key) =>
    fetch('/deleteV', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    }).then((r) => r.json()),
}

function showToast(msg, el = null) {
  if (el) el.textContent = msg
  else console.info(msg)
}

async function refreshKeys() {
  const list = $('#keys-list')
  list.innerHTML = 'Loading...'
  try {
    const res = await api.getAll()
    if (res.status === 'success' || res.stat === 'success') {
      const keys = res.data || []
      if (keys.length === 0) list.innerHTML = '<li class="muted">(no keys)</li>'
      else
        list.innerHTML = keys
          .map(
            (k) =>
              `<li><div>${escapeHtml(
                k
              )}</div><div><button data-key="${encodeURIComponent(
                k
              )}" class="small-action">Get</button><button data-del="${encodeURIComponent(
                k
              )}" class="small-action danger">Del</button></div></li>`
          )
          .join('')
      ;[...list.querySelectorAll('.small-action')].forEach((btn) => {
        if (btn.dataset.key)
          btn.addEventListener('click', async (e) => {
            const key = decodeURIComponent(btn.dataset.key)
            const out = await api.getVal(key)
            $('#get-result').textContent = JSON.stringify(out, null, 2)
          })
        if (btn.dataset.del)
          btn.addEventListener('click', async (e) => {
            const key = decodeURIComponent(btn.dataset.del)
            const out = await api.deleteVal(key)
            $('#del-result').textContent = JSON.stringify(out, null, 2)
            setTimeout(refreshKeys, 250)
          })
      })
    } else {
      list.innerHTML = '<li class="muted">Error fetching keys</li>'
    }
  } catch (err) {
    list.innerHTML = '<li class="muted">Network error</li>'
    console.error(err)
  }
}

function escapeHtml(s) {
  return String(s).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])
  )
}

window.addEventListener('load', () => {
  $('#set-btn').addEventListener('click', async () => {
    const key = $('#set-key').value.trim()
    const val = $('#set-val').value
    if (!key) return showToast('Key required', $('#set-val'))
    const res = await api.setVal(key, val)
    showToast(JSON.stringify(res), $('#set-val'))
    setTimeout(() => {
      $('#set-key').value = ''
      $('#set-val').value = ''
      refreshKeys()
    }, 400)
  })

  $('#get-btn').addEventListener('click', async () => {
    const key = $('#get-key').value.trim()
    if (!key) return showToast('Key required', $('#get-result'))
    const res = await api.getVal(key)
    $('#get-result').textContent = JSON.stringify(res, null, 2)
  })

  $('#del-btn').addEventListener('click', async () => {
    const key = $('#del-key').value.trim()
    if (!key) return showToast('Key required', $('#del-result'))
    const res = await api.deleteVal(key)
    $('#del-result').textContent = JSON.stringify(res, null, 2)
    setTimeout(refreshKeys, 300)
  })

  $('#refresh-btn').addEventListener('click', refreshKeys)
  $('#clear-list-btn').addEventListener('click', () => {
    $('#keys-list').innerHTML = ''
  })

  refreshKeys()
})
