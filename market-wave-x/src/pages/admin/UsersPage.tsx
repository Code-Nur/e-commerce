import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type JsonRecord = Record<string, unknown>;

interface UserDoc {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  is_blocked: boolean;
  created_at: number | null;
  last_login_at: number | null;
  providers: string[];
  roles: string[];
  raw: JsonRecord;
}

interface UserRoleData {
  role?: string;
}

function toMillis(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  if (value instanceof Timestamp) return value.toMillis();

  if (value && typeof value === "object") {
    const ts = value as { toMillis?: () => number; seconds?: number; nanoseconds?: number };
    if (typeof ts.toMillis === "function") return ts.toMillis();
    if (typeof ts.seconds === "number") return ts.seconds * 1000;
  }

  return null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserDoc | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const [usersSnapshot, userRolesSnapshot] = await Promise.all([
        getDocs(query(collection(db, "users"), orderBy("created_at", "desc"))),
        getDocs(collection(db, "user_roles")),
      ]);

      const rolesMap: Record<string, string[]> = {};
      userRolesSnapshot.docs.forEach((roleDoc) => {
        const data = roleDoc.data() as UserRoleData;
        const role = data.role;
        if (!role) return;

        const userId = roleDoc.id;
        rolesMap[userId] = rolesMap[userId] ? [...rolesMap[userId], role] : [role];
      });

      const usersMap = new Map<string, UserDoc>();

      usersSnapshot.docs.forEach((userDoc) => {
        const data = userDoc.data() as JsonRecord;
        const userId = asString(data.user_id) ?? userDoc.id;

        const mergedUser: UserDoc = {
          id: userDoc.id,
          user_id: userId,
          full_name: asString(data.full_name) ?? asString(data.displayName),
          phone: asString(data.phone) ?? asString(data.phoneNumber),
          email: asString(data.email),
          is_blocked: asBoolean(data.is_blocked),
          created_at: toMillis(data.created_at) ?? toMillis(data.createdAt),
          last_login_at: toMillis(data.last_login_at) ?? toMillis(data.lastLoginAt),
          providers:
            asStringArray(data.providers).length > 0
              ? asStringArray(data.providers)
              : asStringArray(data.providerData),
          roles: rolesMap[userId] || ["customer"],
          raw: data,
        };

        usersMap.set(userId, mergedUser);
      });

      // users hujjati bo'lmasa ham user_roles da bor userlar ro'yxatga qo'shiladi.
      Object.entries(rolesMap).forEach(([userId, roles]) => {
        if (usersMap.has(userId)) return;
        usersMap.set(userId, {
          id: userId,
          user_id: userId,
          full_name: null,
          phone: null,
          email: null,
          is_blocked: false,
          created_at: null,
          last_login_at: null,
          providers: [],
          roles,
          raw: {},
        });
      });

      const list = Array.from(usersMap.values()).sort((a, b) => {
        const aTime = a.created_at ?? 0;
        const bTime = b.created_at ?? 0;
        return bTime - aTime;
      });

      setUsers(list);
    } catch (error) {
      console.error("Foydalanuvchilarni olishda xato:", error);
      toast.error("Foydalanuvchilarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleBlock = async (userId: string, currentlyBlocked: boolean) => {
    try {
      await setDoc(
        doc(db, "users", userId),
        {
          user_id: userId,
          is_blocked: !currentlyBlocked,
          updated_at: Date.now(),
        },
        { merge: true },
      );

      toast.success(currentlyBlocked ? "Foydalanuvchi faollashtirildi" : "Foydalanuvchi bloklandi");
      setUsers((prev) =>
        prev.map((user) =>
          user.user_id === userId
            ? {
                ...user,
                is_blocked: !currentlyBlocked,
              }
            : user,
        ),
      );
    } catch (error) {
      console.error("Blok holatini o'zgartirishda xato:", error);
      toast.error("Xatolik yuz berdi");
    }
  };

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;

    return users.filter((user) =>
      [
        user.full_name || "",
        user.email || "",
        user.phone || "",
        user.user_id,
        user.roles.join(" "),
        user.providers.join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [users, search]);

  const formatDate = (value: number | null) =>
    value ? new Date(value).toLocaleString("uz-UZ") : "—";

  if (loading) return <div className="text-muted-foreground">Yuklanmoqda...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Foydalanuvchilar</h1>
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Ism, email, telefon bo'yicha qidirish"
          className="max-w-sm"
        />
      </div>

      <div className="bg-card rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ism</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Holat</TableHead>
              <TableHead>Ro'yxatdan o'tgan</TableHead>
              <TableHead>Amal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                <TableCell>{u.email || "—"}</TableCell>
                <TableCell>{u.phone || "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {u.roles.map((r) => (
                      <Badge key={r} variant={r === "admin" ? "default" : "secondary"}>
                        {r}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={u.is_blocked ? "destructive" : "outline"}>
                    {u.is_blocked ? "Bloklangan" : "Faol"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString("uz-UZ") : "—"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedUser(u)}>
                      Details
                    </Button>
                    <Button
                      size="sm"
                      variant={u.is_blocked ? "outline" : "destructive"}
                      onClick={() => toggleBlock(u.user_id, u.is_blocked)}
                    >
                      {u.is_blocked ? "Faollashtirish" : "Bloklash"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Foydalanuvchilar topilmadi
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={Boolean(selectedUser)} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Foydalanuvchi tafsilotlari</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground">Ism:</span> {selectedUser.full_name || "—"}
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span> {selectedUser.email || "—"}
                </div>
                <div>
                  <span className="text-muted-foreground">Telefon:</span> {selectedUser.phone || "—"}
                </div>
                <div>
                  <span className="text-muted-foreground">Holat:</span>{" "}
                  {selectedUser.is_blocked ? "Bloklangan" : "Faol"}
                </div>
                <div>
                  <span className="text-muted-foreground">Ro'yxatdan o'tgan:</span>{" "}
                  {formatDate(selectedUser.created_at)}
                </div>
                <div>
                  <span className="text-muted-foreground">Oxirgi kirish:</span>{" "}
                  {formatDate(selectedUser.last_login_at)}
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Rollar:</span>{" "}
                  <span>{selectedUser.roles.join(", ") || "customer"}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
