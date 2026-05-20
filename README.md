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
- **Node.js v20 LTS** — This project uses a `.nvmrc` file. If you use [nvm](https://github.com/nvm-sh/nvm), simply run:
  ```bash
  nvm install && nvm use
  ```
- **A WebGPU-compatible browser** (Chrome 113+ / Edge) for the WebLLM engine.

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

To test the Native AI engine, you must use a recent version of Chrome (v127+) and complete this specific 3-step setup:
1. Go to `chrome://flags` and enable **Prompt API for Gemini Nano**.
2. Still in flags, set **Optimization Guide On Device Model** to **Enabled BypassPerfRequirement** (crucial for it to work on all hardware).
3. Relaunch Chrome, then go to `chrome://components`. Find **Optimization Guide On Device Model** and click "Check for update". Wait for the 1.5GB model to finish downloading.

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
