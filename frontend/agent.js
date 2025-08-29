class SimpleAgent {
  constructor() {
    this.conversationEl = document.getElementById("conversation");
    this.userInputEl = document.getElementById("user-input");
    this.sendBtnEl = document.getElementById("send-btn");
    this.clearChatBtn = document.getElementById("clear-chat");

    this.sendBtnEl.addEventListener("click", () => this.handleUserInput());
    this.userInputEl.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.handleUserInput();
    });
    this.clearChatBtn.addEventListener("click", () => this.clearChat());

    this.addMessage("bot", "👋 Hello! I can answer using OpenAI or Gemini.");
  }

  addMessage(role, text) {
    const div = document.createElement("div");
    div.classList.add("msg", role === "user" ? "user" : "bot");
    div.innerText = text;
    this.conversationEl.appendChild(div);
    this.conversationEl.scrollTop = this.conversationEl.scrollHeight;
  }

  clearChat() {
    this.conversationEl.innerHTML = "";
    this.addMessage("bot", "Chat cleared. Let's start again!");
  }

  async handleUserInput() {
    const input = this.userInputEl.value.trim();
    if (!input) return;
    this.addMessage("user", input);
    this.userInputEl.value = "";

    const provider = document.getElementById("llm-provider").value;
    const model = document.getElementById("model-name").value;

    if (provider === "demo") {
      this.addMessage("bot", "🤖 (Demo Mode) You said: " + input);
      return;
    }

    try {
      const response = await fetch("https://YOUR_BACKEND_URL/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: provider,
          model: model,
          message: input
        })
      });

      if (!response.ok) throw new Error("API Error");

      const data = await response.json();

      let reply = "⚠️ No reply";
      if (provider === "openai") {
        reply = data.choices?.[0]?.message?.content || reply;
      } else if (provider === "gemini") {
        reply = data.candidates?.[0]?.content?.parts?.[0]?.text || reply;
      }

      this.addMessage("bot", reply);
    } catch (err) {
      this.addMessage("bot", "❌ Error: " + err.message);
    }
  }
}

new SimpleAgent();
