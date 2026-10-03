import os
import json
import hashlib
import requests
from typing import Optional, Dict, Any, List

CACHE_DIR = "ml/data/cache_llm"
os.makedirs(CACHE_DIR, exist_ok=True)
PROMPT_VERSION = "v2_structured_quote"

class LLMAdjudicator:
    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")
        self.model_name = model_name or os.getenv("GEMINI_MODEL", "")
        self.discovered_model = None

    def _discover_model(self) -> Optional[str]:
        if self.model_name:
            return self.model_name
        if self.discovered_model:
            return self.discovered_model
        if not self.api_key:
            return None

        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models?key={self.api_key}"
            resp = requests.get(url, timeout=4)
            if resp.status_code == 200:
                models = resp.json().get("models", [])
                for m in models:
                    name = m.get("name", "")
                    methods = m.get("supportedGenerationMethods", [])
                    if "generateContent" in methods and "gemini" in name.lower():
                        # Extract short model name, e.g. models/gemini-1.5-flash -> gemini-1.5-flash
                        self.discovered_model = name.replace("models/", "")
                        return self.discovered_model
        except Exception:
            pass
        return None

    def adjudicate(self, question_prompt: str, learner_response: str, candidate_misconceptions: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Adjudicates student response. Returns real structured LLM diagnosis, or {"status": "UNAVAILABLE"}.
        NEVER fabricates fake labels or confidence scores on failure.
        """
        model = self._discover_model()
        if not model or not self.api_key:
            return {
                "status": "UNAVAILABLE",
                "reason": "Missing or unconfigured GEMINI_API_KEY",
                "adjudicated": False
            }

        # Format input payload with learner response strictly as quoted data
        input_payload = {
            "question_prompt": question_prompt,
            "learner_response_data": learner_response,
            "candidate_misconceptions": candidate_misconceptions
        }

        payload_bytes = json.dumps(input_payload, sort_keys=True).encode("utf-8")
        input_hash = hashlib.sha256(payload_bytes).hexdigest()
        cache_key = f"{model}_{PROMPT_VERSION}_{input_hash}"
        cache_path = os.path.join(CACHE_DIR, f"{cache_key}.json")

        # Check Cache for valid successful response only
        if os.path.exists(cache_path):
            try:
                with open(cache_path, "r", encoding="utf-8") as f:
                    cached_data = json.load(f)
                    if cached_data.get("status") != "UNAVAILABLE":
                        return cached_data
            except Exception:
                pass

        system_instruction = (
            "You are a computer science pedagogy expert. Analyze the provided student response data against the candidate misconceptions. "
            "Return JSON matching: {\"predicted_label\": string, \"confidence\": float, \"evidence_spans\": [string], \"reasoning\": string}. "
            "If none match, return predicted_label as 'CORRECT' or 'OTHER_UNKNOWN'."
        )

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.api_key}"
        request_body = {
            "system_instruction": {"parts": [{"text": system_instruction}]},
            "contents": [{"parts": [{"text": json.dumps(input_payload)}]}],
            "generationConfig": {
                "responseMimeType": "application/json"
            }
        }

        try:
            resp = requests.post(url, json=request_body, timeout=6)
            if resp.status_code == 200:
                res_json = resp.json()
                text_out = res_json["candidates"][0]["content"]["parts"][0]["text"]
                parsed_out = json.loads(text_out)
                
                result = {
                    "status": "SUCCESS",
                    "adjudicated": True,
                    "model_used": model,
                    "predicted_label": parsed_out.get("predicted_label", "OTHER_UNKNOWN"),
                    "confidence": float(parsed_out.get("confidence", 0.5)),
                    "evidence_spans": parsed_out.get("evidence_spans", []),
                    "reasoning": parsed_out.get("reasoning", "")
                }
                
                # Cache ONLY successful responses
                with open(cache_path, "w", encoding="utf-8") as f:
                    json.dump(result, f, indent=2)
                    
                return result
            else:
                return {
                    "status": "UNAVAILABLE",
                    "reason": f"API HTTP Error {resp.status_code}: {resp.text[:100]}",
                    "adjudicated": False
                }
        except Exception as e:
            return {
                "status": "UNAVAILABLE",
                "reason": f"Connection Exception: {str(e)}",
                "adjudicated": False
            }
