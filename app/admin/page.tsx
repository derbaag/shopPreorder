"use client";
import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { Search, ShoppingBag, User, Heart, ArrowLeft, Plus, Minus, Upload, Check, Clock, ChevronDown, X, Ruler, Truck, Shield, Leaf, Package, CreditCard, Factory, MapPin } from 'lucide-react';

export const dynamic = 'force-dynamic'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null as any

type Page = 'login' | 'products' | 'detail' | 'checkout' | 'payment' | 'success';
type Category = 'ทั้งหมด' | 'เสื้อ' | 'หมวก' | 'ผ้าพัฟ' | 'ผ้าเช็ดหน้า';
type ProductStatus = 'preorder' | 'instock' | 'comingsoon' | 'closed';
type StatusFilter = 'ทั้งหมด' | 'preorder' | 'instock' | 'comingsoon' | 'closed';
type Sort = 'ขายดี' | 'มาใหม่' | 'แนะนำ' | 'ราคา';
type Size = 'S' | 'M' | 'L' | 'XL';

interface Product {
  id: string; name: string; nameEn?: string; price: number; category: string; status: ProductStatus;
  preorderEndsAt?: number; daysLeft?: number; ordered?: number; stock?: number;
  image: string; gallery?: string[]; material?: string; colors?: { name: string; hex: string }[];
}

