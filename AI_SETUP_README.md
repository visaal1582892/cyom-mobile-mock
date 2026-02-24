# CYOM AI Setup Guide

## 1. Choosing Your AI Provider

You found the "Error: No API Key" message. This is because the app needs an AI "brain" to talk to. You have two choices:

### Option A: Cloud (OpenAI) - Easiest
*   **Pros**: No setup, works on any device (even phone).
*   **Cons**: Costs money (very cheap, but not free), requires internet.
*   **How to get a Key**:
    1.  Go to [platform.openai.com](https://platform.openai.com/signup).
    2.  Sign up and add a small credit ($5 is enough for months).
    3.  Go to **API Keys** and create a new secret key.
    4.  Copy it (starts with `sk-...`).
    5.  In the CYOM App ChatBot settings, paste this key.

### Option B: Local (Ollama) - Free & Private
*   **Pros**: 100% Free, Private, Works offline.
*   **Cons**: Requires a decent laptop/PC to run the model.
*   **How to setup**:
    1.  Download [Ollama](https://ollama.com).
    2.  Install and run it.
    3.  Open your terminal/command prompt and run: `ollama run llama3` (or any other model).
    4.  In the CYOM App ChatBot settings, click **"Local (Ollama)"**.
    5.  No API Key needed!

---

## 2. Fine-Tuning Your Custom Model (The "Real" Coach)

You asked if I can fine-tune it. **I have prepared everything for you**, but since fine-tuning requires a powerful GPU (Graphics Card), **you need to run the training on Google Colab (Cloud)**. It is free.

### Step-by-Step Instructions:

1.  **Generate Data (Already Done)**:
    *   I ran the generator for you. You have `ai_training/training_data.jsonl`.
    *   This file contains 500+ examples of BMR/TDEE calculations based on your app's logic.

2.  **Open the Training Notebook**:
    *   Go to [Google Colab](https://colab.research.google.com).
    *   Click **File > Upload Notebook**.
    *   Upload the file: `d:\RohitWorkspace\cyom-mobile-mock\ai_training\finetune_cyom_model.ipynb`.

3.  **Run the Training**:
    *   In Colab, go to **Runtime > Change runtime type** and select **T4 GPU** (Important!).
    *   Click **Runtime > Run all**.
    *   It will ask you to upload the `training_data.jsonl` file. Upload it from your `ai_training` folder.
    *   Wait about 15-20 minutes. It will train the model.

4.  **Download & Use**:
    *   At the end, the notebook will save a file called `model.gguf`. Download it.
    *   **Move this file to your project folder.**
    *   Open your terminal in `d:\RohitWorkspace\cyom-mobile-mock`.
    *   Create a text file named `Modelfile` (no extension) with this content:
        ```dockerfile
        FROM ./model.gguf
        SYSTEM "You are the CYOM Nutrition Coach..."
        ```
    *   Run command: `ollama create cyom-coach -f Modelfile`
    *   **Done!** Now select "Local (Ollama)" in the ChatBot settings.
    *   (Optional) If you named your model something else (like `llama3`), you can type that name in the **Ollama Model Name** field in the ChatBot settings.
