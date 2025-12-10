"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { shiftOpenSchema } from "@/lib/validations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { 
  getActiveShift, 
  openShift, 
  closeShift, 
  getShiftSummary 
} from "@/actions/shift.actions";
import { ShiftWithUser } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";
import { Clock, DollarSign, PlayCircle, StopCircle, Receipt } from "lucide-react";

export function ShiftManager() {
  const [activeShift, setActiveShift] = React.useState<ShiftWithUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [closeDialog, setCloseDialog] = React.useState(false);
  const [closingCash, setClosingCash] = React.useState(0);
  const [summaryDialog, setSummaryDialog] = React.useState<{
    open: boolean;
    summary: any | null;
  }>({ open: false, summary: null });

  const openForm = useForm({
    resolver: zodResolver(shiftOpenSchema),
    defaultValues: {
      openingCash: 0,
    },
  });

  const loadActiveShift = React.useCallback(async () => {
    setIsLoading(true);
    const result = await getActiveShift();
    if (result.success) {
      setActiveShift(result.data || null);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    loadActiveShift();
  }, [loadActiveShift]);

  const handleOpenShift = async (data: { openingCash: number }) => {
    const result = await openShift(data.openingCash);
    if (result.success) {
      toast.success(result.message);
      setOpenDialog(false);
      openForm.reset();
      loadActiveShift();
    } else {
      toast.error(result.error);
    }
  };

  const handleCloseShift = async () => {
    if (!activeShift) return;

    const result = await closeShift(activeShift.id, closingCash);
    if (result.success) {
      toast.success(result.message);
      setCloseDialog(false);
      setClosingCash(0);
      
      // Load summary
      const summaryResult = await getShiftSummary(activeShift.id);
      if (summaryResult.success) {
        setSummaryDialog({ open: true, summary: summaryResult.data });
      }
      
      loadActiveShift();
    } else {
      toast.error(result.error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {!activeShift ? (
        <Card>
          <CardHeader>
            <CardTitle>Shift Belum Dibuka</CardTitle>
            <CardDescription>
              Buka shift untuk mulai melayani transaksi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setOpenDialog(true)} size="lg">
              <PlayCircle className="mr-2 h-5 w-5" />
              Buka Shift
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Shift Aktif
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Kasir</div>
                <div className="font-medium">{activeShift.user.name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Waktu Buka</div>
                <div className="font-medium">
                  {formatDateTime(activeShift.openAt)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Kas Awal</div>
                <div className="font-bold text-lg">
                  {formatCurrency(activeShift.openingCash)}
                </div>
              </div>
              <div>
                <Badge variant="default" className="text-sm">
                  Shift Sedang Berjalan
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StopCircle className="h-5 w-5" />
                Tutup Shift
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Tutup shift untuk menghitung kas akhir dan melihat laporan
              </p>
              <Button 
                onClick={() => setCloseDialog(true)} 
                variant="destructive"
                size="lg"
              >
                <StopCircle className="mr-2 h-5 w-5" />
                Tutup Shift
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Open Shift Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buka Shift Baru</DialogTitle>
            <DialogDescription>
              Masukkan jumlah kas awal untuk memulai shift
            </DialogDescription>
          </DialogHeader>

          <Form {...openForm}>
            <form
              onSubmit={openForm.handleSubmit(handleOpenShift)}
              className="space-y-4"
            >
              <FormField
                control={openForm.control}
                name="openingCash"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kas Awal *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenDialog(false)}
                >
                  Batal
                </Button>
                <Button type="submit">Buka Shift</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Close Shift Dialog */}
      <Dialog open={closeDialog} onOpenChange={setCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tutup Shift</DialogTitle>
            <DialogDescription>
              Hitung kas akhir untuk menutup shift
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Kas Akhir *</label>
              <Input
                type="number"
                placeholder="0"
                value={closingCash}
                onChange={(e) => setClosingCash(parseFloat(e.target.value))}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setCloseDialog(false)}
              >
                Batal
              </Button>
              <Button variant="destructive" onClick={handleCloseShift}>
                Tutup Shift
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Summary Dialog */}
      <Dialog
        open={summaryDialog.open}
        onOpenChange={(open) =>
          setSummaryDialog({ open, summary: null })
        }
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Ringkasan Shift
            </DialogTitle>
          </DialogHeader>

          {summaryDialog.summary && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Kasir</div>
                  <div className="font-medium">
                    {summaryDialog.summary.shift.user.name}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Durasi</div>
                  <div>
                    {formatDateTime(summaryDialog.summary.shift.openAt)} -{" "}
                    {formatDateTime(summaryDialog.summary.shift.closeAt)}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Total Transaksi:</span>
                  <span className="font-medium">
                    {summaryDialog.summary.summary.totalTransactions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Penjualan:</span>
                  <span className="font-medium">
                    {formatCurrency(summaryDialog.summary.summary.totalSales)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Cash:</span>
                  <span className="font-medium">
                    {formatCurrency(summaryDialog.summary.summary.totalCash)}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Kas Awal:</span>
                  <span>
                    {formatCurrency(summaryDialog.summary.shift.openingCash)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cash Masuk:</span>
                  <span>
                    {formatCurrency(summaryDialog.summary.summary.totalCash)}
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Kas Diharapkan:</span>
                  <span>
                    {formatCurrency(summaryDialog.summary.summary.expectedCash)}
                  </span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Kas Aktual:</span>
                  <span>
                    {formatCurrency(summaryDialog.summary.summary.actualCash)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Selisih:</span>
                  <span
                    className={
                      summaryDialog.summary.summary.difference >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {formatCurrency(summaryDialog.summary.summary.difference)}
                  </span>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => setSummaryDialog({ open: false, summary: null })}
              >
                Tutup
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
