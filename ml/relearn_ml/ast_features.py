import ast

class PythonASTExtractor:
    """Extracts structural bug AST indicators from learner code or snippet text."""

    @staticmethod
    def extract_features(code_str: str) -> dict:
        feats = {
            "has_assign_in_cond": 0,
            "has_range_call": 0,
            "has_append_call": 0,
            "has_upper_strip_call": 0,
            "has_or_chain": 0,
            "has_missing_return": 0,
            "has_sequential_swap": 0,
            "has_nested_loop": 0
        }
        if not code_str:
            return feats

        try:
            tree = ast.parse(code_str)
            for node in ast.walk(tree):
                if isinstance(node, ast.If):
                    if isinstance(node.test, ast.Assign):
                        feats["has_assign_in_cond"] = 1
                    elif isinstance(node.test, ast.BoolOp) and isinstance(node.test.op, ast.Or):
                        feats["has_or_chain"] = 1
                elif isinstance(node.Call, ast.Attribute):
                    if node.func.attr == "append":
                        feats["has_append_call"] = 1
                    elif node.func.attr in ("upper", "lower", "strip", "replace"):
                        feats["has_upper_strip_call"] = 1
                elif isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
                    if node.func.id == "range":
                        feats["has_range_call"] = 1
                elif isinstance(node, ast.FunctionDef):
                    has_ret = any(isinstance(child, ast.Return) for child in ast.walk(node))
                    if not has_ret:
                        feats["has_missing_return"] = 1
                elif isinstance(node, ast.For):
                    has_inner_for = any(isinstance(child, ast.For) for child in ast.walk(node) if child != node)
                    if has_inner_for:
                        feats["has_nested_loop"] = 1
        except Exception:
            pass
        return feats
