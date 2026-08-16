"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Product = {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category: string;
  status: string;
  stock: number;
};

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: "", price: "", image_url: "", category: "เสื้อ" });
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("id", { ascending: true });
    if (data) setProducts(data);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleAddOrUpdate = async () => {
    if (!form.name || !form.price) return alert("ใส่ชื่อกับราคาก่อน");
    const payload = {
      name: form.name,
      price: parseInt(form.price),
      image_url: form.image_url,
      category: form.category,
      status: "preorder",
      stock: 0,
    };
    if (editingId) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingId);
      if (error) alert(error.message); else { setEditingId(null); setForm({ name: "", price: "", image_url: "", category: "เสื้อ" }); fetchProducts(); }
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) alert("Error: " + error.message + "\nไปแก้ Policy ใน Supabase ตามคำแนะนำด้านล่าง");
      else { setForm({ name: "", price: "", image_url: "", category: "เสื้อ" }); fetchProducts(); }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("ลบจริงนะ?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) alert(error.message); else fetchProducts();
  };

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({ name: p.name, price: String(p.price), image_url: p.image_url, category: p.category });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#f5f1eb] p-4 md:p-8 text-black">
      <h1 className="text-2xl md:text-3xl font-black mb-6">DERBAAG ADMIN - แก้ไขได้จริง</h1>

      {/* Add Form */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border mb-8">
        <p className="font-bold mb-3">+ {editingId ? `แก้ไขสินค้า ID ${editingId}` : "เพิ่มสินค้าใหม่"}</p>
        <div className="flex flex-col md:flex-row gap-3">
          <input placeholder="ชื่อ" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="bg-[#f2f0eb] rounded-full px-4 py-2.5 flex-1 outline-none" />
          <input placeholder="ราคา" type="number" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} className="bg-[#f2f0eb] rounded-full px-4 py-2.5 w-full md:w-32 outline-none" />
          <input placeholder="ลิงค์รูป" value={form.image_url} onChange={e=>setForm({...form, image_url: e.target.value})} className="bg-[#f2f0eb] rounded-full px-4 py-2.5 flex-[2] outline-none" />
          <select value={form.category} onChange={e=>setForm({...form, category: e.target.value})} className="bg-[#f2f0eb] rounded-full px-4 py-2.5 w-full md:w-36 outline-none">
            <option>เสื้อ</option><option>หมวก</option><option>ผ้าฟลีซ</option><option>ผ้าเช็ดหน้า</option><option>กางเกง</option><option>กระเป๋า</option>
          </select>
          <button onClick={handleAddOrUpdate} className="bg-black text-white rounded-full px-8 py-2.5 font-bold">{editingId ? "บันทึก" : "เพิ่ม"}</button>
          {editingId && <button onClick={()=>{setEditingId(null); setForm({ name: "", price: "", image_url: "", category: "เสื้อ" });}} className="bg-zinc-300 rounded-full px-6">ยกเลิก</button>}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f7f5f2] text-left">
              <tr><th className="p-3">รูป</th><th className="p-3">ID</th><th className="p-3">ชื่อ</th><th className="p-3">ราคา</th><th className="p-3">สถานะ</th><th className="p-3">สต็อก</th><th className="p-3">จัดการ</th></tr>
            </thead>
            <tbody>
              {products.map(p=>(
                <tr key={p.id} className="border-t">
                  <td className="p-2"><img src={p.image_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-zinc-100" /></td>
                  <td className="p-3">{p.id}</td>
                  <td className="p-3 font-bold">{p.name}</td>
                  <td className="p-3">฿{p.price}</td>
                  <td className="p-3"><span className="bg-black text-white text-[10px] px-2.5 py-1 rounded-full">{p.status}</span></td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3 flex gap-2">
                    <button onClick={()=>handleEdit(p)} className="bg-black text-white rounded-full px-3 py-1 text-xs">แก้</button>
                    <button onClick={()=>handleDelete(p.id)} className="bg-[#b5452a] text-white rounded-full px-3 py-1 text-xs">ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 mt-6 text-xs leading-5 border">
        ถ้ากดลบ/แก้แล้วขึ้น error "policy" ให้ไปแก้ตามนี้:<br/>
        Supabase → Table Editor → products → Policies → New Policy → Create policy from scratch → ตั้งชื่อ Allow all → Command: All → USING: true → WITH CHECK: true → Save
      </div>
    </div>
  );
}
