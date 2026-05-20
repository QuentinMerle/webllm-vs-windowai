# Edge AI E-Commerce Sandbox 🛹

This sandbox is a technical Proof of Concept (POC) demonstrating how to implement a fully local, privacy-first conversational e-commerce search engine using **Small Language Models (SLMs)** directly in the browser. 

It powers the technical article: *Client-Side AI: The Next Era of Consumer E-Commerce?*

## 🌟 Features

- **Dual-Engine Architecture:** Switch seamlessly between two local AI execution environments:
  - **WebLLM (Llama 3.2 1B):** Uses WebGPU to run a quantized Llama model locally.
  - **window.ai (Gemini Nano):** Uses Chrome's experimental built-in native AI API.
- **Zero-Shot JSON Extraction:** Turns natural language queries ("Do you have red skate shoes?") into a strict, parsable JSON intent object.
- **Input Guardrails:** A deterministic JavaScript middleware that intercepts and sanitizes the LLM's output to prevent AI hallucinations (e.g. making sure the extracted color was actually mentioned by the user).
- **Vans-Inspired UI:** A sleek, fully responsive e-commerce layout built with Tailwind CSS.
- **Dev-Mode Inspector:** A real-time JSON visualizer to monitor the LLM's raw intent extraction.

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **A WebGPU compatible browser** (Chrome / Edge) for WebLLM.

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/QuentinMerle/webllm-vs-windowai.git
   cd webllm-vs-windowai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## 🧪 Testing `window.ai` (Chrome Experimental)

To test the `window.ai` engine, you must use Chrome (v127+ or Canary) and enable the following experimental flags:
1. Go to `chrome://flags`
2. Enable **Prompt API for Gemini Nano**
3. Enable **Optimization Guide On Device Model**
4. Restart Chrome.

## 🧠 Architecture Overview

The codebase is structured to be as clear and didactic as possible:

- `/src/data/catalog.js`: The mock product database and schema.
- `/src/utils/aiUtils.js`: The heart of the Edge AI logic. Contains the robust JSON parser (to handle SLM formatting quirks) and the **Anti-Hallucination Guardrail**.
- `/src/main.js`: The core application logic, engine orchestration, and UI updates.
- `index.html`: The markup, including the Dev Mode overlay.

## 📝 Read the Article
This repo was created to illustrate the challenges and solutions of using 1B parameter models for deterministic tasks. Read the full breakdown of Prompt Engineering, Zero-Shot vs Few-Shot, and Cross-Contamination in the [associated DEV.to article (Link coming soon)](#).

## License
MIT