// Mock สำรอง ถ้า Supabase ยังไม่พร้อม
const MOCK_PRODUCTS: Product[] = [
  { id:'1', name:'เสื้อเดินป่า Ultralight', nameEn:'Trail Ultralight Tee', price:590, category:'เสื้อ', status:'preorder', stock:0, image:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=700&fit=crop', gallery:['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=700&fit=crop'], material:'Polyester Recycled', colors:[{name:'Forest',hex:'#1E3A2E'}], ordered:128, daysLeft:5 },
  { id:'4', name:'ผ้าเช็ดหน้าวินเทจ', nameEn:'Vintage Handkerchief', price:180, category:'ผ้าเช็ดหน้า', status:'instock', stock:24, image:'https://images.unsplash.com/photo-1590732596287-05ff25b6588f?w=600&h=700&fit=crop', gallery:['https://images.unsplash.com/photo-1590732596287-05ff25b6588f?w=600&h=700&fit=crop'], material:'Organic Cotton', colors:[{name:'Ecru',hex:'#F5F1EB'}], ordered:94 },
];

const NAV_ITEMS = [
  { id: 'login', label: 'เข้าสู่ระบบ' }, { id: 'products', label: 'สินค้า' }, { id: 'detail', label: 'รายละเอียด' },
  { id: 'checkout', label: 'ตะกร้า' }, { id: 'payment', label: 'ชำระเงิน' }, { id: 'success', label: 'สำเร็จ' },
];

function getRemainingSeconds(product: Product, now: number): number {
  const ends = (product as any).preorderEndsAt || Date.now() + 5*86400000;
  if (product.status !== 'preorder') return 0;
  return Math.max(0, Math.floor((ends - now) / 1000));
}
function formatLiveCountdown(totalSec: number): string {
  if (totalSec <= 0) return 'หมดเวลาแล้ว';
  const d = Math.floor(totalSec / 86400); const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60); const s = totalSec % 60;
  return d>0?`เหลือ ${d}วัน ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`:`เหลือ ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product>(MOCK_PRODUCTS[0]);
  const [activeCategory, setActiveCategory] = useState<Category>('ทั้งหมด');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ทั้งหมด');
  const [cartQty, setCartQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState<Size>('M');
  const [activeThumb, setActiveThumb] = useState(0);
  const [cartCount, setCartCount] = useState(2);
  const [user, setUser] = useState<{email:string}|null>(null);
  const [nowTick, setNowTick] = useState<number>(Date.now());
  const [timer, setTimer] = useState(899);
  const [paymentStatus, setPaymentStatus] = useState<'idle'|'verifying'|'confirmed'>('idle');
  const [slipPreview, setSlipPreview] = useState<string|null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ดึงสินค้าจาก Supabase จริง
  const fetchProducts = async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('products').select('*').order('id');
    if (!error && data && data.length > 0) {
      const mapped: Product[] = data.map((p:any) => ({
        id: p.id,
        name: p.name,
        nameEn: p.name,
        price: Number(p.price),
        category: p.category,
        status: p.status as ProductStatus,
        stock: p.stock ? Number(p.stock) : 0,
        image: p.image,
        gallery: [p.image],
        material: 'วัสดุธรรมชาติ',
        colors: [{ name: 'Default', hex: '#1E3A2E' }],
        ordered: Math.floor(Math.random()*200),
        daysLeft: 5,
        preorderEndsAt: Date.now() + 5*86400000,
      }));
      setProducts(mapped);
      setSelectedProduct(mapped[0]);
    }
  };

  useEffect(()=>{ fetchProducts(); }, []);
  useEffect(()=>{ const id=setInterval(()=>setNowTick(Date.now()),1000); return()=>clearInterval(id); },[]);
  useEffect(()=>{
    if(!supabase) return;
    supabase.auth.getSession().then(({data}:any)=>{
      if(data.session?.user?.email){ setUser({email:data.session.user.email}); setCurrentPage('products'); }
    });
    const {data:{subscription}}:any = supabase.auth.onAuthStateChange((event:any,session:any)=>{
      if(session?.user?.email){ setUser({email:session.user.email}); setCurrentPage('products'); fetchProducts(); }
      if(event==='SIGNED_OUT'){ setUser(null); setCurrentPage('login'); }
    });
    return ()=> subscription.unsubscribe();
  },[]);
  useEffect(()=>{
    if(currentPage!=='payment') return;
    const id=setInterval(()=>setTimer(t=>Math.max(0,t-1)),1000);
    return ()=>clearInterval(id);
  },[currentPage]);

  const formatTime = (s:number)=> `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const filtered = products.filter(p=>{
    const matchCat = activeCategory==='ทั้งหมด'||p.category===activeCategory;
    const matchStatus = statusFilter==='ทั้งหมด'||p.status===statusFilter;
    return matchCat&&matchStatus;
  });

  const handlePreorder = (p:Product)=>{ setSelectedProduct(p); setActiveThumb(0); setCurrentPage('detail'); };

  if(currentPage==='login'){
    return (
      <div className="min-h-screen bg-[#F5F1EB] grid place-items-center p-6">
        <div className="bg-white rounded-[32px] p-10 w-full max-w-[440px] shadow-xl text-center border">
          <h1 className="text-[36px] font-black tracking-widest">DERBAAG</h1>
          <p className="text-black/60 mt-2">เข้าสู่ระบบเพื่อ Pre-order</p>
          <button onClick={async()=>{
            if(!supabase) return setCurrentPage('products');
            const {error} = await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:window.location.origin}});
            if(error) alert(error.message);
          }} className="mt-8 w-full h-[56px] rounded-full bg-black text-white font-bold flex items-center justify-center gap-3">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6 bg-white rounded-full p-1" /> Continue with Google
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F1EB] text-[#1E3A2E]">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b px-6 h-[72px] flex items-center justify-between">
        <button onClick={()=>{fetchProducts(); setCurrentPage('products');}} className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-[#1E3A2E] text-white grid place-items-center font-bold">DB</div><span className="font-bold tracking-widest">DERBAAG</span></button>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-[#F5F1EB] pl-1 pr-3 h-10 rounded-full border">
            <div className="w-8 h-8 rounded-full bg-[#1E3A2E] text-white grid place-items-center text-[12px] font-bold">{user?.email?.[0]?.toUpperCase()||'G'}</div>
            <span className="text-[12px] font-bold max-w-[160px] truncate">{user?.email}</span>
          </div>
          <button onClick={()=>setCurrentPage('checkout')} className="relative w-10 h-10 rounded-full bg-[#F5F1EB] grid place-items-center border"><ShoppingBag className="w-5 h-5"/><span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FF6B2C] text-white text-[10px] grid place-items-center font-bold">{cartCount}</span></button>
          <button onClick={async()=>{await supabase?.auth.signOut(); setUser(null); setCurrentPage('login');}} className="text-[11px] font-bold px-3 h-9 rounded-full bg-black text-white">Logout</button>
        </div>
      </header>

      {currentPage==='products' && (
        <main className="max-w-[1360px] mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-[32px] font-bold">สินค้าทั้งหมด ({filtered.length}) - ดึงจาก Supabase แล้ว</h1>
            <button onClick={fetchProducts} className="h-10 px-5 rounded-full bg-white border font-bold text-[13px]">รีเฟรช</button>
          </div>
          <div className="flex gap-2 overflow-auto mb-4">
            {(['ทั้งหมด','เสื้อ','หมวก','ผ้าพัฟ','ผ้าเช็ดหน้า'] as Category[]).map(c=>(
              <button key={c} onClick={()=>setActiveCategory(c)} className={`h-10 px-5 rounded-full text-[13px] font-bold border ${activeCategory===c?'bg-black text-white':'bg-white'}`}>{c}</button>
            ))}
          </div>
          <div className="flex gap-2 overflow-auto mb-8">
            {(['ทั้งหมด','preorder','instock','comingsoon','closed'] as StatusFilter[]).map(s=>(
              <button key={s} onClick={()=>setStatusFilter(s)} className={`h-10 px-5 rounded-full text-[13px] font-bold border ${statusFilter===s?'bg-[#1E3A2E] text-white':'bg-white'}`}>{s}</button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(p=>{
              const rem=getRemainingSeconds(p,nowTick);
              return (
                <div key={p.id} onClick={()=>handlePreorder(p)} className="bg-white rounded-[24px] overflow-hidden border shadow-sm hover:shadow-lg transition cursor-pointer">
                  <div className="h-[320px] bg-[#F5F1EB] relative"><img src={p.image} className="w-full h-full object-cover"/>
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {p.status==='preorder'&&<><span className="px-3 py-1 rounded-full bg-[#FF6B2C] text-white text-[11px] font-bold">PRE-ORDER</span><span className="px-3 py-1 rounded-full bg-[#1E3A2E] text-white text-[11px] font-bold">{formatLiveCountdown(rem)}</span></>}
                      {p.status==='instock'&&<span className="px-3 py-1 rounded-full bg-[#12A150] text-white text-[11px] font-bold">พร้อมส่ง {p.stock} ชิ้น</span>}
                      {p.status==='comingsoon'&&<span className="px-3 py-1 rounded-full bg-[#8A8A8A] text-white text-[11px] font-bold">COMING SOON</span>}
                      {p.status==='closed'&&<span className="px-3 py-1 rounded-full bg-black text-white text-[11px] font-bold">ปิดรับแล้ว</span>}
                    </div>
                  </div>
                  <div className="p-6"><div className="flex justify-between"><h3 className="font-bold">{p.name}</h3><span className="font-bold">฿{p.price}</span></div><p className="text-[12px] text-black/50">ID: {p.id} • {p.category}</p></div>
                </div>
              )
            })}
          </div>
          {filtered.length===0 && <div className="text-center py-20 bg-white rounded-[24px] border mt-10"><p className="font-bold">ไม่พบสินค้า</p><p className="text-sm text-black/50">ลองลบตัวกรอง หรือไปเพิ่มสินค้าที่ /admin</p></div>}
        </main>
      )}

      {currentPage==='detail' && (
        <main className="max-w-[1100px] mx-auto px-6 py-10">
          <button onClick={()=>setCurrentPage('products')} className="flex items-center gap-2 font-bold text-black/60 mb-6"><ArrowLeft className="w-4 h-4"/>กลับ</button>
          <div className="grid lg:grid-cols-2 gap-10 bg-white rounded-[24px] p-8 border">
            <div className="h-[500px] rounded-[20px] overflow-hidden bg-[#F5F1EB]"><img src={selectedProduct.image} className="w-full h-full object-cover"/></div>
            <div><h1 className="text-[32px] font-bold">{selectedProduct.name}</h1><p className="text-[24px] font-bold mt-2">฿{selectedProduct.price}</p><p className="mt-4 text-black/60">หมวด: {selectedProduct.category} • สถานะ: {selectedProduct.status} • สต็อก: {selectedProduct.stock}</p>
              <div className="mt-8 flex gap-3"><button onClick={()=>{setCartCount(c=>c+cartQty); setCurrentPage('checkout');}} className="flex-1 h-[52px] rounded-full bg-[#FF6B2C] text-white font-bold">สั่งซื้อ • ฿{selectedProduct.price*cartQty}</button></div>
            </div>
          </div>
        </main>
      )}

      {currentPage==='checkout' && (
        <main className="max-w-[700px] mx-auto px-6 py-10">
          <h1 className="text-[28px] font-bold">ตะกร้า - ดึงจาก Supabase</h1>
          <div className="mt-8 bg-white rounded-[24px] p-8 border"><div className="flex gap-4"><img src={selectedProduct.image} className="w-24 h-24 rounded-[12px] object-cover"/><div><p className="font-bold">{selectedProduct.name}</p><p>฿{selectedProduct.price} x {cartQty}</p></div></div>
            <div className="mt-6 border-t pt-6 flex justify-between font-bold text-[20px]"><span>รวม</span><span>฿{selectedProduct.price*cartQty+40}</span></div>
            <button onClick={()=>setCurrentPage('payment')} className="mt-6 w-full h-12 rounded-full bg-black text-white font-bold">ไปชำระเงิน</button>
          </div>
        </main>
      )}

      {currentPage==='payment' && (
        <main className="max-w-[700px] mx-auto px-6 py-10">
          <h1 className="text-[28px] font-bold">ชำระเงิน {formatTime(timer)}</h1>
          <div className="mt-8 bg-white rounded-[24px] p-8 border text-center">
            <div className="w-[300px] h-[300px] bg-[#F5F1EB] mx-auto rounded-[16px] grid place-items-center font-bold">QR ฿{selectedProduct.price*cartQty+40}</div>
            <button onClick={()=>setCurrentPage('success')} className="mt-6 w-full h-12 rounded-full bg-black text-white font-bold">ยืนยันชำระเงิน (Mock)</button>
          </div>
        </main>
      )}

      {currentPage==='success' && (
        <main className="max-w-[700px] mx-auto px-6 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 text-green-700 grid place-items-center mx-auto"><Check className="w-10 h-10"/></div>
          <h1 className="text-[36px] font-bold mt-6">สั่งซื้อสำเร็จ!</h1>
          <p className="text-black/60">ลบใน Admin แล้วจะหายจากหน้า products ทันที</p>
          <button onClick={()=>{fetchProducts(); setCurrentPage('products');}} className="mt-8 h-12 px-10 rounded-full bg-black text-white font-bold">กลับไปดูสินค้า</button>
        </main>
      )}
    </div>
  );
}
