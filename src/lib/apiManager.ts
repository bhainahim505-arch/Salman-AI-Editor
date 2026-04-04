
import { db, handleFirestoreError, OperationType } from "../firebase";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";

export const API_KEYS = [
  "AIzaSyAWv4k45Fq677ySCC3MFNoMfSOldPIW17o", // New Sarkar Key
  "1EXglKVCuvCgZgbALbL700DQ9l",
  "2AUsDGbktQn39jsbkzR2PcN2Mb",
  "3ggXBOwiH8YI1kmFQi8C3YKuEo",
  "4rR3olDguOr2hl1XWdy32p7tKw",
  "5sG7KzCkVOVUtdjRa5CcFJcykU",
  "6sEbTdmmbEmeUZU9HY7R4fMdFC",
  "7kknOIhQ2iQiKm5nXSIR8WP95s",
  "8TFzq6yQPkjDLED4pvfz765Dkc",
  "9dmiGOvlix6ObfA0FKzv2abCiq"
];

class APIManager {
  private currentIndex = 0;
  private usageMap: Map<string, number> = new Map();
  private readonly MAX_LIMIT = 50; // Mock limit per key for the meter
  private readonly USER_SESSION_LIMIT = 1; // 1 Free Credit per session
  private userRequestCount = 0;
  private cache: Map<string, string> = new Map();
  private customUserKey: string | null = localStorage.getItem('user_custom_api_key');
  private dynamicKeys: string[] = [];
  private maintenanceMode = false;
  private watermarkConfig = {
    text: "Shaista ✨ Gold",
    color: "rgba(255, 215, 0, 1)",
    size: 40,
    opacity: 0.98
  };
  private onConfigUpdated?: (config: any) => void;

  constructor() {
    this.initializeUsageMap();
    this.setupRemoteConfig();
  }

  private setupRemoteConfig() {
    const configRef = doc(db, "config", "api_keys");
    onSnapshot(configRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        console.log("🔥 Firebase: Remote Config Updated!", data);
        
        if (data.apiKeys && Array.isArray(data.apiKeys)) {
          this.dynamicKeys = data.apiKeys;
          this.currentIndex = 0;
          this.initializeUsageMap();
        }
        
        if (typeof data.maintenanceMode === 'boolean') {
          this.maintenanceMode = data.maintenanceMode;
        }
        
        if (data.watermarkConfig) {
          this.watermarkConfig = { ...this.watermarkConfig, ...data.watermarkConfig };
        }

        if (this.onConfigUpdated) {
          this.onConfigUpdated({
            keys: this.dynamicKeys,
            maintenanceMode: this.maintenanceMode,
            watermarkConfig: this.watermarkConfig
          });
        }
      }
    }, (error) => {
      console.warn("Firebase Remote Config Error (likely permission):", error.message);
    });
  }

  setConfigUpdatedCallback(callback: (config: any) => void) {
    this.onConfigUpdated = callback;
  }

  getMaintenanceMode() { return this.maintenanceMode; }
  getWatermarkConfig() { return this.watermarkConfig; }

  private initializeUsageMap() {
    const keys = this.getAllKeys();
    keys.forEach(key => {
      if (!this.usageMap.has(key)) {
        this.usageMap.set(key, 0);
      }
    });
  }

  private getAllKeys(): string[] {
    return this.dynamicKeys.length > 0 ? this.dynamicKeys : API_KEYS;
  }

  async updateAdminConfig(updates: { 
    apiKeys?: string[], 
    maintenanceMode?: boolean, 
    watermarkConfig?: any 
  }) {
    try {
      const configRef = doc(db, "config", "api_keys");
      await setDoc(configRef, {
        ...updates,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "config/api_keys");
    }
  }

  getAdminKeys(): string[] {
    return this.getAllKeys();
  }

  setCustomKey(key: string) {
    this.customUserKey = key;
    localStorage.setItem('user_custom_api_key', key);
  }

  getCustomKey(): string | null {
    return this.customUserKey;
  }

  getCurrentKey(): string {
    if (this.customUserKey) return this.customUserKey;
    const keys = this.getAllKeys();
    return keys[this.currentIndex];
  }

  isThrottled(): boolean {
    if (this.customUserKey) return false; // No throttle for own key
    return this.userRequestCount >= this.USER_SESSION_LIMIT;
  }

  getProcessingDelay(isPro: boolean): number {
    if (this.customUserKey || isPro) return 0;
    return 2000; // 2s delay for free users to save "petrol"
  }

  getCache(inputHash: string, style: string): string | undefined {
    return this.cache.get(`${inputHash}-${style}`);
  }

  setCache(inputHash: string, style: string, outputUrl: string) {
    // Auto-clean cache if it gets too large (simple LRU-ish)
    if (this.cache.size > 50) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(`${inputHash}-${style}`, outputUrl);
  }

  rotateKey(): string {
    const keys = this.getAllKeys();
    this.currentIndex = (this.currentIndex + 1) % keys.length;
    console.log(`Rotating to API Key index: ${this.currentIndex}`);
    return this.getCurrentKey();
  }

  recordUsage() {
    this.userRequestCount++;
    const key = this.getCurrentKey();
    const currentUsage = (this.usageMap.get(key) || 0) + 1;
    this.usageMap.set(key, currentUsage);
    
    // Admin Alert Logic: 10th key at 90%
    const keys = this.getAllKeys();
    if (keys.length >= 10 && key === keys[9]) {
      const usagePercent = (currentUsage / this.MAX_LIMIT) * 100;
      if (usagePercent >= 90) {
        console.warn("🚨 ADMIN ALERT: Sarkar, petrol bharwa lo! 10th key is at 90% usage.");
        // In a real app, this would trigger a webhook to WhatsApp/Email
        (window as any).adminAlert = "🚨 Sarkar, petrol bharwa lo! 10th key is at 90% usage.";
      }
    }

    if (currentUsage >= this.MAX_LIMIT) {
      this.rotateKey();
    }
  }

  getGlobalStatus(): number {
    const keys = this.getAllKeys();
    const totalUsage = Array.from(this.usageMap.values()).reduce((a, b) => a + b, 0);
    const totalLimit = keys.length * this.MAX_LIMIT;
    return Math.max(0, 100 - (totalUsage / totalLimit) * 100);
  }

  getUserRemaining(): number {
    return Math.max(0, this.USER_SESSION_LIMIT - this.userRequestCount);
  }

  addCreditViaAd() {
    this.userRequestCount = Math.max(0, this.userRequestCount - 1);
    console.log("🔥 Credit Added via Ad! Sarkar, petrol bhar gaya! 🦾⛽");
  }
}

export const apiManager = new APIManager();
