// Simple Agent Core
let conversation = [];

function showMessage(role, text) {
  const chat = document.getElementById("chat");
  const div = document.createElement("div");
  div.className = `msg ${role}`;
  div.textContent = `${role === "user" ? "🧑" : "🤖"}: ${text}`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function showAlert(msg) {
  document.getElementById("alerts").innerHTML =
    `<div class="alert alert-danger">${msg}</div>`;
}

async function sendMessage() {
  const inputEl = document.getElementById("user-input");
  const text = inputEl.value.trim();
  if (!text) return;
  inputEl.value = "";
  showMessage("user", text);
  conversation.push({ role: "user", content: text });

  const provider = document.getElementById("provider").value;
  const model = document.getElementById("model").value;
  const apiKey = document.getElementById("apikey").value;

  if (provider === "demo") {
    showMessage("agent", "(Demo) You said: " + text);
    return;
  }

  try {
    const { output, tool_calls } = await callLLM(provider, model, apiKey, conversation);

    if (output) {
      showMessage("agent", output);
      conversation.push({ role: "assistant", content: output });
    }

    if (tool_calls && tool_calls.length > 0) {
      for (let tc of tool_calls) {
        const result = await handleToolCall(tc);
        showMessage("agent", `Tool result (${tc.name}): ${result}`);
        conversation.push({ role: "tool", content: result });
      }
    }
  } catch (err) {
    showAlert("Error: " + err.message);
  }
}

// ===== Tools =====
async function handleToolCall(tc) {
  if (tc.name === "search") {
    return await googleSearch(tc.arguments.query);
  } else if (tc.name === "aipipe") {
    return await callAIPipe(tc.arguments);
  } else if (tc.name === "run_js") {
    return runJs(tc.arguments.code);
  } else {
    return "Unknown tool";
  }
}

async function googleSearch(query) {
  // 🔧 Replace with real Search API if available
  return "🔍 (stub) Search results for: " + query;
}

async function callAIPipe(params) {
  // 🔧 Replace with real AIPipe call
  return "🔌 (stub) AIPipe executed with: " + JSON.stringify(params);
}

function runJs(code) {
  try {
    const result = Function('"use strict"; return (' + code + ')')();
    return "JS Result: " + result;
  } catch (err) {
    return "JS Error: " + err.message;
  }
}

// ===== LLM API =====
async function callLLM(provider, model, apiKey, messages) {
  if (provider === "openai") {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        tools: [
          { type: "function", function: { name: "search", description: "Search the web", parameters: { query: "string" } } },
          { type: "function", function: { name: "aipipe", description: "Run an AI workflow", parameters: { any: "object" } } },
          { type: "function", function: { name: "run_js", description: "Run JavaScript code", parameters: { code: "string" } } },
        ]
      }),
    });
    const data = await res.json();
    return { output: data.choices[0].message?.content, tool_calls: data.choices[0].message?.tool_calls };
  }

  if (provider === "gemini") {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: messages[messages.length-1].content }]}]
      }),
    });
    const data = await res.json();
    return { output: data.candidates[0].content.parts[0].text, tool_calls: [] };
  }

  throw new Error("Unsupported provider");
}
