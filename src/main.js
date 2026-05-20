import * as webllm from '@mlc-ai/web-llm';
import { CATALOG, VALID_STYLES } from "./data/catalog.js";
import { extractJSON, validateAIIntent } from "./utils/aiUtils.js";

document.addEventListener('DOMContentLoaded', () => {
  const engineSelect = document.getElementById('engineSelect');
  const engineStatus = document.getElementById('engineStatus');
  const productGrid = document.getElementById('productGrid');
  
  // Chat elements
  const aiToggleBtn = document.getElementById('aiToggleBtn');
  const aiChatModal = document.getElementById('aiChatModal');
  const closeChatBtn = document.getElementById('closeChatBtn');
  const chatForm = document.getElementById('chatForm');
  const userInput = document.getElementById('userInput');
  const chatMessages = document.getElementById('chatMessages');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const loadingText = document.getElementById('loadingText');
  const suggestions = document.querySelectorAll('.suggestion-chip');
  
  // Dev elements
  const devModeBtn = document.getElementById('devModeBtn');
  const devOverlay = document.getElementById('devOverlay');
  const jsonOutput = document.getElementById('jsonOutput');

  // Set Date
  document.getElementById('currentDate').textContent = new Date().toLocaleString('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit', 
    hour: '2-digit', minute:'2-digit', hour12: true
  });

  // --- UI RENDER ---
  function renderProducts(products) {
    productGrid.innerHTML = '';
    
    if (products.length === 0) {
      productGrid.innerHTML = '<div class="col-span-1 md:col-span-2 text-center p-20 text-gray-500 font-medium bg-white">No products found matching your criteria.</div>';
      return;
    }

    products.forEach(p => {
      const card = document.createElement('div');
      card.className = 'bg-[#f3f3f3] relative group border-b border-r border-gray-200';
      card.innerHTML = `
        <button class="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 transition">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        <div class="aspect-[4/5] w-full overflow-hidden flex items-center justify-center p-8">
          <img src="${p.img}" alt="${p.name}" class="w-full h-full object-cover object-center transform group-hover:scale-105 transition duration-500" loading="lazy">
        </div>
        <div class="p-6 bg-white flex flex-col gap-1">
          <div class="flex justify-between items-start">
            <h3 class="font-medium text-[15px] leading-tight text-gray-900">${p.name}</h3>
          </div>
          <p class="text-[12px] text-gray-500">${p.category}</p>
          <p class="text-[14px] font-medium mt-1 text-gray-900">${p.price}</p>
        </div>
      `;
      productGrid.appendChild(card);
    });
  }

  renderProducts(CATALOG);

  // --- UI INTERACTIONS ---
  let isChatOpen = true;
  let isDevMode = false;

  aiToggleBtn.addEventListener('click', () => {
    isChatOpen = !isChatOpen;
    aiChatModal.classList.toggle('translate-y-0', isChatOpen);
    aiChatModal.classList.toggle('translate-y-[120%]', !isChatOpen);
    aiChatModal.classList.toggle('opacity-0', !isChatOpen);
  });

  closeChatBtn.addEventListener('click', () => {
    isChatOpen = false;
    aiChatModal.classList.remove('translate-y-0');
    aiChatModal.classList.add('translate-y-[120%]', 'opacity-0');
  });

  devModeBtn.addEventListener('click', () => {
    isDevMode = !isDevMode;
    devOverlay.classList.toggle('hidden', !isDevMode);
    devModeBtn.classList.toggle('text-[#003882]', isDevMode);
  });

  suggestions.forEach(btn => {
    btn.addEventListener('click', () => {
      userInput.value = btn.textContent;
      chatForm.dispatchEvent(new Event('submit'));
    });
  });

  function addMessage(text, isUser = false) {
    const div = document.createElement('div');
    if (isUser) {
      div.className = 'max-w-[85%] self-end bg-[#f1f1f1] text-gray-900 px-4 py-2 rounded-2xl rounded-tr-sm';
      div.textContent = text;
    } else {
      div.className = 'max-w-[90%] text-gray-900 leading-relaxed font-medium mt-2';
      // simple formatting for bot response
      div.innerHTML = text.replace(/\n/g, '<br>');
    }
    chatMessages.insertBefore(div, loadingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showLoading(text) {
    loadingText.textContent = text;
    loadingIndicator.classList.remove('hidden');
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function hideLoading() {
    loadingIndicator.classList.add('hidden');
  }

  // --- AI LOGIC ---
  const systemPrompt = `You are a strict JSON extraction engine.
Your ONLY job is to extract search parameters from the user's text and output a JSON object.
Do NOT invent, guess, or add information. If a parameter is not explicitly mentioned by the user, its value MUST be null.
You MUST output ONLY a valid JSON object, and absolutely nothing else.

Schema:
{
  "color": "Extract the color mentioned (e.g. red, black, blue, green), otherwise null",
  "style": "Extract the style ONLY if it is one of [skate shoes, slip-ons, mid-top, high-top, eco], otherwise null",
  "keyword": "Extract any remaining important search term or brand, otherwise null"
}`;

  let webLlmEngine = null;
  const WEBLLM_MODEL = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

  async function updateStatus() {
    const selected = engineSelect.value;
    
    if (selected === 'windowai') {
      if (window.ai && (await window.ai.canCreateTextSession) !== undefined) {
        const caps = await window.ai.canCreateTextSession();
        if (caps !== 'no') {
          engineStatus.className = 'w-2 h-2 rounded-full bg-green-500';
          return;
        }
      }
      engineStatus.className = 'w-2 h-2 rounded-full bg-red-500';
    } else {
      if (!navigator.gpu) {
        engineStatus.className = 'w-2 h-2 rounded-full bg-red-500';
        return;
      }
      engineStatus.className = 'w-2 h-2 rounded-full bg-green-500';
    }
  }

  engineSelect.addEventListener('change', updateStatus);
  updateStatus();


  function applyFilters(criteria) {
    const filtered = CATALOG.filter(p => {
      // 1. Resilient Color Filter
      if (criteria.color && typeof criteria.color === 'string' && criteria.color.toLowerCase() !== 'null') {
        const critColor = criteria.color.toLowerCase();
        if (!p.color.includes(critColor) && !critColor.includes(p.color)) return false;
      }
      
      // 2. Resilient Style Filter (Ignore hallucinated styles like "red shoes")
      if (criteria.style && typeof criteria.style === 'string' && criteria.style.toLowerCase() !== 'null') {
        const critStyle = criteria.style.toLowerCase();
        // Enforce style filter ONLY if the model extracted a real known style
        const isRealStyle = VALID_STYLES.some(vs => critStyle.includes(vs) || vs.includes(critStyle));
        if (isRealStyle) {
          if (!p.style.includes(critStyle) && !critStyle.includes(p.style)) return false;
        }
      }
      
      // 3. Keyword Filter
      if (criteria.keyword && typeof criteria.keyword === 'string' && criteria.keyword.toLowerCase() !== 'null') {
        const keywords = criteria.keyword.toLowerCase().split(/\s+/);
        const searchStr = `${p.name} ${p.category} ${p.color} ${p.style} ${p.tags.join(' ')}`.toLowerCase();
        for (const kw of keywords) {
          if (["shoe", "shoes", "sneaker", "sneakers", "pair", "red"].includes(kw)) continue; // ignore generic or redundant words
          if (!searchStr.includes(kw)) return false;
        }
      }
      return true;
    });
    renderProducts(filtered);
  }

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;

    addMessage(text, true);
    userInput.value = '';
    
    const engine = engineSelect.value;
    
    try {
      if (engine === 'windowai') {
        if (!window.ai) {
          throw new Error("window.ai is not enabled on this browser. Enable the Chrome flags.");
        }
        showLoading("window.ai thinking...");
        const session = await window.ai.createTextSession({ systemPrompt });
        const result = await session.prompt(text);
        handleAIResponse(result, text);
        session.destroy();
        
      } else {
        if (!webLlmEngine) {
          showLoading("Loading WebLLM Model (~1.2GB)...");
          webLlmEngine = await webllm.CreateMLCEngine(WEBLLM_MODEL, {
            initProgressCallback: (progress) => {
              showLoading(progress.text);
            }
          });
        }
        showLoading("WebLLM thinking...");
        const response = await webLlmEngine.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text }
          ],
          temperature: 0.1,
        });
        handleAIResponse(response.choices[0].message.content, text);
      }
    } catch (err) {
      console.error(err);
      addMessage("I'm sorry, I'm having trouble connecting right now.");
      jsonOutput.textContent = `Error: ${err.message}`;
    } finally {
      hideLoading();
    }
  });

  function handleAIResponse(rawResponse, originalInput) {
    let userMsg = "I updated the product list for you!";
    
    if (rawResponse.includes('|||')) {
      const parts = rawResponse.split('|||');
      userMsg = parts[1] && parts[1].trim() !== '' ? parts[1].trim() : userMsg;
      rawResponse = parts[0];
    }

    let parsed = extractJSON(rawResponse);

    if (parsed) {
      parsed = validateAIIntent(parsed, originalInput);

      jsonOutput.textContent = JSON.stringify(parsed, null, 2);
      applyFilters(parsed);
      addMessage(userMsg);
    } else {
      console.error("JSON Parse Error. Raw string:", rawResponse);
      jsonOutput.textContent = `Parse Error. \n\nRaw string:\n${rawResponse}`;
      addMessage("I'm sorry, I didn't quite understand that. (JSON error)");
    }
  }
});
