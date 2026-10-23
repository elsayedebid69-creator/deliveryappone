import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpLeft, Bike, ChevronDown, Globe2, MapPin, Pause, Play, ShoppingBag, Smartphone, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FoodHubLogo } from "@/components/food-hub-logo";
import { useI18n } from "@/lib/i18n";
import videoAsset from "@/assets/foodhub-rider-final-dot-top.webm.asset.json";
import mp4Asset from "@/assets/foodhub-rider-final-dot-top.mp4.asset.json";
import posterAsset from "@/assets/foodhub-rider-final-dot-top-poster.jpg.asset.json";
import appScreen from "@/assets/foodhub-customer-screen.jpg";

export function PublicWebsite() {
  const { lang, setLang } = useI18n();
  const ar = lang === "ar";
  const t = (a:string,e:string) => ar?a:e;
  const video = useRef<HTMLVideoElement>(null);
  const [paused,setPaused] = useState(false);
  const [openFaq,setOpenFaq] = useState<number | null>(0);
  const faqs = [
    [t("كيف أطلب من FoodHub؟","How do I order from FoodHub?"),t("افتح تطبيق العميل، تصفح المطاعم المتاحة، واختر وجبتك وعنوان التسليم ثم أكمل الطلب.","Open the customer app, browse available restaurants, select your meal and delivery address, then place your order.")],
    [t("أين أتابع طلبي؟","Where can I track my order?"),t("من قسم طلباتي في تطبيق العميل يمكنك مشاهدة حالة الطلب وموقع المندوب عند مشاركته للموقع.","The Orders section shows your order status and courier location when location sharing is available.")],
    [t("كيف ينضم المطعم أو المندوب؟","How do restaurants and couriers join?"),t("تتولى الإدارة تسجيل حسابات المطاعم والمناديب وتفعيلها. لا يوجد تسجيل ذاتي لهذه الحسابات.","Restaurant and courier accounts are created and activated by the administration, not through self-registration.")],
    [t("هل يمكنني الطلب من المتصفح؟","Can I order from my browser?"),t("نعم، زر «اطلب الآن» يفتح تجربة العميل مباشرة في المتصفح.","Yes. Order now opens the customer experience directly in your browser.")],
  ];
  const orderButton = <Button asChild className="web-cta"><a href="/?app=customer">{t("اطلب الآن","Order now")}<ArrowUpLeft className="size-4"/></a></Button>;
  return <div className="foodhub-web" dir={ar?"rtl":"ltr"}>
    <header className="web-header"><div className="web-container flex items-center justify-between gap-4">
      <Link to="/" aria-label="FoodHub"><FoodHubLogo size={38}/></Link>
      <nav aria-label={t("القائمة الرئيسية","Main navigation")} className="hidden items-center gap-7 text-sm md:flex"><a href="#home">{t("الرئيسية","Home")}</a><a href="#benefits">{t("المزايا","Benefits")}</a><a href="#faq">{t("الأسئلة الشائعة","FAQ")}</a></nav>
      <div className="flex items-center gap-3"><Button variant="ghost" size="sm" onClick={()=>setLang(ar?"en":"ar")} aria-label={t("English","العربية")}><Globe2 className="size-4"/>{ar?"En":"عربي"}</Button>{orderButton}</div>
    </div></header>
    <main>
      <section id="home" className="web-video" aria-label={t("مندوب FoodHub في طريقه للتوصيل","FoodHub courier delivery film")}>
        <video ref={video} autoPlay muted loop playsInline preload="auto" poster={posterAsset.url} onPlay={()=>setPaused(false)} onPause={()=>setPaused(true)}><source src={videoAsset.url} type="video/webm"/><source src={mp4Asset.url} type="video/mp4"/></video>
        <div className="web-video-caption"><span><Bike className="size-4"/> FOODHUB · {t("من المطعم إلى بابك","From the kitchen to your door")}</span><Button variant="ghost" size="icon" aria-label={paused?t("تشغيل الفيديو","Play video"):t("إيقاف الفيديو مؤقتاً","Pause video")} onClick={()=>{if(paused)void video.current?.play();else video.current?.pause();}}>{paused?<Play className="size-4"/>:<Pause className="size-4"/>}</Button></div>
      </section>
      <section className="web-intro">
        <div className="web-container text-center"><p className="web-eyebrow">{t("طعم تحبّه. تجربة أسهل.","Food you love. Made simpler.")}</p><h1>FOOD<span>HUB</span></h1><h2>{t("وجبتك المفضلة…","Your favorite meal…")}<br/>{t("أقرب مما تتخيّل!","closer than you think!")}</h2><p className="web-lead">{t("كل اللي تشتهيه في مكان واحد. اختر وجبتك، اطلبها، وخلّ الباقي علينا.","Everything you crave in one place. Pick your meal, place your order, and leave the rest to us.")}</p>{orderButton}
          <div className="web-showcase"><div className="web-callouts"><span><UtensilsCrossed/>{t("مطاعمك المفضلة","Your favorite restaurants")}</span><span><ShoppingBag/>{t("كل اللي تشتهيه","Everything you crave")}</span></div><Phone/><div className="web-callouts"><span><MapPin/>{t("طلبك قدام عينك","Keep an eye on your order")}</span><span><Bike/>{t("من المطبخ إلى بابك","From kitchen to doorstep")}</span></div></div>
        </div>
      </section>
      <section id="benefits" className="web-benefits web-container">
        <div className="web-benefit-visual"><Phone/><div className="web-word">{t("بالعافية!","Enjoy!")}</div></div>
        <div className="web-benefit-copy"><p className="web-eyebrow">{t("ليش FoodHub؟","Why FoodHub?")}</p><h2>{t("طلباتك أسهل،","Ordering made easier,")}<br/><span>{t("ويومك ألذّ.","your day made tastier.")}</span></h2>
          {[ [UtensilsCrossed,t("اختيارات على ذوقك","Made for your cravings"),t("تصفّح المطاعم والوجبات، واختر اللي يناسب مزاجك.","Browse restaurants and meals to find what you're in the mood for.")], [ShoppingBag,t("طلب بدون تعقيد","Ordering without the fuss"),t("من اختيار الوجبة إلى عنوان التسليم، كل شيء في مكان واحد.","Your meal and delivery address, all in one place.")], [MapPin,t("تابع طلبك","Follow your order"),t("شاهد تحديثات الطلب وموقع المندوب أثناء التوصيل.","See order updates and the courier's location during delivery.")] ].map(([Icon,title,description],i)=>{const Symbol=Icon as typeof MapPin;return <div className="web-feature" key={i}><Symbol className="size-6"/><div><h3>{String(title)}</h3><p>{String(description)}</p></div></div>;})}
          {orderButton}
        </div>
      </section>
      <section className="web-together"><div className="web-container"><Smartphone className="mx-auto mb-5 size-8"/><h2>{t("كل طلب له حكاية…","Every order has a story…")}<br/>{t("وحكايتك تبدأ هنا.","yours starts here.")}</h2><p className="web-lead">{t("من أول اختيار إلى آخر لقمة، FoodHub معك.","From the first choice to the last bite, FoodHub is with you.")}</p>{orderButton}<div className="web-screen-gallery"><Phone/><Phone/><Phone/></div></div></section>
      <section id="faq" className="web-faq web-container"><div><p className="web-eyebrow">{t("نسهّلها عليك","Keep it simple")}</p><h2>{t("عندك سؤال؟","Have a question?")}<br/><span>{t("عندنا الجواب.","We've got answers.")}</span></h2><FoodHubLogo size={76} showText={false}/></div><div>{faqs.map(([question,answer],i)=><div className="web-faq-item" key={i}><Button variant="ghost" className="web-faq-trigger" aria-expanded={openFaq===i} onClick={()=>setOpenFaq(openFaq===i?null:i)}>{question}<ChevronDown className={`size-5 shrink-0 transition-transform ${openFaq===i?"rotate-180":""}`}/></Button>{openFaq===i&&<p>{answer}</p>}</div>)}</div></section>
      <section className="web-final"><div className="web-container"><p className="web-eyebrow">FOODHUB</p><h2>{t("وش مشتهي اليوم؟","What are you craving today?")}</h2>{orderButton}</div></section>
    </main>
    <footer className="web-footer web-container"><FoodHubLogo size={30}/><p>© {t("فود هب · مؤسسة التموين العالي للتجارة","FoodHub · High Supply Trading Establishment")}</p><div className="flex gap-5 text-sm"><Link to="/privacy">{t("الخصوصية","Privacy")}</Link><Link to="/terms">{t("الشروط","Terms")}</Link><Link to="/auth">{t("تسجيل الدخول","Sign in")}</Link></div></footer>
  </div>;
}
function Phone(){return <div className="web-phone"><div className="web-phone-notch"/><img src={appScreen} alt="تطبيق FoodHub للعميل" loading="lazy" width={780} height={1688}/></div>;}