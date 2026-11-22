import React, { useRef, useState } from 'react';
import {
  X,
  Download,
  Upload,
  Database,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { AppData } from '../types';
import { exportAppDataToJson, parseImportedAppData } from '../utils/storage';
import { isDemoWorkout } from '../utils/analytics';

interface DataModalProps {
  open: boolean;
  data: AppData;
  onClose: () => void;
  onLoadDemo: () => void;
  onImportData: (newData: AppData) => void;
  onClearDemoOnly: () => void;
  onClearAll: () => void;
}

export const DataModal: React.FC<DataModalProps> = ({
  open,
  data,
  onClose,
  onLoadDemo,
  onImportData,
  onClearDemoOnly,
  onClearAll,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!open) return null;

  const demoCount = data.history.filter((h) => isDemoWorkout(h)).length;
  const realCount = data.history.length - demoCount;
  const hasDemoProfile = Boolean(data.profile?.isDemo);
  const hasAnyDemoData = demoCount > 0 || hasDemoProfile;

  const handleClose = () => {
    setConfirmReset(false);
    setErrorMsg(null);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      const result = parseImportedAppData(text);
      if (result.ok) {
        onImportData(result.data);
        handleClose();
      } else {
        setErrorMsg(result.error);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.onerror = () => {
      setErrorMsg('เกิดข้อผิดพลาดในการอ่านไฟล์');
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#090A0D]/80 backdrop-blur-md p-0 sm:p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="data-modal-title"
    >
      <div
        className="w-full sm:max-w-md glass-card rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>

        {/* Clean Header */}
        <div className="flex items-start justify-between px-4 sm:px-6 pt-4 sm:pt-5 pb-3.5 sm:pb-4 border-b border-white/[0.06] shrink-0">
          <div>
            <div className="editorial-label">LOCAL STORAGE & BACKUP</div>
            <h2
              id="data-modal-title"
              className="font-display text-2xl sm:text-3xl tracking-wider text-[#F8FAFC] leading-none mt-1"
            >
              DEMO & DATA VAULT
            </h2>
            <p className="text-xs text-[#94A3B8] mt-1.5 tabular-nums whitespace-normal break-words leading-snug">
              {demoCount > 0
                ? `บันทึกจริง ${realCount} ครั้ง · ข้อมูลจำลอง ${demoCount} ครั้ง · ${data.customRoutines.length} ตารางส่วนตัว`
                : `บันทึกในเครื่องอัตโนมัติ · ${realCount} ครั้งฝึก · ${data.customRoutines.length} ตารางส่วนตัว`}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="ปิดหน้าต่าง"
            className="btn-tactile active:scale-[0.98] transition-all min-h-[44px] min-w-[44px] -mr-1 -mt-1 flex items-center justify-center rounded-xl bg-[#1A1D24] hover:bg-[#222630] text-[#94A3B8] hover:text-[#F8FAFC]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 pb-safe overflow-y-auto">
          {/* Demo Mode CTA strictly inside this menu */}
          <div className="p-5 rounded-2xl bg-[#1A1D24] space-y-3.5">
            <div>
              <div className="editorial-label !text-[#FF4500] mb-1">4-WEEK SAMPLE DATASET</div>
              <div className="text-sm font-bold text-[#F8FAFC]">
                ทดลองดูข้อมูลสถิติย้อนหลัง 4 สัปดาห์
              </div>
              <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
                สร้างบันทึกจำลอง 16 เซสชัน (ติดป้าย DEMO) ผสานรวมกับประวัติการฝึกจริงของคุณโดยไม่เขียนทับข้อมูลเดิม เพื่อทดสอบกราฟ 1RM, Relative Strength และสมดุลกล้ามเนื้อทันที
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onLoadDemo();
                handleClose();
              }}
              className="btn-tactile btn-volt active:scale-[0.98] transition-all w-full min-h-[46px] px-4 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 whitespace-normal text-center"
            >
              <Database className="w-4 h-4 shrink-0" />
              <span>โหลดข้อมูลจำลอง 4 สัปดาห์ (Load Demo Data)</span>
            </button>
          </div>

          {/* Export / Import */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => exportAppDataToJson(data)}
              className="btn-tactile active:scale-[0.98] transition-all min-h-[48px] px-3 py-2.5 rounded-xl bg-[#1A1D24] hover:bg-[#222630] text-[#F8FAFC] text-sm font-semibold flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-[#94A3B8]" />
              ส่งออก JSON
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-tactile active:scale-[0.98] transition-all min-h-[48px] px-3 py-2.5 rounded-xl bg-[#1A1D24] hover:bg-[#222630] text-[#F8FAFC] text-sm font-semibold flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Upload className="w-4 h-4 text-[#94A3B8]" />
              นำเข้า JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#1A1D24] ring-1 ring-[#FACC15]/40 text-xs text-[#F8FAFC]">
              <AlertCircle className="w-4 h-4 text-[#FACC15] shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Split Reset Controls: Button 1 (Clear Demo Only) & Button 2 (Reset All Data) */}
          <div className="pt-4 border-t border-white/[0.06] space-y-2.5">
            {/* Button 1: Clear Demo Only (Safe, Non-Destructive) */}
            <button
              type="button"
              disabled={!hasAnyDemoData}
              onClick={() => {
                onClearDemoOnly();
                handleClose();
              }}
              className={`btn-tactile active:scale-[0.98] transition-all w-full min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 ${
                hasAnyDemoData
                  ? 'bg-[#1A1D24] hover:bg-[#222630] text-[#F8FAFC] ring-1 ring-[#FACC15]/30'
                  : 'bg-[#1A1D24]/60 text-[#64748B] cursor-not-allowed'
              }`}
            >
              <Sparkles
                className={`w-4 h-4 shrink-0 ${hasAnyDemoData ? 'text-[#FACC15]' : 'text-[#475569]'}`}
              />
              <span className="whitespace-normal break-words leading-snug text-center">
                {demoCount > 0
                  ? `ลบเฉพาะข้อมูลจำลอง (${demoCount} เซสชัน)`
                  : 'ลบเฉพาะข้อมูลจำลอง (Clear Demo Only)'}
              </span>
            </button>

            {/* Button 2: Reset All Data (Danger button with confirmation step) */}
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="btn-tactile active:scale-[0.98] transition-all w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#2A1215]/70 hover:bg-[#3A161B] text-[#FCA5A5] hover:text-white ring-1 ring-[#EF4444]/35 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4 text-[#EF4444] shrink-0" />
                <span className="whitespace-normal break-words leading-snug text-center">
                  ล้างข้อมูลทั้งหมด (Reset All Data)
                </span>
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-[#1A1D24] ring-1 ring-[#EF4444]/40 space-y-3">
                <div className="space-y-1 text-center">
                  <div className="text-xs font-bold text-[#FCA5A5] inline-flex items-center justify-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-[#EF4444] shrink-0" />
                    <span>ยืนยันการล้างข้อมูลจริงทั้งหมด</span>
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    การดำเนินการนี้จะลบทั้งประวัติการฝึกจริง ({realCount} เซสชัน), ข้อมูลจำลอง, ตารางส่วนตัว และโปรไฟล์กลับเป็น 0 ทั้งหมด
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="btn-tactile active:scale-[0.98] transition-all min-h-[40px] rounded-xl bg-[#12141A] hover:bg-[#090A0D] text-xs font-semibold text-[#F8FAFC]"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClearAll();
                      handleClose();
                    }}
                    className="btn-tactile active:scale-[0.98] transition-all min-h-[40px] px-2 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="whitespace-normal leading-tight text-center">
                      ยืนยันการล้างข้อมูลจริงทั้งหมด
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
