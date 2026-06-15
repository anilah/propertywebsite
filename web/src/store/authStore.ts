import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  mobileNumber: string | null;
  otpSent: boolean;
  otpVerified: boolean;
  currentOTP: string | null; // For demo purposes - display OTP in UI
  
  // Actions
  sendOTP: (mobileNumber: string) => Promise<boolean>;
  verifyOTP: (otp: string) => boolean;
  logout: () => void;
  clearOTPState: () => void;
}

// Mock OTP storage (in real app, this would be on server)
let mockOTP: string | null = null;
let mockOTPExpiry: number | null = null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      mobileNumber: null,
      otpSent: false,
      otpVerified: false,
      currentOTP: null,

      sendOTP: async (mobileNumber: string) => {
        // Validate mobile number (NZ format: +64 or 0 followed by 9 digits)
        const cleaned = mobileNumber.replace(/\s+/g, '').replace(/^\+64/, '0');
        if (!/^0\d{9}$/.test(cleaned)) {
          return false;
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        mockOTP = otp;
        mockOTPExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

        // In real app, send SMS here
        console.log(`[MOCK] OTP for ${cleaned}: ${otp} (valid for 5 minutes)`);

        set({
          mobileNumber: cleaned,
          otpSent: true,
          otpVerified: false,
          currentOTP: otp, // Store for demo display
        });

        return true;
      },

      verifyOTP: (otp: string) => {
        const { mobileNumber } = get();
        
        if (!mobileNumber || !mockOTP) {
          return false;
        }

        // Check expiry
        if (mockOTPExpiry && Date.now() > mockOTPExpiry) {
          set({ otpSent: false });
          mockOTP = null;
          mockOTPExpiry = null;
          return false;
        }

        // Verify OTP
        if (otp === mockOTP) {
          set({
            isAuthenticated: true,
            otpVerified: true,
            currentOTP: null, // Clear OTP after successful verification
          });
          mockOTP = null;
          mockOTPExpiry = null;
          return true;
        }

        return false;
      },

      logout: () => {
        set({
          isAuthenticated: false,
          mobileNumber: null,
          otpSent: false,
          otpVerified: false,
          currentOTP: null,
        });
        mockOTP = null;
        mockOTPExpiry = null;
      },

      clearOTPState: () => {
        set({
          otpSent: false,
          otpVerified: false,
          currentOTP: null,
        });
        mockOTP = null;
        mockOTPExpiry = null;
      },
    }),
    {
      name: 'propertyreach-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        mobileNumber: state.mobileNumber,
      }),
    }
  )
);

