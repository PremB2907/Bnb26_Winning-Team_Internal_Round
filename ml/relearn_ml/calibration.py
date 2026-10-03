import numpy as np
from sklearn.isotonic import IsotonicRegression

class ProbabilityCalibrator:
    """Isotonic regression probability calibrator for multi-class confidence calibration."""

    def __init__(self):
        self.calibrators = {}

    def fit(self, probs: np.ndarray, y_true: np.ndarray, classes: list):
        """
        probs: (N, C) predicted probabilities
        y_true: (N,) string class labels
        """
        for i, cls in enumerate(classes):
            binary_y = (np.array(y_true) == cls).astype(float)
            cls_probs = probs[:, i]
            ir = IsotonicRegression(out_of_bounds="clip")
            ir.fit(cls_probs, binary_y)
            self.calibrators[cls] = ir

    def calibrate(self, class_name: str, uncalibrated_prob: float) -> float:
        if class_name in self.calibrators:
            cal_prob = self.calibrators[class_name].predict([uncalibrated_prob])[0]
            return float(np.clip(cal_prob, 0.001, 0.999))
        return uncalibrated_prob

def compute_ece(y_true: list, y_pred: list, confidences: list, n_bins: int = 10) -> float:
    confs = np.array(confidences)
    corrects = (np.array(y_true) == np.array(y_pred)).astype(int)
    bins = np.linspace(0, 1, n_bins + 1)
    ece = 0.0
    total = len(confs)

    for i in range(n_bins):
        in_bin = (confs >= bins[i]) & (confs < bins[i+1])
        bin_count = np.sum(in_bin)
        if bin_count > 0:
            bin_acc = np.mean(corrects[in_bin])
            bin_conf = np.mean(confs[in_bin])
            ece += np.abs(bin_acc - bin_conf) * (bin_count / total)

    return float(ece)
