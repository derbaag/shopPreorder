// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Product = {
  id: any;
  name: string;
  price: number;
  image: string;
  image_url?: string;
  category?: string;
  status: string;
  stock: number;
  preorder_ends_at?: string | null;
  preorderEndsAt?: number | null;
};

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: "", price: "", image: "", category: "เสื้อ" });
  const [editingId, setEditingId] = useState<any>(null);
  const [reopenDays, setReopenDays] = useState(7);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("id", { ascending: true });
    if (data) setProducts(data);
  };
  useEffect(() => { fetchProducts(); }, []);

  const getImage = (p: any) => p.image || p.image_url || "";
  const getEndsAt = (p: any) => p.preorder_ends_at || null;
  const isClosed = (p: any) => p.status === 'closed' || (p.preorder_ends_at && new Date(p.preorder_ends_at).getTime() < Date.now());

  const handleAddOrUpdate = async () => {
    if (!form.name || !form.price) return alert("ใส่ชื่อกับราคาก่อน");
    const payload = {
      name: form.name,
      price: parseInt(form.price),
      image: form.image,
      status: "preorder",
      stock: 0,
      preorder_ends_at: new Date(Date.now() + 7*86400000).toISOString(),
    };
    if (editingId) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingId);
      if (error) alert(error.message); else { setEditingId(null); setForm({ name: "", price: "", image: "", category: "เสื้อ" }); fetchProducts(); }
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) alert(error.message); else { setForm({ name: "", price: "", image: "", category: "เสื้อ" }); fetchProducts(); }
    }
  };

  const handleDelete = async (id: any) => {
    if (!confirm("ลบจริงนะ?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) alert(error.message); else fetchProducts();
  };

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setForm({ name: p.name, price: String(p.price), image: getImage(p), category: p.category || "เสื้อ" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReopen = async (p: Product) => {
    const days = reopenDays;
    const newEnds = new Date(Date.now() + days*86400000).toISOString();
    const { error } = await supabase.from("products").update({ status: 'preorder', preorder_ends_at: newEnds }).eq("id", p.id);
    if (error) alert(error.message); else { alert(`เปิด ${p.name} ต่ออีก ${days} วันแล้ว`); fetchProducts(); }
  };

  const handleReopenAll = async () => {
    if (!confirm(`เปิดสินค้าที่ปิดทั้งหมดอีก ${reopenDays} วัน?`)) return;
    const newEnds = new Date(Date.now() + reopenDays*86400000).toISOString();
    const { error } = await supabase.from("products").update({ status: 'preorder', preorder_ends_at: newEnds }).eq("status", "closed");
    if (error) alert(error.message);
    else {
      // also reopen expired preorder
      const expiredIds = products.filter(p => p.preorder_ends_at && new Date(p.preorder_ends_at).getTime() < Date.now()).map(p=>p.id);
      if (expiredIds.length>0) {
        await supabase.from("products").update({ status: 'preorder', preorder_ends_at: newEnds }).in("id", expiredIds);
      }
      alert(`เปิดทั้งหมดแล้ว +${reopenDays}วัน`);
      fetchProducts();
    }
  };

  const handleClose = async (p: Product) => {
    const { error } = await supabase.from("products").update({ status: 'closed' }).eq("id", p.id);
    if (error) alert(error.message); else fetchProducts();
  };

  return (
    <div className="min-h-screen bg-[#f5f1eb] p-4 md:p-8 text-black">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-black">DERBAAG ADMIN - เปิด/ปิด Preorder</h1>
        <div className="flex items-center gap-2 bg-white p-2 rounded-full border shadow-sm">
          <span className="text-sm font-bold ml-2">เปิดต่อ</span>
          <select value={reopenDays} onChange={e=>setReopenDays(Number(e.target.value))} className="bg-[#f2f0eb] rounded-full px-3 py-1 text-sm font-bold">
            <option value={1}>1 วัน</option>
            <option value={3}>3 วัน</option>
            <option value={7}>7 วัน</option>
            <option value={15}>15 วัน</option>
            <option value={30}>30 วัน</option>
          </select>
          <button onClick={handleReopenAll} className="bg-[#1E3A2E] text-white rounded-full px-5 py-2 text-sm font-bold">เปิดทั้งหมดที่ปิด</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border mb-8">
        <p className="font-bold mb-3">+ {editingId? `แก้ไข ID ${editingId}` : "เพิ่มสินค้าใหม่ (จะตั้งปิดอัตโนมัติ +7วัน)"}</p>
        <div className="flex flex-col md:flex-row gap-3">
          <input placeholder="ชื่อ" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="bg-[#f2f0eb] rounded-full px-4 py-2.5 flex-1 outline-none" />
          <input placeholder="ราคา" type="number" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} className="bg-[#f2f0eb] rounded-full px-4 py-2.5 w-32 outline-none" />
          <input placeholder="ลิงค์รูป" value={form.image} onChange={e=>setForm({...form, image: e.target.value})} className="bg-[#f2f0eb] rounded-full px-4 py-2.5 flex-[2] outline-none" />
          <select value={form.category} onChange={e=>setForm({...form, category: e.target.value})} className="bg-[#f2f0eb] rounded-full px-4 py-2.5 w-36 outline-none">
            <option>เสื้อ</option><option>หมวก</option><option>ผ้าพัฟ</option><option>ผ้าเช็ดหน้า</option><option>กางเกง</option>
          </select>
          <button onClick={handleAddOrUpdate} className="bg-black text-white rounded-full px-8 py-2.5 font-bold">{editingId? "บันทึก" : "เพิ่ม"}</button>
          {editingId && <button onClick={()=>{setEditingId(null); setForm({ name: "", price: "", image: "", category: "เสื้อ" });}} className="bg-zinc-300 rounded-full px-6">ยกเลิก</button>}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f7f5f2] text-left"><tr><th className="p-3">รูป</th><th className="p-3">ID</th><th className="p-3">ชื่อ</th><th className="p-3">ราคา</th><th className="p-3">สถานะ</th><th className="p-3">ปิดเมื่อ</th><th className="p-3">จัดการ</th></tr></thead>
            <tbody>
              {products.map(p=>(
                <tr key={p.id} className={`border-t ${isClosed(p) ? 'bg-red-50/60' : ''}`}>
                  <td className="p-2"><img src={getImage(p)} alt="" className="w-12 h-12 rounded-lg object-cover bg-zinc-100" /></td>
                  <td className="p-3">{String(p.id).slice(0,4)}</td>
                  <td className="p-3 font-bold">{p.name}</td>
                  <td className="p-3">฿{p.price}</td>
                  <td className="p-3">
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${p.status==='preorder'?'bg-[#FF6B2C] text-white':p.status==='closed'?'bg-black text-white':'bg-zinc-200'}`}>{p.status}</span>
                    {isClosed(p) && <span className="ml-2 text-[11px] bg-red-600 text-white px-2 py-1 rounded-full">หมดเวลา</span>}
                  </td>
                  <td className="p-3 text-xs">{getEndsAt(p) ? new Date(getEndsAt(p)!).toLocaleString('th-TH') : '-'}</td>
                  <td className="p-3 flex flex-wrap gap-2">
                    {isClosed(p) ? (
                      <button onClick={()=>handleReopen(p)} className="bg-[#12A150] text-white rounded-full px-3 py-1 text-xs font-bold">เปิดใหม่ +{reopenDays}วัน</button>
                    ) : (
                      <button onClick={()=>handleClose(p)} className="bg-zinc-800 text-white rounded-full px-3 py-1 text-xs">ปิดรับ</button>
                    )}
                    <button onClick={()=>handleEdit(p)} className="bg-black text-white rounded-full px-3 py-1 text-xs">แก้</button>
                    <button onClick={()=>handleDelete(p.id)} className="bg-[#b5452a] text-white rounded-full px-3 py-1 text-xs">ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-6 text-xs opacity-60">* กด "เปิดใหม่" จะตั้ง status=preorder และ preorder_ends_at = ตอนนี้ + จำนวนวันที่เลือก เวลาจะนับต่อทันทีหน้าเว็บ</p>
    </div>
  );
}
