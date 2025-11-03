# Improving Talking

A full-stack English conversation practice app powered by Next.js, FastAPI, and AI. Users can chat with an AI assistant, receive voice responses, and get personalized feedback on their English sentences.

---

## Screenshots

<!-- Add screenshots or GIFs here -->
![App Screenshot](images/app-screenshot.png)

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.9+)
- LM Studio (for local AI chat completions)

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/yourusername/improvingTalking.git
cd improvingTalking
```

#### 2. Install frontend dependencies

```bash
npm install
```

#### 3. Install LM Studio

- Download LM Studio from [https://lmstudio.ai/](https://lmstudio.ai/)
- Install and run LM Studio on your machine.
- Download a compatible LLM model (e.g., Llama-3) inside LM Studio.
- Start the LM Studio local server:
  - Go to the "API" tab in LM Studio.
  - Click "Enable API" (default port is 1234).

#### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## Usage

1. Sign up or log in.
2. Start a new conversation.
3. Speak into your microphone and interact with the AI assistant.
4. View feedback and conversation history.

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [LM Studio Documentation](https://lmstudio.ai/docs)

---

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

---