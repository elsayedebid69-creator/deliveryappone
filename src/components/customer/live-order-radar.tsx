import { LiveOrderMap } from "@/components/apps/live-order-map";
interface LiveOrderRadarProps {orderId?:string|undefined;restaurantName?:string|undefined;deliveryAddress?:string|undefined;status?:string|undefined;createdTime?:string;}
export function LiveOrderRadar({orderId,restaurantName,deliveryAddress,status}:LiveOrderRadarProps) {
 const labels:Record<string,string>={pending:"جديد",accepted:"مقبول",preparing:"قيد التحضير",ready:"جاهز للاستلام",on_the_way:"في الطريق",delivered:"تم التسليم",cancelled:"ملغي"};
 if(!orderId) return <p className="text-muted-foreground">لا يوجد طلب نشط</p>;
 return <section dir="rtl" className="space-y-3 border-b pb-4 text-foreground"><h3 className="font-bold">{restaurantName}</h3><p>{status?labels[status]:""}</p><p className="text-sm">{deliveryAddress}</p><LiveOrderMap orderId={orderId}/></section>;
}
