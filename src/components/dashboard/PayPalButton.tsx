import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface PayPalButtonProps {
  amount: number; // Amount to charge (including fees)
  balanceAmount: number; // Amount to add to balance (original amount, bonus added by backend)
  userId: string;
  onSuccess: (capturedAmount: number) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: any) => {
        render: (element: HTMLElement) => Promise<void>;
        close: () => void;
      };
    };
  }
}

const PayPalButton = ({ amount, balanceAmount, userId, onSuccess, onError, disabled }: PayPalButtonProps) => {
  const paypalRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [sdkReady, setSdkReady] = useState(false);
  const buttonsInstance = useRef<any>(null);

  // Load PayPal SDK
  useEffect(() => {
    const loadPayPalScript = async () => {
      // Check if already loaded
      if (window.paypal) {
        setSdkReady(true);
        setLoading(false);
        return;
      }

      // Get client ID from edge function
      try {
        const { data, error } = await supabase.functions.invoke('paypal-get-client-id');
        
        if (error || !data?.clientId) {
          console.error("Failed to get PayPal client ID:", error);
          setLoading(false);
          return;
        }

        const script = document.createElement("script");
        // Add locale=ar_SA for Arabic, disable-funding for unwanted options
        script.src = `https://www.paypal.com/sdk/js?client-id=${data.clientId}&currency=USD&locale=ar_SA&enable-funding=card&disable-funding=paylater,credit`;
        script.async = true;
        script.onload = () => {
          setSdkReady(true);
          setLoading(false);
        };
        script.onerror = () => {
          console.error("Failed to load PayPal SDK");
          setLoading(false);
        };
        document.body.appendChild(script);
      } catch (err) {
        console.error("Error loading PayPal:", err);
        setLoading(false);
      }
    };

    loadPayPalScript();
  }, []);

  // Render PayPal buttons
  useEffect(() => {
    if (!sdkReady || !window.paypal || !paypalRef.current || disabled || amount < 1) {
      return;
    }

    // Clear previous buttons
    if (buttonsInstance.current) {
      try {
        buttonsInstance.current.close();
      } catch (e) {
        // Ignore close errors
      }
    }
    paypalRef.current.innerHTML = '';

    buttonsInstance.current = window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'paypal',
        height: 45,
      },
      
      // Create order
      createOrder: async () => {
        try {
          const { data, error } = await supabase.functions.invoke('paypal-create-order', {
            body: {
              amount, // Amount to charge
              balanceAmount, // Amount to add to balance
              userId,
            },
          });

          if (error) throw error;
          
          if (!data?.orderId) {
            throw new Error("لم يتم إنشاء الطلب");
          }

          return data.orderId;
        } catch (err: any) {
          console.error("Create order error:", err);
          onError(err.message || "حدث خطأ في إنشاء الطلب");
          throw err;
        }
      },

      // Capture order on approval
      onApprove: async (data: { orderID: string }) => {
        try {
          const { data: captureData, error } = await supabase.functions.invoke('paypal-capture-order', {
            body: {
              orderId: data.orderID,
              userId,
            },
          });

          if (error) throw error;

          if (captureData?.success) {
            onSuccess(captureData.capturedAmount);
          } else {
            throw new Error("فشل في إتمام الدفع");
          }
        } catch (err: any) {
          console.error("Capture error:", err);
          onError(err.message || "حدث خطأ في إتمام الدفع");
        }
      },

      // Handle cancel
      onCancel: () => {
        toast.info("تم إلغاء عملية الدفع");
      },

      // Handle error
      onError: (err: any) => {
        console.error("PayPal error:", err);
        onError("حدث خطأ في عملية الدفع");
      },
    });

    buttonsInstance.current.render(paypalRef.current);

    return () => {
      if (buttonsInstance.current) {
        try {
          buttonsInstance.current.close();
        } catch (e) {
          // Ignore close errors
        }
      }
    };
  }, [sdkReady, amount, balanceAmount, userId, disabled, onSuccess, onError]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="mr-2 text-muted-foreground">جاري تحميل PayPal...</span>
      </div>
    );
  }

  if (!sdkReady) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        فشل في تحميل PayPal. يرجى تحديث الصفحة.
      </div>
    );
  }

  return (
    <div 
      ref={paypalRef} 
      className={`paypal-button-container ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    />
  );
};

export default PayPalButton;
