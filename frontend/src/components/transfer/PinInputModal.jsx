import React, { useState, useRef, useEffect } from "react";
import { X, Lock, AlertCircle } from "lucide-react";
import { Overlay, useToast } from "../ui";

const PinInputModal = ({
  onSubmit,
  onCancel,
  requiredForAmount,
  transferAmount
}) => {
  const toast = useToast();
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);

  const requiresPin = transferAmount > requiredForAmount;

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newPin = [...pin];
    pastedData.split("").forEach((char, i) => {
      if (i < 6) newPin[i] = char;
    });
    setPin(newPin);

    // Focus last filled input
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleSubmit = () => {
    const pinValue = pin.join("");

    if (requiresPin) {
      if (pinValue.length !== 6) {
        setError("Please enter a 6-digit PIN");
        return;
      }
      onSubmit(pinValue);
    } else {
      // PIN not required for this amount, submit without PIN
      onSubmit(undefined);
    }
  };

  const handleSkip = () => {
    if (!requiresPin) {
      onSubmit(undefined);
    }
  };

  return (
    <Overlay
      isOpen
      onClose={onCancel}
      panelClassName="max-w-md rounded-xl bg-white dark:bg-dark-surface-elevated shadow-2xl overflow-hidden"
      ariaLabelledBy="transfer-pin-title"
    >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border-default">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 id="transfer-pin-title" className="text-xl font-bold text-gray-800 dark:text-white">
              {requiresPin ? "Enter Transfer PIN" : "Confirm Transfer"}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {requiresPin ? (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                For your security, transfers above {requiredForAmount} require a PIN
              </p>

              {/* PIN Input */}
              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {pin.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-dark-border-default rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-white transition-all"
                  />
                ))}
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                </div>
              )}

              <p className="text-xs text-center text-gray-500 dark:text-gray-500">
                Don't have a transfer PIN?{" "}
                <button
                  onClick={() => toast.info("Go to Settings > Security to set up your transfer PIN")}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Set it up now
                </button>
              </p>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                This transfer is below the PIN threshold. You can proceed without entering a PIN.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-dark-border-default">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 border border-gray-300 dark:border-dark-border-default text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={requiresPin ? handleSubmit : handleSkip}
            disabled={requiresPin && pin.join("").length !== 6}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {requiresPin ? "Submit PIN" : "Confirm"}
          </button>
        </div>
    </Overlay>
  );
};

export default PinInputModal;
