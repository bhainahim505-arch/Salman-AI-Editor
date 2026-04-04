
declare global {
  interface Window {
    UnityAds: any;
  }
}

class UnityAdsManager {
  private gameId = "6067350";
  private testMode = true; // Set to false for production
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window !== 'undefined' && window.UnityAds) {
      window.UnityAds.initialize(this.gameId, this.testMode, (error: any) => {
        if (error) {
          console.error("Unity Ads Initialization Failed:", error);
        } else {
          console.log("Unity Ads Initialized 🦾");
          this.isInitialized = true;
        }
      });
    }
  }

  showRewardedAd(onComplete: () => void, onFail: () => void) {
    if (!this.isInitialized) {
      console.warn("Unity Ads not initialized yet. Retrying...");
      this.init();
      onFail();
      return;
    }

    window.UnityAds.show("Rewarded_Android", {
      onComplete: (state: string) => {
        if (state === "COMPLETED") {
          console.log("Ad Completed! Giving credits... 🦾💎");
          onComplete();
        } else {
          console.log("Ad Skipped or Failed.");
          onFail();
        }
      },
      onFail: (error: any) => {
        console.error("Ad Show Failed:", error);
        onFail();
      }
    });
  }

  showInterstitialAd() {
    if (!this.isInitialized) return;
    window.UnityAds.show("Interstitial_Android");
  }
}

export const unityAds = new UnityAdsManager();
