import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Control } from "react-hook-form";
import { SaleFormData } from "@/types";
import { CustomerWithSales } from "@/types";

interface CustomerSelectProps {
  control: Control<SaleFormData>;
  customers: CustomerWithSales[];
  disabled?: boolean;
}

export function CustomerSelect({
  control,
  customers,
  disabled,
}: CustomerSelectProps) {
  return (
    <FormField
      control={control}
      name="customerId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Pelanggan (Opsional)</FormLabel>
          <Select
            onValueChange={(value) => {
              // Konversi empty string ke undefined
              field.onChange(value === "none" ? undefined : value);
            }}
            value={field.value || "none"}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Pilih pelanggan" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {/* Gunakan value "none" sebagai placeholder */}
              <SelectItem value="none">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Tanpa pelanggan</span>
                </div>
              </SelectItem>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  <div className="flex flex-col">
                    <span>{customer.name}</span>
                    {customer.phone && (
                      <span className="text-xs text-muted-foreground">
                        {customer.phone}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
