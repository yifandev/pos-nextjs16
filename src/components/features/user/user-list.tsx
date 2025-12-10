"use client";

import * as React from "react";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUsers, updateUser, banUser, unbanUser } from "@/actions/user.actions";
import { UserWithRelations } from "@/types";
import { formatDate } from "@/lib/utils/format";
import { toast } from "sonner";
import { Pencil, Ban, UserCheck, Shield, User } from "lucide-react";

export function UserList() {
  const [users, setUsers] = React.useState<UserWithRelations[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [editDialog, setEditDialog] = React.useState<{
    open: boolean;
    user: UserWithRelations | null;
  }>({ open: false, user: null });
  const [banDialog, setBanDialog] = React.useState<{
    open: boolean;
    userId: string | null;
  }>({ open: false, userId: null });

  const [editForm, setEditForm] = React.useState({
    name: "",
    email: "",
    role: "cashier",
  });
  const [banReason, setBanReason] = React.useState("");

  const loadUsers = React.useCallback(async () => {
    setIsLoading(true);
    const result = await getUsers();
    if (result.success && result.data) {
      setUsers(result.data);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleEdit = (user: UserWithRelations) => {
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role || "cashier",
    });
    setEditDialog({ open: true, user });
  };

  const handleSaveEdit = async () => {
    if (!editDialog.user) return;

    const result = await updateUser(editDialog.user.id, editForm);
    if (result.success) {
      toast.success(result.message);
      setEditDialog({ open: false, user: null });
      loadUsers();
    } else {
      toast.error(result.error);
    }
  };

  const handleBan = async () => {
    if (!banDialog.userId) return;

    const result = await banUser(banDialog.userId, banReason);
    if (result.success) {
      toast.success(result.message);
      setBanDialog({ open: false, userId: null });
      setBanReason("");
      loadUsers();
    } else {
      toast.error(result.error);
    }
  };

  const handleUnban = async (userId: string) => {
    const result = await unbanUser(userId);
    if (result.success) {
      toast.success(result.message);
      loadUsers();
    } else {
      toast.error(result.error);
    }
  };

  const columns: Column<UserWithRelations>[] = [
    {
      header: "User",
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            {item.role === "admin" ? (
              <Shield className="h-5 w-5 text-primary" />
            ) : (
              <User className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <div className="font-medium">{item.name}</div>
            <div className="text-sm text-muted-foreground">{item.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      cell: (item) => (
        <Badge variant={item.role === "admin" ? "default" : "secondary"}>
          {item.role === "admin" ? "Admin" : "Kasir"}
        </Badge>
      ),
    },
    {
      header: "Status",
      cell: (item) => (
        <div>
          {item.banned ? (
            <Badge variant="destructive">Banned</Badge>
          ) : (
            <Badge variant="default">Aktif</Badge>
          )}
          {item.emailVerified && (
            <Badge variant="outline" className="ml-2">
              Verified
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: "Terdaftar",
      cell: (item) => (
        <div className="text-sm text-muted-foreground">
          {formatDate(item.createdAt)}
        </div>
      ),
    },
    {
      header: "Aksi",
      cell: (item) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
            <Pencil className="h-4 w-4" />
          </Button>
          {item.banned ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleUnban(item.id)}
            >
              <UserCheck className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setBanDialog({ open: true, userId: item.id })}
            >
              <Ban className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">Kelola user dan permission</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        searchPlaceholder="Cari user..."
        isLoading={isLoading}
        emptyMessage="Belum ada user"
      />

      {/* Edit Dialog */}
      <Dialog
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog({ open, user: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Ubah informasi dan role user
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Nama</Label>
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Role</Label>
              <Select
                value={editForm.role}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="cashier">Kasir</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEditDialog({ open: false, user: null })}
              >
                Batal
              </Button>
              <Button onClick={handleSaveEdit}>Simpan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ban Dialog */}
      <Dialog
        open={banDialog.open}
        onOpenChange={(open) => setBanDialog({ open, userId: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Berikan alasan untuk mem-ban user ini
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Alasan Ban</Label>
              <Input
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Masukkan alasan..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setBanDialog({ open: false, userId: null })}
              >
                Batal
              </Button>
              <Button variant="destructive" onClick={handleBan}>
                Ban User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
