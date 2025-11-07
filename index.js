const chat = document.getElementById("chat");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = `msg ${sender}`;
  msg.textContent = text;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;
  appendMessage("user", text);
  input.value = "";
  
  appendMessage("bot", "Thinking...");
  const thinkingEl = chat.lastElementChild;

  try {
    // Call your backend (which securely uses the API key)
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();

    thinkingEl.textContent = data.reply || "No response.";
  } catch (err) {
    thinkingEl.textContent = "Error connecting to HG Bot.";
  }
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});
