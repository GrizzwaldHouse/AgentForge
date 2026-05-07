"use client";

export default function SplineBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute inset-0 bg-[#0d0a14]" />
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(ellipse,rgba(140,100,255,0.18)_0%,transparent_70%)] animate-[drift1_18s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(ellipse,rgba(100,200,160,0.14)_0%,transparent_70%)] animate-[drift2_22s_ease-in-out_infinite]" />
      <div className="absolute top-[40%] right-[20%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(ellipse,rgba(220,180,130,0.12)_0%,transparent_70%)] animate-[drift3_16s_ease-in-out_infinite]" />
    </div>
  );
}
