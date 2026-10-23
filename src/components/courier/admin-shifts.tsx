import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { assignCourierShift, reviewCourierBreak } from "@/lib/courier-shifts.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { workedSeconds } from "@/lib/courier-shift-rules";

export type ShiftFieldsValue = {start:string;areas:string[];adjacent:boolean};
export const emptyShift:ShiftFieldsValue = {start:"",areas:["","",""],adjacent:false};
export function ShiftFields({value,onChange}:{value:ShiftFieldsValue;onChange:(v:ShiftFieldsValue)=>void}) {
  return <fieldset className="space-y-3 border-t pt-3">
    <legend className="text-sm font-bold">الشيفت ومناطق التغطية</legend>
    <label className="block text-sm">بداية الشيفت (توقيت الرياض)<Input aria-label="بداية الشيفت" type="datetime-local" required value={value.start} onChange={e=>onChange({...value,start:e.target.value})}/></label>
    {value.areas.map((a,i)=><label key={i} className="block text-sm">الحي {i+1}<Input aria-label={`الحي ${i+1}`} required minLength={2} maxLength={100} value={a} onChange={e=>onChange({...value,areas:value.areas.map((n,j)=>i===j?e.target.value:n)})}/></label>)}
    <label className="flex items-center gap-2 text-sm"><Checkbox checked={value.adjacent} onCheckedChange={c=>onChange({...value,adjacent:c===true})}/>أؤكد أن الأحياء الثلاثة متجاورة</label>
  </fieldset>;
}
export function shiftPayload(courierId:string,v:ShiftFieldsValue) {
  if(!v.adjacent) throw new Error("أكد تجاور الأحياء الثلاثة");
  if(new Set(v.areas.map(a=>a.trim())).size!==3) throw new Error("اختر ثلاثة أحياء مختلفة");
  return {courier_id:courierId,scheduled_start:new Date(`${v.start}:00+03:00`).toISOString(),neighborhoods:v.areas,adjacent_confirmed:true as const};
}
export function AdminCourierShifts({courierId}:{courierId:string}) {
  const [open,setOpen] = useState(false);
  const [value,setValue] = useState(emptyShift);
  const [busy,setBusy] = useState(false);
  const qc = useQueryClient();
  const assign = useServerFn(assignCourierShift);
  const review = useServerFn(reviewCourierBreak);
  const shifts = useQuery({queryKey:["admin-app-shifts",courierId],queryFn:async()=>{
    const {data,error}=await supabase.from("courier_shifts").select("*").eq("courier_id",courierId).order("scheduled_start",{ascending:false}).limit(7);
    if(error) throw error; return data;
  },refetchInterval:15000});
  const refresh=()=>void qc.invalidateQueries({queryKey:["admin-app-shifts",courierId]});
  const submit=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);try{await assign({data:shiftPayload(courierId,value)});setOpen(false);refresh();toast.success("تم تحديد الشيفت");}catch(e){toast.error(e instanceof Error?e.message:"تعذر الحفظ");}finally{setBusy(false);}};
  const decide=async(id:string,approve:boolean)=>{setBusy(true);try{await review({data:{shift_id:id,approve}});refresh();}catch(e){toast.error(e instanceof Error?e.message:"تعذر الحفظ");}finally{setBusy(false);}};
  return <div className="mt-3 space-y-3 border-t pt-3">
    {shifts.isError&&<p className="text-sm text-destructive">تعذر تحميل الشيفتات</p>}
    {shifts.data?.map(s=>{
      const seconds=s.started_at?workedSeconds(Date.parse(s.started_at),s.ended_at?Date.parse(s.ended_at):Date.now(),s.break_started_at?Date.parse(s.break_started_at):undefined,s.break_ends_at?Date.parse(s.break_ends_at):undefined):0;
      return <div key={s.id} className="space-y-1 text-sm"><p>{new Date(s.scheduled_start).toLocaleString("ar-SA",{timeZone:"Asia/Riyadh"})}</p><p className="text-muted-foreground">{s.neighborhoods.join(" · ")}</p><p>{s.status==="scheduled"?"لم يبدأ":`${(seconds/3600).toFixed(2)} / 10 ساعات`}{s.status==="completed"?" — يوم مستحق":s.status==="incomplete"?" — يوم غير مستحق":""}</p>{s.break_status==="requested"&&<div className="flex flex-wrap gap-2 pt-2"><span className="w-full">طلب بريك ساعة</span><Button size="sm" disabled={busy} onClick={()=>void decide(s.id,true)}>موافقة</Button><Button variant="outline" size="sm" disabled={busy} onClick={()=>void decide(s.id,false)}>رفض</Button></div>}</div>;
    })}
    {!open?<Button variant="outline" size="sm" onClick={()=>setOpen(true)}>تحديد شيفت</Button>:<form onSubmit={submit} className="space-y-3"><ShiftFields value={value} onChange={setValue}/><div className="flex gap-2"><Button disabled={busy}>حفظ الشيفت</Button><Button variant="outline" type="button" onClick={()=>setOpen(false)}>إلغاء</Button></div></form>}
  </div>;
}
export function AdminOrderRouting({orderId,pickup,neighborhood,onDone}:{orderId:string;pickup:string|null;neighborhood:string|null;onDone:()=>void}) {
  const [address,setAddress]=useState(pickup??"");
  const [area,setArea]=useState(neighborhood??"");
  const [busy,setBusy]=useState(false);
  return <form className="mt-3 space-y-2" onSubmit={async e=>{e.preventDefault();setBusy(true);try{const {error}=await supabase.from("orders").update({pickup_address:address.trim(),delivery_neighborhood:area.trim()}).eq("id",orderId);if(error)throw error;onDone();toast.success("تم تحديد مواقع الطلب");}catch{toast.error("تعذر الحفظ");}finally{setBusy(false);}}}>
    <Input aria-label="مكان الاستلام" placeholder="مكان الاستلام" required value={address} onChange={e=>setAddress(e.target.value)}/>
    <Input aria-label="حي التسليم" placeholder="حي التسليم" required value={area} onChange={e=>setArea(e.target.value)}/>
    <Button size="sm" variant="outline" disabled={busy}>حفظ مواقع الطلب</Button>
  </form>;
}