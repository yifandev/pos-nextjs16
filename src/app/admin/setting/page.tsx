import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function SettingPage() {
  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground">
          Kelola pengaturan aplikasi dan toko Anda
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Toko</CardTitle>
            <CardDescription>
              Informasi dasar tentang toko Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store-name">Nama Toko</Label>
              <Input id="store-name" placeholder="Nama toko Anda" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-address">Alamat</Label>
              <Input id="store-address" placeholder="Alamat lengkap" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="store-phone">Telepon</Label>
                <Input id="store-phone" placeholder="08123456789" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-email">Email</Label>
                <Input id="store-email" type="email" placeholder="toko@email.com" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pengaturan Pajak</CardTitle>
            <CardDescription>
              Konfigurasi pajak untuk produk
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default-tax">Default PPN (%)</Label>
              <Input
                id="default-tax"
                type="number"
                step="0.01"
                placeholder="11"
                defaultValue="11"
              />
              <p className="text-sm text-muted-foreground">
                Pajak default untuk produk baru (dalam persen)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifikasi Stok</CardTitle>
            <CardDescription>
              Pengaturan peringatan stok rendah
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="low-stock-threshold">Batas Stok Rendah</Label>
              <Input
                id="low-stock-threshold"
                type="number"
                placeholder="10"
                defaultValue="10"
              />
              <p className="text-sm text-muted-foreground">
                Tampilkan peringatan ketika stok mencapai jumlah ini
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metode Pembayaran</CardTitle>
            <CardDescription>
              Metode pembayaran yang tersedia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Cash</div>
                  <div className="text-sm text-muted-foreground">
                    Pembayaran tunai
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-green-600">Aktif</span>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">QRIS</div>
                  <div className="text-sm text-muted-foreground">
                    Pembayaran via QRIS
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-green-600">Aktif</span>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Transfer Bank</div>
                  <div className="text-sm text-muted-foreground">
                    Pembayaran via transfer
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-green-600">Aktif</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline">Reset</Button>
          <Button>Simpan Perubahan</Button>
        </div>
      </div>
    </div>
  );
}
