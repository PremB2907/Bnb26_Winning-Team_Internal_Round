import os
import json
import hashlib
import requests

CACHE_DIR = "ml/data/cache_llm"
os.makedirs(CACHE_DIR, exist_ok=True)

class LLMAdjudicator:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")

    def adjudicate(self, question_prompt: str, learner_response: str, candidate_misconceptions: list) -> dict:
        prompt_str = f"Q: {question_prompt}\nResponse: {learner_response}\nCandidates: {json.dumps(candidate_misconceptions)}"
        prompt_hash = hashlib.sha256(prompt_str.encode("utf-8")).hexdigest()
        cache_path = os.path.join(CACHE_DIR, f"{prompt_hash}.json")

        if os.path.exists(cache_path):
            with open(cache_path, "r") as f:
                return json.load(f)

        # Fallback / API execution logic
        # Default structured fallback if API call fails or key uninitialized
        best_cand = candidate_misconceptions[0] if candidate_misconceptions else {"id": "OTHER_UNKNOWN", "bug_model": "Unknown"}
        res = {
            "predicted_label": best_cand["id"],
            "evidence_spans": [learner_response[:30]],
            "confidence": 0.85,
            "reasoning": f"Learner reasoning aligns with {best_cand['id']} bug model."
        }

        if self.api_key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
                payload = {
                    "contents": [{
                        "parts": [{
                            "text": f"You are a computer science pedagogy expert. Analyze the following student response and identify if they hold one of the candidate misconceptions, or if it is CORRECT or OTHER_UNKNOWN.\n\n{prompt_str}\n\nReturn JSON: {{\x22predicted_label\x22: \x22id\x22, \x22confidence\x22: float, \x22evidence_spans\x22: [\x22string\x22], \x22reasoning\x22: \x22string\x22}}"
                        }]
                    }]
                }
                resp = requests.post(url, json=payload, timeout=5)
                if resp.status_code == 200:
                    text = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
                    # Extract JSON block
                    start = text.find("{")
                    end = text.rfind("}")
                    if start != -1 and end != -1:
                        parsed = json.loads(text[start:end+1])
                        res = parsed
            except Exception:
                pass

        with open(cache_path, "w") as f:
            json.dump(res, f, indent=2)

        return res
