import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Activity,
  BarChart3,
  BookOpen,
  Check,
  ClipboardList,
  Database,
  Play,
  ShieldCheck,
  X,
} from 'lucide-react';

interface BeginnerGuideModalProps {
  open: boolean;
  onClose: () => void;
}

export const BeginnerGuideModal: React.FC<BeginnerGuideModalProps> = ({ open, onClose }) => {
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#090A0D]/80 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="beginner-guide-title"
    >
      <div
        className="w-full max-w-2xl mx-auto max-h-[86vh] flex flex-col glass-card rounded-3xl overflow-hidden shadow-2xl border border-white/[0.1]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Sticky Header */}
        <div className="px-4 sm:px-6 pt-4 pb-3.5 border-b border-white/[0.07] flex items-center justify-between gap-3 shrink-0 bg-[#12151E]/90">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF4500]/25 to-[#FACC15]/15 text-[#FF4500] ring-1 ring-[#FF4500]/40 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="editorial-label !text-[#FF4500] leading-none">
                LIFTLAB BEGINNER GUIDE
              </div>
              <h2
                id="beginner-guide-title"
                className="font-display text-2xl sm:text-[1.75rem] tracking-wide text-[#F8FAFC] leading-none mt-1"
              >
                คู่มือการใช้งานสำหรับมือใหม่
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดคู่มือการใช้งาน"
            className="btn-tactile active:scale-[0.98] transition-all h-9 w-9 flex items-center justify-center rounded-xl bg-[#1A1D24] hover:bg-[#232834] text-[#94A3B8] hover:text-[#F8FAFC] shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable 4 Easy-to-Scan Visual Guide Cards */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3.5">
          {/* Card 1: Logging & Set Codes (W vs N) */}
          <article className="rounded-2xl p-4 bg-[#141720] border border-white/[0.07] space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FF4500]/16 text-[#FF4500] flex items-center justify-center shrink-0">
                <ClipboardList className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-tech font-bold text-[#FF4500] uppercase tracking-wider">
                  01 · WORKOUT LOGGER
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC] leading-snug">
                  วิธีจดบันทึก &amp; รหัสเซ็ต (W vs N)
                </h3>
              </div>
            </div>

            <p className="text-xs text-[#CBD5E1] leading-relaxed">
              กดเลือกโปรแกรมหรือเริ่มฝึกใหม่ จากนั้นกรอก <strong className="text-[#F8FAFC]">น้ำหนัก (KG)</strong> และ{' '}
              <strong className="text-[#F8FAFC]">จำนวนครั้ง (REPS)</strong> แล้วกดปุ่ม{' '}
              <span className="text-[#FF4500] font-semibold">✓ บันทึกเซ็ต</span> แอปจะเริ่มจับเวลาพักให้อัตโนมัติ แตะที่รหัสหน้าเซ็ตเพื่อสลับประเภทได้ตลอด:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
              <div className="rounded-xl p-2.5 bg-[#1A1D24] border border-white/[0.06] space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-[#0D1017] text-[#94A3B8] font-tech font-bold text-[11px]">
                    W1
                  </span>
                  <span className="text-xs font-bold text-[#E2E8F0]">วอร์มอัพ</span>
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-snug">
                  เซ็ตอุ่นเครื่องน้ำหนักเบา <strong className="text-[#CBD5E1]">ไม่ถูกนำมาคิดรวมในสถิติหลักและ PR</strong> เพื่อไม่ให้ดึงค่าเฉลี่ยลดลง
                </p>
              </div>

              <div className="rounded-xl p-2.5 bg-[#1A1D24] border border-white/[0.1] space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-[#252B39] text-[#F8FAFC] font-tech font-bold text-[11px]">
                    N1
                  </span>
                  <span className="text-xs font-bold text-[#F8FAFC]">เซ็ตฝึกจริง</span>
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-snug">
                  เซ็ตทำงานหลัก (Normal Working Set) ใช้วัดความก้าวหน้า Volume, 1RM และสถิติ PR จริงของคุณ
                </p>
              </div>

              <div className="rounded-xl p-2.5 bg-[#1A1D24] border border-[#FF4500]/25 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-[#FF4500]/20 text-[#FF4500] font-tech font-bold text-[11px]">
                    F1
                  </span>
                  <span className="text-xs font-bold text-[#FF6B35]">หมดแรง</span>
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-snug">
                  เซ็ตฝึกจริงที่ยกจนหมดแรง (Failure) นับรวมในเซ็ตฝึกจริงและช่วยบันทึกความเข้มข้น
                </p>
              </div>
            </div>
          </article>

          {/* Card 2: Strength Glossary (1RM, PR, Volume, BW) */}
          <article className="rounded-2xl p-4 bg-[#141720] border border-white/[0.07] space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FACC15]/16 text-[#FACC15] flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-tech font-bold text-[#FACC15] uppercase tracking-wider">
                  02 · STRENGTH METRICS
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC] leading-snug">
                  คำศัพท์วัดพลัง (1RM, PR, Volume, BW)
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="rounded-xl p-2.5 bg-[#1A1D24] space-y-1">
                <div className="text-xs font-bold text-[#F8FAFC]">
                  Est. 1RM <span className="text-[#FACC15] font-semibold">· พลังสูงสุด 1 ครั้ง</span>
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-snug">
                  ประมาณการน้ำหนักสูงสุดที่ยกได้ 1 ครั้งอย่างปลอดภัยโดยไม่ต้องลองยกเต็มแรง เช่น ยก 60 kg × 8 ครั้ง ≈ <strong className="text-[#E2E8F0]">Est. 1RM 76 kg</strong>
                </p>
              </div>

              <div className="rounded-xl p-2.5 bg-[#1A1D24] space-y-1">
                <div className="text-xs font-bold text-[#F8FAFC]">
                  PR <span className="text-[#FF6B35] font-semibold">· สถิติส่วนตัวสูงสุด</span>
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-snug">
                  Personal Record เมื่อคุณยกได้หนักขึ้นหรือจำนวนครั้งมากขึ้นจนค่า Est. 1RM ชนะสถิติเดิม แอปจะฉลอง <strong className="text-[#FACC15]">NEW PR!</strong> ทันที
                </p>
              </div>

              <div className="rounded-xl p-2.5 bg-[#1A1D24] space-y-1">
                <div className="text-xs font-bold text-[#F8FAFC]">
                  Volume (KG) <span className="text-[#FF6B35] font-semibold">· น้ำหนักยกรวมทั้งหมด</span>
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-snug">
                  คิดจาก <strong className="text-[#E2E8F0]">น้ำหนัก × จำนวนครั้ง</strong> ของทุกเซ็ตฝึกจริง เช่น 40 kg × 10 ครั้ง × 3 เซ็ต = <strong className="text-[#E2E8F0]">1,200 kg</strong>
                </p>
              </div>

              <div className="rounded-xl p-2.5 bg-[#1A1D24] space-y-1">
                <div className="text-xs font-bold text-[#F8FAFC]">
                  x BW <span className="text-[#38BDF8] font-semibold">· ความแข็งแรงเทียบน้ำหนักตัว</span>
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-snug">
                  เทียบพลัง 1RM กับน้ำหนักตัวคุณ เช่น หนัก 60 kg แต่ Squat 1RM ได้ 72 kg = <strong className="text-[#E2E8F0]">1.2x BW</strong>
                </p>
              </div>
            </div>
          </article>

          {/* Card 3: Body Scan & Exercise Form Demos */}
          <article className="rounded-2xl p-4 bg-[#141720] border border-white/[0.07] space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#38BDF8]/16 text-[#38BDF8] flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-tech font-bold text-[#38BDF8] uppercase tracking-wider">
                  03 · BODY SCAN &amp; FORM DEMOS
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC] leading-snug">
                  ดูท่าฝึก &amp; สแกนกล้ามเนื้อ (Body Scan &amp; วิธีฝึก)
                </h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1A1D24] text-[#F8FAFC]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF4500] shrink-0" />
                <span><strong>พร้อมฝึก (85–100%)</strong> ฟื้นตัวเต็มที่</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1A1D24] text-[#F8FAFC]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shrink-0" />
                <span><strong>กำลังฟื้นตัว (&lt;60%)</strong> ควรพักส่วนนี้</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1A1D24] text-[#F8FAFC]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] shrink-0" />
                <span><strong>ฝึกน้อย</strong> แนะนำเสริมให้ครบ 10 เซ็ต/สัปดาห์</span>
              </span>
            </div>

            <p className="text-xs text-[#CBD5E1] leading-relaxed flex items-start gap-2">
              <Play className="w-3.5 h-3.5 text-[#FACC15] shrink-0 mt-0.5 fill-current" />
              <span>
                กดปุ่ม <strong className="text-[#F8FAFC]">วิธีฝึก</strong> บนท่าไหนก็ได้เพื่อดูแอนิเมชันชีวกลศาสตร์ พร้อมปุ่ม{' '}
                <strong className="text-[#38BDF8]">0.5x สโลว์</strong> ดูจังหวะช้าลงครึ่งหนึ่ง และ{' '}
                <strong className="text-[#FACC15]">ค้างจุดสุด (Peak Hold)</strong> เพื่อหยุดเช็กมุมข้อต่อและจังหวะเกร็งกล้ามเนื้อ
              </span>
            </p>
          </article>

          {/* Card 4: Safe Demo Mode & Data Isolation */}
          <article className="rounded-2xl p-4 bg-[#141720] border border-white/[0.07] space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-tech font-bold text-emerald-400 uppercase tracking-wider">
                  04 · SAFE SANDBOX &amp; BACKUP
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC] leading-snug">
                  โหมดทดลอง (Demo &amp; ข้อมูล)
                </h3>
              </div>
            </div>

            <p className="text-xs text-[#CBD5E1] leading-relaxed">
              อยากลองดูกราฟพัฒนาการ 1RM, เรดาร์กล้ามเนื้อ 7 แกน และสถิติ PR ก่อนเริ่มฝึกจริง? แตะปุ่ม{' '}
              <strong className="text-[#F8FAFC]">Demo &amp; ข้อมูล</strong> ด้านบนเพื่อโหลดประวัติจำลอง 4 สัปดาห์มาทดสอบได้เลย
            </p>

            <div className="rounded-xl p-2.5 bg-emerald-500/[0.08] border border-emerald-500/20 flex items-start gap-2 text-[11px] text-[#CBD5E1] leading-snug">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                ข้อมูลจำลองจะติดป้าย <strong className="text-[#FACC15]">DEMO</strong> แยกจากบันทึกจริง 100% ไม่ลบหรือทับประวัติการฝึกจริงของคุณ และสามารถกด{' '}
                <strong className="text-[#F8FAFC]">ลบเฉพาะข้อมูลจำลอง</strong> ออกได้ทุกเมื่อ
              </span>
            </div>
          </article>
        </div>

        {/* Sticky Bottom Close Action */}
        <div className="shrink-0 px-4 sm:px-6 py-3 border-t border-white/[0.07] bg-[#0D1017]/95 flex items-center justify-end pb-safe">
          <button
            type="button"
            onClick={onClose}
            className="btn-tactile btn-volt active:scale-[0.98] transition-all w-full sm:w-auto h-10 px-6 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>เข้าใจแล้ว เริ่มใช้งานเลย</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
