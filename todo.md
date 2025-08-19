Remove OPENAI from project. Using gemini. Remove any complexity around multiple models. Not needed for now.

Add in ability to see past quizes and results of past quizes. Add a retry option for past quizes

Add Optional preprompt fact checking flow goes like this. Get user prompt -> prompt gemeni flash to convert query into search query for wikipedia. -> query wikipedia to add context for LLM -> continue normal flow with additional context added to prompt.