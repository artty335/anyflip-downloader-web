import { Downloader } from "@/components/Downloader";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-8">
      <Header />

      <section className="mt-16 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          ดาวน์โหลด <span className="text-brand">AnyFlip</span> เป็น PDF
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-600">
          แค่วางลิงก์หนังสือ แล้วกดปุ่มเดียว — ไฟล์ PDF จะถูกสร้างในเบราว์เซอร์ของคุณเอง
          ไม่ต้องติดตั้งอะไร ไม่ต้องใช้ terminal
        </p>
      </section>

      <section className="mt-10">
        <Downloader />
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-3">
        <Feature icon="⚡" title="เร็วและง่าย">
          วางลิงก์ กดปุ่ม รอแป๊บเดียวได้ไฟล์
        </Feature>
        <Feature icon="🔒" title="เป็นส่วนตัว">
          สร้าง PDF ในเครื่องคุณ ไม่เก็บไฟล์ไว้บนเซิร์ฟเวอร์
        </Feature>
        <Feature icon="💸" title="ฟรีและโอเพนซอร์ส">
          โค้ดเปิดให้ดูได้ ใช้ฟรีไม่มีโฆษณา
        </Feature>
      </section>

      <Footer />
    </main>
  );
}

function Feature({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 text-center">
      <div className="text-2xl">{icon}</div>
      <h3 className="mt-2 font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{children}</p>
    </div>
  );
}
