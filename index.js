// index.js — frontend
const messagesEl = document.getElementById('messages');
const inputEl = document.getElementById('input');
const sendBtn = document.getElementById('send');
const statusEl = document.getElementById('status');

function addMessage(role, text) {
  const div = document.createElement('div');
  div.className = 'msg ' + (role === 'user' ? 'user' : 'bot');
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.parentElement.scrollTop = messagesEl.parentElement.scrollHeight;
}

async function sendToServer(message) {
  try {
    const res = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || 'Server error');
    }
    const data = await res.json();
    return data;
  } catch (err) {
    return { error: err.message || String(err) };
  }
}

async function onSend() {
  const text = inputEl.value.trim();
  if (!text) return;
  inputEl.value = '';
  addMessage('user', text);
  addMessage('bot', '…'); // placeholder for thinking
  const placeholder = messagesEl.lastElementChild;

  statusEl.textContent = 'Sending…';
  const resp = await sendToServer(text);
  if (resp.error) {
    placeholder.textContent = 'Error: ' + resp.error;
    statusEl.textContent = 'Error';
  } else {
    placeholder.textContent = resp.reply ?? 'No reply';
    statusEl.textContent = 'Connected';
  }
}

sendBtn.addEventListener('click', onSend);
inputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter') onSend();
});

// ping server for health
(async function ping() {
  try {
    const r = await fetch('/health');
    if (r.ok) statusEl.textContent = 'Connected';
    else statusEl.textContent = 'Disconnected';
  } catch {
    statusEl.textContent = 'Disconnected';
  }
})();
