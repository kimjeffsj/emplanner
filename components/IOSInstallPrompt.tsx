"use client";

import { useState, useEffect } from "react";
import { X, Share, PlusSquare } from "lucide-react";

const STORAGE_KEY = "ios-install-prompt-dismissed";

export default function IOSInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // iOS Safari 감지
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

    // 이미 설치됨 or 이미 닫음 or iOS Safari 아님
    if (isStandalone) return;
    if (localStorage.getItem(STORAGE_KEY) === "true") return;
    if (!isIOS || !isSafari) return;

    // 3초 후 표시 (페이지 로드 후)
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300"
        role="dialog"
        aria-labelledby="ios-install-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 id="ios-install-title" className="text-lg font-semibold text-zinc-900 dark:text-white">
            Install App
          </h2>
          <button
            onClick={handleDismiss}
            className="p-2 -m-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Install this app on your iPhone for quick access from the home screen.
          </p>

          {/* Step 1 */}
          <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg shrink-0">
              <Share className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-white">
                1. Tap the Share button
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                At the bottom of Safari
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg shrink-0">
              <PlusSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-white">
                2. Tap "Add to Home Screen"
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Scroll down in the share menu
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={handleDismiss}
            className="w-full py-3 px-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
