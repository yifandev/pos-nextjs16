import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface PaymentStatusDisplayProps {
  status: "processing" | "success" | "failed";
  onRetry?: () => void;
}

export function PaymentStatusDisplay({
  status,
  onRetry,
}: PaymentStatusDisplayProps) {
  const statusConfig = {
    processing: {
      icon: Loader2,
      title: "Memproses pembayaran...",
      description: "Harap tunggu sebentar",
      iconClass: "text-primary animate-spin",
      bgClass: "bg-primary/10",
    },
    success: {
      icon: CheckCircle,
      title: "Pembayaran Berhasil!",
      description: "Transaksi Anda telah diproses",
      iconClass: "text-green-600",
      bgClass: "bg-green-100",
    },
    failed: {
      icon: XCircle,
      title: "Pembayaran Gagal",
      description: "Terjadi kesalahan saat memproses pembayaran",
      iconClass: "text-destructive",
      bgClass: "bg-destructive/10",
    },
  } as const;

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <div className={`${config.bgClass} rounded-full p-4`}>
        <Icon className={`h-12 w-12 ${config.iconClass}`} />
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">{config.title}</h3>
        <p className="text-sm text-muted-foreground">{config.description}</p>
      </div>

      {status === "failed" && onRetry && (
        <Button onClick={onRetry} className="mt-4">
          Coba Lagi
        </Button>
      )}

      {status === "processing" && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <AlertCircle className="h-3 w-3" />
          <span>Jangan tutup halaman ini</span>
        </div>
      )}
    </div>
  );
}
