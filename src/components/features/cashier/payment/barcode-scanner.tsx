import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Scan } from "lucide-react";
import * as React from "react";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [barcodeInput, setBarcodeInput] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcodeInput.trim()) {
      onScan(barcodeInput);
      setBarcodeInput("");
      inputRef.current?.focus();
    }
  };

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Scan Barcode</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder="Scan atau ketik SKU/Barcode"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            className="flex-1"
            autoFocus
          />
          <Button type="submit" size="icon">
            <Scan className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
