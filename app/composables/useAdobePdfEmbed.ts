import { ref } from "vue";

// 使用一個單例 Promise 來確保 SDK 只被載入一次
let sdkLoadPromise: Promise<void> | null = null;

/**
 * 動態載入 Adobe PDF Embed API SDK，並提供初始化方法
 * @returns { loadSdk, isLoaded }
 */
export function useAdobePdfEmbed() {
  // isLoaded 狀態可以追蹤 SDK 是否已就緒
  const isLoaded = ref(false);

  /**
   * 載入並初始化 Adobe PDF Embed SDK
   * @returns Promise<void>
   */
  const loadSdk = (): Promise<void> => {
    // 如果 Promise 已存在，直接返回，避免重複載入
    if (sdkLoadPromise) {
      return sdkLoadPromise;
    }

    // 建立一個新的 Promise 並指派給單例變數
    sdkLoadPromise = new Promise<void>((resolve, reject) => {
      // SSR 環境下直接返回，避免執行 window/document 操作
      if (typeof window === "undefined" || typeof document === "undefined") {
        return resolve();
      }

      // 如果 SDK 已存在，直接 resolve
      if (window.AdobeDC) {
        isLoaded.value = true;
        return resolve();
      }

      // 監聽 Adobe SDK 的官方就緒事件
      document.addEventListener("adobe_dc_view_sdk.ready", () => {
        isLoaded.value = true;
        resolve();
      });

      // 建立 script 標籤並注入
      const script = document.createElement("script");
      script.src = "https://documentcloud.adobe.com/view-sdk/viewer.js";
      script.onload = () => {
        // script.onload 只代表檔案下載完成，不代表 SDK 就緒
        // 真正的就緒狀態由 'adobe_dc_view_sdk.ready' 事件處理
      };
      script.onerror = (error) => {
        console.error("Failed to load Adobe PDF Embed SDK", error);
        reject(error); // 如果載入失敗，則 reject Promise
      };
      document.head.appendChild(script);
    });

    return sdkLoadPromise;
  };

  return { loadSdk, isLoaded };
}
