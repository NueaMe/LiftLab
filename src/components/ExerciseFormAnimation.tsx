import React, { useEffect, useId, useState } from 'react';
import { Compass, Eye, Gauge, Hand, Lock, Pause, Play, Unlock } from 'lucide-react';
import { AthleteGender, Exercise, MotionType } from '../types';

interface ExerciseFormAnimationProps {
  exercise: Exercise;
  gender?: AthleteGender;
  className?: string;
}

type TempoPhase = 'concentric' | 'peak' | 'eccentric';
type MuscleRole = 'none' | 'primary' | 'secondary';
type CameraView = 'front' | 'side' | 'three-quarter' | 'top-down';

interface ExerciseBiomechanicalSpec {
  camera: CameraView;
  cameraLabelTh: string;
  alignmentCueTh: string;
  gripBadgeTh: string;
  secondaryMusclesTh: string;
  concentricCueTh: string;
  peakCueTh: string;
  eccentricCueTh: string;
}

const DEFAULT_META_BY_MOTION: Record<MotionType, { concentric: string; peak: string; eccentric: string }> = {
  'flat-press': {
    concentric: 'ดันบาร์ขึ้นเป็นแนวโค้งเล็กน้อยกลับเหนือหัวไหล่',
    peak: 'บีบหน้าอกเต็มที่ · แขนเหยียดมั่นคงไม่กระแทกศอก',
    eccentric: 'ผ่อนบาร์ลงช้าๆ คุมแนวศอกทำมุม ~45° แตะอกกลาง',
  },
  'incline-press': {
    concentric: 'ดันดัมเบลขึ้นตรงเหนืออกบนพร้อมคุมข้อมือตรง',
    peak: 'เกร็งบีบอกบนค้างไว้ · สะบักแนบเบาะเอียง 35° นิ่ง',
    eccentric: 'ลดดัมเบลลงช้าๆ ข้างอกบน · ข้อมือตรงเหนือข้อศอก',
  },
  'cable-fly': {
    concentric: 'วาดแขนเป็นแนวโค้งกว้างเข้าหากันด้านหน้าอก',
    peak: 'ฝ่ามือชิดด้านหน้ากลางอก · เกร็งบีบอกค้าง 1 วินาที',
    eccentric: 'ผ่อนแขนเปิดกว้างช้าๆ รักษามุมข้อศอกงอเล็กน้อยคงที่',
  },
  dip: {
    concentric: 'ออกแรงดันตัวขึ้นโดยคงมุมลำตัวโน้มหน้า ~25°',
    peak: 'บีบอกล่างและหลังแขนสุดระยะ · กดหัวไหล่ต่ำห่างหู',
    eccentric: 'ลดตัวลงช้าๆ ควบคุมจนหัวไหล่อยู่ใกล้ระดับข้อศอก',
  },
  pulldown: {
    concentric: 'กดสะบักลงแล้วดึงบาร์ลงหน้าอกบนพร้อมเอนตัวเล็กน้อย',
    peak: 'เกร็งบีบปีกและสะบักค้างไว้ · อกเปิดแนวหลังตรง',
    eccentric: 'คลายแขนขึ้นช้าๆ ยืดปีกสุดระยะโดยไม่ห่อไหล่',
  },
  'seated-row': {
    concentric: 'ดึงข้อศอกไปด้านหลังเลยแนวลำตัว · หลังตั้งตรงนิ่ง',
    peak: 'บีบสะบักเข้าหากันเต็มที่ค้างไว้ · ไม่เอนตัวโยกช่วย',
    eccentric: 'ผ่อนแขนกลับไปด้านหน้าช้าๆ คุมแรงตึงเคเบิลต่อเนื่อง',
  },
  'bent-row': {
    concentric: 'ดึงบาร์เข้าหาสะดือ · ศอกดึงเลยแนวลำตัวด้านหลัง',
    peak: 'บีบหลังบนและสะบักค้างไว้ · รักษาแนวหลังตรง 45°',
    eccentric: 'ลดบาร์ลงช้าๆ จนแขนเหยียดโดยไม่ให้หลังล่างโค้ง',
  },
  'overhead-press': {
    concentric: 'ดันบาร์ผ่านหน้าตรงขึ้นเหนือศีรษะ · เกร็งแกนกลางนิ่ง',
    peak: 'บาร์ล็อกตรงแนวใบหู · ไหล่และแกนกลางมั่นคง',
    eccentric: 'ลดบาร์ผ่านหน้าลงช้าๆ กลับมาพักระดับไหปลาร้า',
  },
  'lateral-raise': {
    concentric: 'กางแขนโค้งออกด้านข้างนำด้วยข้อศอกถึงระดับไหล่',
    peak: 'เกร็งไหล่ค้างขนานพื้น · เอียงนิ้วก้อยขึ้นเล็กน้อยไม่ยักบ่า',
    eccentric: 'ลดดัมเบลลงช้าๆ ต้านแรงโน้มถ่วงจนเกือบชิดลำตัว',
  },
  squat: {
    concentric: 'ถีบพื้นเต็มฝ่าเท้าดันตัวขึ้นตรงแนว · อกเปิดหลังตรง',
    peak: 'เกร็งหน้าขาและก้นเต็มที่ · คุมแนวเข่าตรงปลายเท้า',
    eccentric: 'ย่อสะโพกและเข่าลงช้าๆ ควบคุมจังหวะจนต้นขาขนานพื้น',
  },
  hinge: {
    concentric: 'ดันสะโพกและออกแรงจากข้อสะโพกชัดเจน · แนวหลังตรง',
    peak: 'เกร็งบีบหลังขาและก้นค้างไว้ · ไม่แอ่นหลังส่วนล่าง',
    eccentric: 'ผ่อนพับสะโพกช้าๆ คุมแรงตึงตลอดแนวหลังขาและสะโพก',
  },
  'leg-curl-ext': {
    concentric: 'พับข้อเข่าดึงเบาะรองข้อเท้าขึ้นหาสะโพกอย่างมั่นคง',
    peak: 'เกร็งหลังขาค้างจุดสูงสุด · กดสะโพกแนบติดเบาะไม่เด้ง',
    eccentric: 'คลายขาลงช้าๆ คุมแรงตึงต่อเนื่องก่อนเหยียดเกือบสุด',
  },
  'bicep-curl': {
    concentric: 'ล็อกต้นแขนนิ่งข้างลำตัว แล้วพับเฉพาะข้อศอกยกขึ้น',
    peak: 'เกร็งบีบหน้าแขนค้างจุดสูงสุด · ลำตัวตรงไม่โยกหลังช่วย',
    eccentric: 'ผ่อนน้ำหนักลงช้าๆ จนกล้ามเนื้อหน้าแขนยืดสุดระยะ',
  },
  'hammer-curl': {
    concentric: 'ล็อกต้นแขนดิ่งนิ่งข้างตัว แล้วพับเฉพาะปลายแขนขึ้น 0°→130° แนวจับค้อน',
    peak: 'เกร็งบีบหน้าแขนและกล้ามเนื้อ Brachialis เต็มที่ · นิ้วโป้งชี้ขึ้นด้านบน',
    eccentric: 'ผ่อนดัมเบลลงช้าๆ กลับข้างต้นขา (0°) โดยไม่ขยับข้อศอก',
  },
  'tricep-ext': {
    concentric: 'ตรึงข้อศอกให้นิ่งแล้วเหยียดปลายแขนต้านแรงจนสุด',
    peak: 'เกร็งบีบหลังแขนค้างจุดเหยียดสุด · หัวไหล่ไม่ขยับตาม',
    eccentric: 'ผ่อนปลายแขนกลับช้าๆ ควบคุมแรงตึงตลอดช่วงงอศอก',
  },
  'cable-crunch': {
    concentric: 'หายใจออกพร้อมม้วนกระดูกสันหลังส่วนบนลงหาต้นขา · ล็อกสะโพกนิ่ง',
    peak: 'เกร็งบีบหน้าท้องบนค้าง 1 วินาที · ศอกกดลงใกล้เข่าโดยไม่ดึงด้วยแขน',
    eccentric: 'ผ่อนตัวกลับขึ้นช้าๆ ยืดกล้ามเนื้อหน้าท้องให้สุดระยะอย่างควบคุม',
  },
  'leg-raise': {
    concentric: 'เกร็งหน้าท้องล่างแล้วม้วนกระดูกเชิงกรานยกขาขึ้นเหนือแนวขนานพื้น',
    peak: 'ค้างจุดสูงสุดพร้อมม้วนสะโพกเข้าหาซี่โครง · ไม่เหวี่ยงลำตัวช่วย',
    eccentric: 'ลดขาลงช้าๆ คุมแรงต้านตลอดทางเพื่อไม่ให้หลังล่างแอ่นหรือแกว่ง',
  },
  'ab-rollout': {
    concentric: 'เกร็งหน้าท้องและขมิบก้น ลำตัวตรงเป็นเส้นเดียวแล้วค่อยๆ กลิ้งล้อไปข้างหน้า',
    peak: 'ค้างจุดยืดสุดโดยหลังส่วนล่างไม่แอ่น · คุมแรงตึงทั่วแกนกลางลำตัว',
    eccentric: 'ออกแรงดึงจากหน้าท้องและปีกพาล้อกลิ้งกลับเข้าหาเข่าอย่างมั่นคง',
  },
  'russian-twist': {
    concentric: 'เอนตัว ~45° หลังตรง แล้วบิดหัวไหล่และลำตัวข้ามแกนกลางอย่างช้าๆ',
    peak: 'เกร็งบีบกล้ามเนื้อข้างลำตัว (Obliques) สุดระยะ · สายตามองตามมือ',
    eccentric: 'หมุนลำตัวสลับกลับมาอีกด้านอย่างควบคุม ไม่ใช้แรงเหวี่ยงจากแขนอย่างเดียว',
  },
  plank: {
    concentric: 'ตั้งศอกตรงใต้หัวไหล่ ม้วนก้นเก็บเข้าเล็กน้อยแล้วเกร็งหน้าท้องรอบด้าน',
    peak: 'รักษาแนว ศีรษะ-ไหล่-สะโพก-ข้อเท้า เป็นเส้นตรงนิ่ง · หายใจสม่ำเสมอ',
    eccentric: 'คุมแรงเกร็งต้านแรงโน้มถ่วงต่อเนื่อง ไม่ปล่อยให้เอวแอ่นหรือสะโพกโด่ง',
  },
  'push-up': {
    concentric: 'ดันพื้นเหยียดแขนขึ้นพร้อมกัน · เกร็งแกนกลางให้ลำตัวตรงเป็นเส้นเดียว',
    peak: 'บีบหน้าอกเต็มที่ที่จุดสูงสุด · กดสะบักมั่นคงไม่ปล่อยเอวแอ่น',
    eccentric: 'ค่อยๆ ลดหน้าอกลงเกือบแตะพื้น · คุมข้อศอกทำมุม ~45° ข้างลำตัว',
  },
  'incline-push-up': {
    concentric: 'ดันตัวขึ้นจากขอบม้านั่งด้วยแรงหน้าอกและหลังแขน · ลำตัวตรงนิ่ง',
    peak: 'บีบอกล่างและอกกลางค้างไว้ · หัวไหล่ห่างใบหูไม่ยักบ่า',
    eccentric: 'ลดหน้าอกลงช้าๆ แตะใกล้ขอบม้านั่ง · คุมศอกกางประมาณ 45°',
  },
  'pike-push-up': {
    concentric: 'ออกแรงไหล่หน้าดันตัวกลับขึ้นสู่ท่าตัว V คว่ำ · รักษาสะโพกสูงคงที่',
    peak: 'แขนเหยียดมั่นคงแนวใบหู · เกร็งไหล่และหลังแขนเต็มระยะ',
    eccentric: 'โน้มศีรษะลงช้าๆ ด้านหน้าแนวฝ่ามือ (รูปสามเหลี่ยม) · ศอกไม่แบะออกข้าง',
  },
  'inverted-row': {
    concentric: 'กดสะบักลงแล้วดึงหน้าอกขึ้นหาบาร์ · รักษาลำตัวตรงตั้งแต่ไหล่ถึงส้นเท้า',
    peak: 'บีบหลังบนและสะบักเข้าหากันค้างไว้ที่จุดสูงสุด · อกใกล้แตะบาร์',
    eccentric: 'ผ่อนตัวลงช้าๆ จนแขนเหยียดตรงสุดระยะ · ไม่ปล่อยสะโพกห้อยตก',
  },
  lunge: {
    concentric: 'ถีบพื้นเต็มฝ่าเท้าหน้าดันตัวกลับขึ้นยืนตรงอย่างมั่นคง · หลังตรง',
    peak: 'เกร็งหน้าขาและก้นเต็มที่ที่จุดยืนตรง · ทรงตัวนิ่งไม่เซ',
    eccentric: 'ก้าวขาหนึ่งไปด้านหลังแล้วย่อเข่าลง 90°/90° ช้าๆ · เข่าหลังเกือบแตะพื้น',
  },
  'glute-bridge': {
    concentric: 'กดส้นเท้าแน่นแล้วดันสะโพกขึ้นตรงแนวด้วยแรงบีบก้นเต็มที่',
    peak: 'ค้างจุดสูงสุดให้ ไหล่-สะโพก-เข่า เป็นเส้นตรง · บีบก้นแน่นไม่แอ่นหลังล่าง',
    eccentric: 'ผ่อนสะโพกลงช้าๆ ควบคุมจังหวะจนเกือบแตะเสื่อแล้วเริ่มรอบถัดไป',
  },
  'basic-crunch': {
    concentric: 'หายใจออกพร้อมม้วนกระดูกสันหลังส่วนบนยกสะบักพ้นเสื่อ ~35°',
    peak: 'เกร็งบีบหน้าท้องบนค้าง 1 วินาที · หลังล่างแนบติดพื้นไม่กระชากต้นคอ',
    eccentric: 'คลายหลังบนลงช้าๆ คุมแรงตึงหน้าท้องต่อเนื่องก่อนเริ่มครั้งถัดไป',
  },
  'hip-thrust': {
    concentric: 'กดส้นเท้าแน่นแล้วดันสะโพกพร้อมบาร์ขึ้นจนลำตัวขนานพื้น · เก็บคางมองตรง',
    peak: 'เกร็งบีบก้นเต็มที่ค้าง 1 วินาที · หน้าแข้งตั้งฉากพื้น 90° ไม่แอ่นหลังล่าง',
    eccentric: 'ผ่อนสะโพกลงช้าๆ ควบคุมบาร์บนแนวสะโพกโดยให้ซี่โครงเก็บตรงตลอดช่วง',
  },
  'split-squat': {
    concentric: 'ถีบพื้นเต็มฝ่าเท้าหน้าดันตัวขึ้นตรงแนว · โน้มตัวหน้าเล็กน้อยเน้นแรงจากก้น',
    peak: 'ยืนขึ้นจนขาหน้าเกือบเหยียดตรง · เกร็งบีบก้นข้างหน้าโดยไม่ล็อกเข่ากระแทก',
    eccentric: 'ย่อสะโพกลงเฉียงหลังช้าๆ คุมเข่าหน้าตรงแนวปลายเท้าและหลังตรงนิ่ง',
  },
  'glute-kickback': {
    concentric: 'เกร็งก้นแล้วเตะส้นเท้าไปด้านหลังตามแนวสายเคเบิล · ล็อกหลังล่างนิ่งไม่แอ่น',
    peak: 'ค้างจุดสูงสุดพร้อมบีบก้นเต็มที่ 1 วินาที · ขาเหยียดเกือบตรงไม่บิดสะโพก',
    eccentric: 'ผ่อนขากลับลงช้าๆ ต้านแรงดึงเคเบิลต่อเนื่องโดยไม่ใช้แรงเหวี่ยงช่วย',
  },
  'hip-abduction': {
    concentric: 'ออกแรงจากก้นด้านข้างดันเบาะแยกเข่าออกกว้างอย่างมั่นคง · หลังตรงแนบพนัก',
    peak: 'ค้างจุดกางกว้างสุด 1 วินาที · รู้สึกตึงชัดที่ก้นบนและต้นขาด้านข้าง',
    eccentric: 'ผ่อนเข่าหุบกลับเข้าหากันช้าๆ คุมแผ่นน้ำหนักไม่ให้กระแทกกัน',
  },
};

function getExerciseSpec(exercise: Exercise): ExerciseBiomechanicalSpec {
  const fallback = DEFAULT_META_BY_MOTION[exercise.motionType];
  const base = {
    concentricCueTh: fallback.concentric,
    peakCueTh: fallback.peak,
    eccentricCueTh: fallback.eccentric,
  };

  switch (exercise.id) {
    case 'barbell-bench-press':
      return {
        ...base,
        camera: 'side',
        cameraLabelTh: 'มุมข้าง · เบาะราบ 0°',
        alignmentCueTh: 'เบาะราบ 0° · บาร์ลงแตะอกกลาง ศอก 45°',
        gripBadgeTh: 'จับคว่ำมือ · ศอกทำมุม 45° · เท้าวางราบพื้น',
        secondaryMusclesTh: 'ไหล่หน้า · หลังแขน',
      };
    case 'incline-dumbbell-press':
      return {
        ...base,
        camera: 'side',
        cameraLabelTh: 'มุมข้าง · เบาะเอียง 35°',
        alignmentCueTh: 'เบาะเอียง 35° · ดันขึ้นตรงเหนืออกบน',
        gripBadgeTh: 'จับคว่ำเฉียง 45° · ดัมเบลขนานอกบน',
        secondaryMusclesTh: 'ไหล่หน้า · หลังแขน',
      };
    case 'cable-chest-fly':
      return {
        ...base,
        camera: 'top-down',
        cameraLabelTh: 'มุมสูง 3/4 · Top-Down Arc',
        alignmentCueTh: 'วาดแขนโค้งเข้าหากลางอก · ศอกงอคงที่',
        gripBadgeTh: 'จับหันฝ่ามือเข้าหากัน (Neutral) · ศอกงอคงที่',
        secondaryMusclesTh: 'ไหล่หน้า · แกนกลาง',
      };
    case 'chest-dip':
      return {
        ...base,
        camera: 'side',
        cameraLabelTh: 'มุมข้าง · บาร์คู่ขนาน',
        alignmentCueTh: 'โน้มตัว 25° · งอศอกไปด้านหลังไม่ห่อไหล่',
        gripBadgeTh: 'จับบาร์คู่ Neutral · ลำตัวโน้มหน้า 25°',
        secondaryMusclesTh: 'หลังแขน · ไหล่หน้า',
      };
    case 'close-grip-bench-press':
      return {
        ...base,
        camera: 'side',
        cameraLabelTh: 'มุมข้าง · เบาะราบ 0°',
        alignmentCueTh: 'เบาะราบ 0° · เก็บศอกชิดลำตัวลงอกล่าง',
        gripBadgeTh: 'จับคว่ำมือกว้างเท่าไหล่ · เก็บศอกแนบตัว',
        secondaryMusclesTh: 'อกกลาง · ไหล่หน้า',
        concentricCueTh: 'ออกแรงหลังแขนดันบาร์ขึ้นตรงๆ โดยเก็บศอกชิดลำตัว',
        peakCueTh: 'เกร็งบีบหลังแขนมัดในสุดระยะ · ข้อมือตรงมั่นคง',
        eccentricCueTh: 'ลดบาร์ลงช้าๆ แตะบริเวณอกล่าง · ศอกไม่กางออก',
      };
    case 'lat-pulldown':
      return {
        ...base,
        camera: 'three-quarter',
        cameraLabelTh: 'มุมข้าง-เฉียง 3/4 · Side-3/4',
        alignmentCueTh: 'เอนหลัง 15° ล็อกหน้าขาใต้เบาะ · ดึงบาร์หน้าใบหน้าลงอกบน ศอกกดลงหลัง',
        gripBadgeTh: 'จับคว่ำมือกว้างกว่าไหล่ · ล็อกหน้าขาใต้เบาะ',
        secondaryMusclesTh: 'หน้าแขน · หลังบน',
      };
    case 'pull-up':
      return {
        ...base,
        camera: 'three-quarter',
        cameraLabelTh: 'มุมข้าง-เฉียง 3/4 · Side-3/4',
        alignmentCueTh: 'ดึงตัวขึ้นพร้อมเชิดอกเล็กน้อย · คางพ้นด้านหลังและเหนือบาร์ชัดเจน',
        gripBadgeTh: 'จับคว่ำมือกว้างกว่าไหล่ · เก็บข้อเท้ามั่นคง',
        secondaryMusclesTh: 'หน้าแขน · หลังบน · แกนกลาง',
        concentricCueTh: 'กดสะบักเชิดอกแล้วดึงศอกลงข้างลำตัวจนคางพ้นหลัง-เหนือบาร์',
        peakCueTh: 'เกร็งบีบปีกค้างด้านบน · อกเชิด คางพ้นเหนือบาร์ไม่ชนศีรษะ',
        eccentricCueTh: 'ลดตัวลงช้าๆ คุมจังหวะจนแขนเหยียดสุดและปีกยืดเต็มที่',
      };
    case 'barbell-bent-over-row':
      return {
        ...base,
        camera: 'side',
        cameraLabelTh: 'มุมข้าง · พับสะโพก 45°',
        alignmentCueTh: 'หลังตรง 45° · ดึงศอกเลยแนวลำตัว',
        gripBadgeTh: 'จับคว่ำมือ (Pronated) · ดึงเข้าหาสะดือ',
        secondaryMusclesTh: 'ปีก · หน้าแขน · หลังล่าง',
      };
    case 'seated-cable-row':
      return {
        ...base,
        camera: 'side',
        cameraLabelTh: 'มุมข้าง · Side Profile',
        alignmentCueTh: 'หลังตั้งตรงนิ่ง · ดึงศอกแนบตัวเลยหลัง',
        gripBadgeTh: 'จับหันฝ่ามือเข้าหากัน (Neutral V-Bar)',
        secondaryMusclesTh: 'ปีก · หน้าแขน · ไหล่หลัง',
      };
    case 'back-extension':
      return {
        ...base,
        camera: 'side',
        cameraLabelTh: 'มุมข้าง · Roman Chair 45°',
        alignmentCueTh: 'เหยียดตัวตรงแนวขา · ไม่แอ่นหลังล่าง',
        gripBadgeTh: 'กอดอกประสานมือ · เกร็งแกนกลางและก้น',
        secondaryMusclesTh: 'ก้น · หลังขา',
      };
    case 'overhead-press':
      return {
        ...base,
        camera: 'side',
        cameraLabelTh: 'มุมข้าง · Side Profile',
        alignmentCueTh: 'บาร์ขึ้นผ่านหน้า · ล็อกตรงแนวใบหู',
        gripBadgeTh: 'จับคว่ำมือกว้างกว่าไหล่ · ศอกชี้หน้าเล็กน้อย',
        secondaryMusclesTh: 'หลังแขน · แกนกลาง',
      };
    case 'dumbbell-lateral-raise':
      return {
        ...base,
        camera: 'front',
        cameraLabelTh: 'มุมหน้า · Front View',
        alignmentCueTh: 'กางแขนออกข้างถึงระดับไหล่ · ศอกนำ',
        gripBadgeTh: 'จับคว่ำมือ · เอียงนิ้วก้อยขึ้นเล็กน้อย (15°)',
        secondaryMusclesTh: 'บ่าบน · ไหล่หน้า',
      };
    case 'face-pull':
      return {
        ...base,
        camera: 'side',
        cameraLabelTh: 'มุมข้าง · Side Profile',
        alignmentCueTh: 'ดึงเข้าหาหน้าผาก · ศอกสูงระดับไหล่',
        gripBadgeTh: 'จับเชือกนิ้วโป้งชี้เข้าตัว · หมุนปลายแขนออก',
        secondaryMusclesTh: 'หลังบน · หน้าแขน',
        concentricCueTh: 'ดึงเชือกเข้าหาหน้าผากพร้อมแยกมือและหมุนปลายแขนขึ้น',
        peakCueTh: 'เกร็งบีบไหล่หลังและสะบักค้างไว้ · ศอกสูงระดับไหล่',
        eccentricCueTh: 'ผ่อนแขนกลับไปด้านหน้าช้าๆ รักษาแนวลำตัวตั้งตรงนิ่ง',
      };
    case 'rear-delt-dumbbell-fly':
      return {
        ...base,
        camera: 'front',
        cameraLabelTh: 'มุมหน้า 3/4 · Hinged Front',
        alignmentCueTh: 'พับตัวหลังตรงนิ่ง · กวาดแขนออกข้างกว้าง',
        gripBadgeTh: 'จับหันฝ่ามือเข้าหากัน (Neutral) · กางแขนกว้าง',
        secondaryMusclesTh: 'หลังบน · หลังล่าง',
        concentricCueTh: 'กวาดดัมเบลออกด้านข้างเป็นแนวโค้งกว้างจากไหล่หลัง',
        peakCueTh: 'แขนกางขนานพื้น · เกร็งบีบไหล่หลังค้างไม่กระตุกหลัง',
        eccentricCueTh: 'ลดดัมเบลลงช้าๆ กลับใต้หัวไหล่โดยคงมุมลำตัวนิ่ง',
      };
    case 'barbell-back-squat':
      return {
        ...base,
        camera: 'side',
        cameraLabelTh: 'มุมข้าง · Side Profile',
        alignmentCueTh: 'บาร์ดิ่งตรงกลางฝ่าเท้า · ต้นขาขนานพื้น',
        gripBadgeTh: 'วางบาร์บนบ่า (High Bar) · ส้นเท้าติดพื้นตลอด',
        secondaryMusclesTh: 'ก้น · หลังขา · แกนกลาง',
      };
    case 'leg-press':
      return {
        ...base,
        camera: 'side',
        cameraLabelTh: 'มุมข้าง · เครื่อง 45°',
        alignmentCueTh: 'งอเข่าเข้าหาอก · หลังล่างแนบเบาะไม่ล็อกเข่า',
        gripBadgeTh: 'วางเท้าเต็มแป้นกว้างเท่าไหล่ · ถีบเต็มฝ่าเท้า',
        secondaryMusclesTh: 'ก้น · หลังขา',
      };
    case 'romanian-deadlift':
      return {
        ...base,
        camera: 'side',
        cameraLabelTh: 'มุมข้าง · Side Profile',
        alignmentCueTh: 'ดันสะโพกไปหลัง · รูดบาร์ชิดหน้าแข้ง',
        gripBadgeTh: 'จับคว่ำมือ (Double Overhand) · เข่างอน้อยคงที่',
        secondaryMusclesTh: 'ก้น · หลังล่าง',
      };
    case 'lying-leg-curl':
      return {
        ...base,
        camera: 'side',
        cameraLabelTh: 'มุมข้าง · Side Profile',
        alignmentCueTh: 'กดสะโพกแนบเบาะ · พับส้นเท้าเข้าหาก้น',
        gripBadgeTh: 'จัดหัวเข่าตรงแกนหมุน · แป้นรองเหนือข้อเท้า',
        secondaryMusclesTh: 'น่อง · ก้น',
      };
    case 'barbell-hip-thrust':
      return {
        ...base,
        camera: 'side',
        cameraLabelTh: 'มุมข้าง · Side-3/4 Hip Thrust',
        alignmentCueTh: 'ดันสะโพกขนานพื้น · หน้าแข้งตั้งฉาก 90° เก็บคาง',
        gripBadgeTh: 'ประคองบาร์พร้อมแผ่นรองเหนือสะโพก · กดส้นเท้าแน่น',
        secondaryMusclesTh: 'หลังขา · หน้าขา · แกนกลาง',
      };
    case 'bulgarian-split-squat':
      return {
        ...base,
        camera: 'three-quarter',
        cameraLabelTh: 'มุมข้าง-เฉียง 3/4 · Split Squat',
        alignmentCueTh: 'เท้าหลังพาดม้านั่ง · โน้มตัวหน้า ~15° ย่อสะโพกตรง',
        gripBadgeTh: 'ถือดัมเบล 2 ข้างลำตัว · ลงน้ำหนักเต็มฝ่าเท้าหน้า',
        secondaryMusclesTh: 'หน้าขา · หลังขา · แกนกลาง',
      };
    case 'cable-glute-kickback':
      return {
        ...base,
        camera: 'three-quarter',
        cameraLabelTh: 'มุมข้าง-เฉียง 3/4 · Low Cable',
        alignmentCueTh: 'โน้มตัว 20° จับเสามั่นคง · เตะส้นเท้าตรงหลังไม่แอ่นเอว',
        gripBadgeTh: 'รัดสายข้อเท้า (Ankle Strap) · ขาหลักงอเข่าเล็กน้อย',
        secondaryMusclesTh: 'หลังขา · แกนกลาง',
      };
    case 'seated-hip-abduction':
      return {
        ...base,
        camera: 'front',
        cameraLabelTh: 'มุมหน้า 3/4 · Abduction Machine',
        alignmentCueTh: 'หลังตรงหรือโน้มหน้าเล็กน้อย · ดันเข่าแยกกว้างคุมจังหวะ',
        gripBadgeTh: 'จับมือจับข้างเบาะมั่นคง · ต้นขาด้านนอกแนบแป้นรอง',
        secondaryMusclesTh: 'ต้นขาด้านข้าง · ก้นบน (Glute Medius)',
      };
    case 'standing-calf-raise':
      return {
        ...base,
        camera: 'side',
        cameraLabelTh: 'มุมข้าง · Side Profile',
        alignmentCueTh: 'จมูกเท้ากดแท่นนิ่ง · หย่อนส้นสุดแล้วเขย่ง',
        gripBadgeTh: 'วางจมูกเท้าบนแท่น · เข่าเกือบตรงคงที่',
        secondaryMusclesTh: 'หน้าขา · แกนกลาง',
        concentricCueTh: 'เขย่งปลายเท้าดันตัวขึ้นสูงสุดอย่างควบคุม',
        peakCueTh: 'เกร็งบีบน่องค้างจุดสูงสุด 1 วินาที · ไม่เด้งข้อเท้า',
        eccentricCueTh: 'หย่อนส้นเท้าลงช้าๆ จนกล้ามเนื้อน่องยืดตึงเต็มระยะ',
      };
    case 'barbell-bicep-curl':
      return {
        ...base,
        camera: 'front',
        cameraLabelTh: 'มุมหน้า · Front View',
        alignmentCueTh: 'ล็อกต้นแขนนิ่งข้างตัว · พับเฉพาะข้อศอก',
        gripBadgeTh: 'จับหงายมือ (Supinated) · กว้างเท่าไหล่',
        secondaryMusclesTh: 'ปลายแขน · ไหล่หน้า',
      };
    case 'hammer-curl':
      return {
        ...base,
        camera: 'three-quarter',
        cameraLabelTh: 'มุมข้าง-เฉียง 3/4 · Side-3/4',
        alignmentCueTh: 'ต้นแขนดิ่งนิ่ง · พับศอก 0°→130° จับค้อน',
        gripBadgeTh: 'จับค้อน Neutral (นิ้วโป้งชี้ขึ้น) · ศอกล็อกนิ่งข้างลำตัว',
        secondaryMusclesTh: 'แขนท่อนล่าง (Brachioradialis) · ไหล่หน้า',
      };
    case 'incline-dumbbell-curl':
      return {
        ...base,
        camera: 'side',
        cameraLabelTh: 'มุมข้าง · เบาะเอียง 55°',
        alignmentCueTh: 'ต้นแขนทิ้งหลังตัวนิ่ง · พับเฉพาะข้อศอก',
        gripBadgeTh: 'จับหงายมือ (Supinated) · ยืดหน้าแขนสุดระยะ',
        secondaryMusclesTh: 'ปลายแขน · ไหล่หน้า',
      };
    case 'preacher-curl':
      return {
        ...base,
        camera: 'side',
        cameraLabelTh: 'มุมข้าง · แท่นเบาะเอียง',
        alignmentCueTh: 'ต้นแขนวางแนบเบาะเอียงนิ่ง · พับเฉพาะปลายแขนกับบาร์ EZ ขึ้น',
        gripBadgeTh: 'จับบาร์ EZ หงายมือ · ล็อกข้อศอกนิ่งบนเบาะ',
        secondaryMusclesTh: 'ปลายแขน',
      };
    case 'tricep-rope-pushdown':
      return {
        ...base,
        camera: 'side',
        cameraLabelTh: 'มุมข้าง · Side Profile',
        alignmentCueTh: 'หนีบศอกแนบตัวนิ่ง · กดปลายแขนลงเหยียดสุด',
        gripBadgeTh: 'จับเชือก Neutral · แหวกปลายเชือกตอนเหยียดสุด',
        secondaryMusclesTh: 'แกนกลาง · ไหล่',
      };
    case 'overhead-dumbbell-extension':
      return {
        ...base,
        camera: 'side',
        cameraLabelTh: 'มุมข้าง · Side Profile',
        alignmentCueTh: 'ล็อกต้นแขนชิดหู · เหยียดศอกขึ้นตรงเหนือหัว',
        gripBadgeTh: 'สองมือประคองจานดัมเบล · บีบศอกชี้หน้า',
        secondaryMusclesTh: 'ไหล่ · แกนกลาง',
      };
    case 'skull-crusher':
      return {
        ...base,
        camera: 'side',
        cameraLabelTh: 'มุมข้าง · เบาะราบ 0°',
        alignmentCueTh: 'ล็อกต้นแขนเอียง 15° · งอ-เหยียดเฉพาะศอก',
        gripBadgeTh: 'จับคว่ำมือแคบกว่าไหล่ · ลดบาร์หลังหน้าผาก',
        secondaryMusclesTh: 'ไหล่ · แกนกลาง',
      };
    case 'cable-crunch':
      return {
        ...base,
        camera: 'side',
        cameraLabelTh: 'มุมข้าง · Side Profile',
        alignmentCueTh: 'ล็อกสะโพกเหนือเข่านิ่ง · ม้วนสันหลังลงรูปตัว C',
        gripBadgeTh: 'จับเชือกแนบขมับ · ไม่ใช้แรงแขนดึง',
        secondaryMusclesTh: 'ข้างลำตัว · แกนกลางลึก',
      };
    case 'hanging-leg-raise':
      return {
        ...base,
        camera: 'side',
        cameraLabelTh: 'มุมข้าง 3/4 · โหนบาร์นิ่ง',
        alignmentCueTh: 'ลำตัวดิ่งนิ่งไม่แกว่ง · ยกขาจาก 0° ถึง 90° ขนานพื้น',
        gripBadgeTh: 'จับบาร์คว่ำมือกว้างเท่าไหล่ · กดไหล่ลงนิ่ง',
        secondaryMusclesTh: 'งอสะโพก · หน้าท้องบน · กริป',
      };
    case 'ab-wheel-rollout':
      return {
        ...base,
        camera: 'side',
        cameraLabelTh: 'มุมข้าง · Side Profile',
        alignmentCueTh: 'เกร็งแกนกลาง-ขมิบก้น · แนวหลังตรงไม่แอ่น',
        gripBadgeTh: 'จับแกนล้อแน่น · แขนเหยียดตรงตลอดช่วงกลิ้ง',
        secondaryMusclesTh: 'ปีก · ไหล่ · แกนกลางลึก',
      };
    case 'russian-twist':
      return {
        ...base,
        camera: 'three-quarter',
        cameraLabelTh: 'มุมหน้า 3/4 · ท่านั่งเอน 45°',
        alignmentCueTh: 'เอนหลังตรง 45° · บิดลำตัวและมือที่ประสานซ้าย-ขวาต่อเนื่อง',
        gripBadgeTh: 'ประสานมือด้านหน้าอก · สายตามองตามทิศบิด',
        secondaryMusclesTh: 'หน้าท้องบน · งอสะโพก',
      };
    case 'forearm-plank':
      return {
        ...base,
        camera: 'side',
        cameraLabelTh: 'มุมข้าง · Isometric Align',
        alignmentCueTh: 'ศีรษะ-ไหล่-สะโพก-ข้อเท้า ตรงเป็นเส้นเดียว',
        gripBadgeTh: 'ศอกวางตรงใต้ไหล่ · ม้วนก้นเก็บเกร็งหน้าท้อง',
        secondaryMusclesTh: 'ก้น · ไหล่ · หลังล่าง',
      };
    case 'push-up':
      return {
        ...base,
        camera: 'side',
        cameraLabelTh: 'มุมข้าง · Side Profile',
        alignmentCueTh: 'ศีรษะ-ไหล่-สะโพก-ข้อเท้า ตรงเป็นเส้นเดียว · ศอกทำมุม 45°',
        gripBadgeTh: 'ฝ่ามือกว้างกว่าไหล่เล็กน้อย · นิ้วกางมั่นคง',
        secondaryMusclesTh: 'หลังแขน · ไหล่หน้า · แกนกลาง',
      };
    case 'incline-push-up':
      return {
        ...base,
        camera: 'side',
        cameraLabelTh: 'มุมข้าง · ม้านั่งเอียง',
        alignmentCueTh: 'วางมือบนขอบม้านั่งมั่นคง · เกร็งแกนกลางไม่แอ่นเอว',
        gripBadgeTh: 'มือวางระดับอกล่าง · ศอกเฉียง 45° ข้างตัว',
        secondaryMusclesTh: 'หลังแขน · ไหล่หน้า · แกนกลาง',
      };
    case 'pike-push-up':
      return {
        ...base,
        camera: 'side',
        cameraLabelTh: 'มุมข้าง · ท่าตัว V คว่ำ',
        alignmentCueTh: 'ยกสะโพกสูงรูปตัว V · ลดศีรษะด้านหน้าแนวฝ่ามือ',
        gripBadgeTh: 'ฝ่ามือวางกว้างเท่าไหล่ · ทิ้งน้ำหนักผ่านไหล่หน้า',
        secondaryMusclesTh: 'หลังแขน · หลังบน · แกนกลาง',
      };
    case 'inverted-bodyweight-row':
      return {
        ...base,
        camera: 'side',
        cameraLabelTh: 'มุมข้าง · หงายหน้าดึงใต้บาร์',
        alignmentCueTh: 'หงายหน้าลำตัวตรง ส้นเท้ายันพื้นปลายเท้าชี้ขึ้น · ดึงอกขึ้นแตะบาร์',
        gripBadgeTh: 'จับบาร์คว่ำมือกว้างกว่าไหล่ · เกร็งแกนกลางไม่หย่อนสะโพก',
        secondaryMusclesTh: 'หน้าแขน · ไหล่หลัง · แกนกลาง',
      };
    case 'bodyweight-squat':
      return {
        ...base,
        camera: 'side',
        cameraLabelTh: 'มุมข้าง · Side Profile',
        alignmentCueTh: 'ยืดแขนหน้าถ่วงสมดุล · ย่อสะโพกลงขนานพื้นหลังตรง',
        gripBadgeTh: 'ฝ่าเท้าเต็มพื้นกว้างเท่าไหล่ · เข่าตรงปลายเท้า',
        secondaryMusclesTh: 'ก้น · หลังขา · แกนกลาง',
      };
    case 'reverse-lunge':
      return {
        ...base,
        camera: 'side',
        cameraLabelTh: 'มุมข้าง · ก้าวหลัง 90°/90°',
        alignmentCueTh: 'ลำตัวตั้งตรง · ก้าวหลังย่อเข่า 90° ทั้งสองข้าง',
        gripBadgeTh: 'ลงน้ำหนักเต็มฝ่าเท้าหน้า · เท้าหลังตั้งส้นมั่นคง',
        secondaryMusclesTh: 'ก้น · หลังขา · แกนกลาง',
      };
    case 'glute-bridge':
      return {
        ...base,
        camera: 'side',
        cameraLabelTh: 'มุมข้าง · นอนหงายดันสะโพก',
        alignmentCueTh: 'กดส้นเท้าดันสะโพกตรงแนว ไหล่-สะโพก-เข่า · บีบก้นค้าง',
        gripBadgeTh: 'แขนวางแนบเสื่อทรงตัว · ส้นเท้าห่างสะโพก ~1 ฝ่ามือ',
        secondaryMusclesTh: 'หลังขา · แกนกลาง · หลังล่าง',
      };
    case 'basic-abdominal-crunch':
      return {
        ...base,
        camera: 'side',
        cameraLabelTh: 'มุมข้าง · นอนหงายม้วนตัว',
        alignmentCueTh: 'กดหลังล่างแนบเสื่อ · ม้วนสะบักพ้นพื้น ~35°',
        gripBadgeTh: 'ปลายนิ้วแตะข้างขมับเบาๆ · ห้ามดึงต้นคอ',
        secondaryMusclesTh: 'แกนกลางลึก · ข้างลำตัว',
      };
    default:
      return {
        ...base,
        camera: 'side',
        cameraLabelTh: 'มุมข้าง · Side Profile',
        alignmentCueTh: 'คุมแนวข้อต่อและหลังตรงตลอดการเคลื่อนไหว',
        gripBadgeTh: 'จับกระชับมั่นคง · ข้อมือตั้งตรง',
        secondaryMusclesTh: 'กล้ามเนื้อพยุงข้อต่อ',
      };
  }
}

// ================= KINEMATICS & SMOOTH CONTOUR GEOMETRY =================

interface Vec2 {
  x: number;
  y: number;
}

const FLOOR_Y = 196;
const GROUNDED_ANKLE_Y = FLOOR_Y - 8; // 188 -> shoe sole sits pixel-flush at y = 196!

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

function sampleAsymmetricTempo(cycle: number): { p: number; phase: TempoPhase } {
  if (cycle < 0.25) {
    return { p: easeOutQuart(cycle / 0.25), phase: 'concentric' };
  }
  if (cycle < 0.4) {
    return { p: 1, phase: 'peak' };
  }
  return { p: 1 - easeInOutSine((cycle - 0.4) / 0.6), phase: 'eccentric' };
}

function solveTwoBoneIK(
  rootX: number,
  rootY: number,
  targetX: number,
  targetY: number,
  L1: number,
  L2: number,
  bendDir: 1 | -1
): { p0: Vec2; p1: Vec2; p2: Vec2; upperDeg: number; lowerDeg: number } {
  const dx = targetX - rootX;
  const dy = targetY - rootY;
  const rawDist = Math.hypot(dx, dy);
  const d = clamp(rawDist, Math.abs(L1 - L2) + 2, L1 + L2 - 0.5);

  const baseAngle = Math.atan2(dy, dx);
  const cosA = clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1);
  const rootRad = baseAngle + bendDir * Math.acos(cosA);

  const cosB = clamp((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1);
  const childRelRad = -bendDir * (Math.PI - Math.acos(cosB));

  const p0 = { x: rootX, y: rootY };
  const p1 = { x: rootX + Math.cos(rootRad) * L1, y: rootY + Math.sin(rootRad) * L1 };
  const p2 = {
    x: p1.x + Math.cos(rootRad + childRelRad) * L2,
    y: p1.y + Math.sin(rootRad + childRelRad) * L2,
  };

  return {
    p0,
    p1,
    p2,
    upperDeg: (rootRad * 180) / Math.PI,
    lowerDeg: ((rootRad + childRelRad) * 180) / Math.PI,
  };
}

function solveTwoBoneFK(
  rootX: number,
  rootY: number,
  L1: number,
  upperDeg: number,
  L2: number,
  lowerWorldDeg: number
): { p0: Vec2; p1: Vec2; p2: Vec2; upperDeg: number; lowerDeg: number } {
  const r1 = (upperDeg * Math.PI) / 180;
  const r2 = (lowerWorldDeg * Math.PI) / 180;
  const p0 = { x: rootX, y: rootY };
  const p1 = { x: rootX + Math.cos(r1) * L1, y: rootY + Math.sin(r1) * L1 };
  const p2 = { x: p1.x + Math.cos(r2) * L2, y: p1.y + Math.sin(r2) * L2 };
  return { p0, p1, p2, upperDeg, lowerDeg: lowerWorldDeg };
}

function fmt(n: number): string {
  return n.toFixed(1);
}

/**
 * Generates a single continuous, clean, bold anatomical SVG path for a 2-bone limb.
 */
function buildUnifiedLimbPath(
  p0: Vec2,
  p1: Vec2,
  p2: Vec2,
  widths: {
    rRoot: number;
    rUpperPos: number;
    rUpperNeg: number;
    rJoint: number;
    rLowerPos: number;
    rLowerNeg: number;
    rEnd: number;
  }
): string {
  const dx1 = p1.x - p0.x;
  const dy1 = p1.y - p0.y;
  const L1 = Math.hypot(dx1, dy1) || 1;
  const u1 = { x: dx1 / L1, y: dy1 / L1 };
  const n1 = { x: -u1.y, y: u1.x };

  const dx2 = p2.x - p1.x;
  const dy2 = p2.y - p1.y;
  const L2 = Math.hypot(dx2, dy2) || 1;
  const u2 = { x: dx2 / L2, y: dy2 / L2 };
  const n2 = { x: -u2.y, y: u2.x };

  const cross = u1.x * u2.y - u1.y * u2.x;
  let mx = n1.x + n2.x;
  let my = n1.y + n2.y;
  let mLen = Math.hypot(mx, my);
  if (mLen < 0.22) {
    const ox = u1.x - u2.x;
    const oy = u1.y - u2.y;
    const oLen = Math.hypot(ox, oy) || 1;
    const sign = cross >= 0 ? -1 : 1;
    mx = (ox / oLen) * sign;
    my = (oy / oLen) * sign;
    mLen = 1;
  }
  const nm = { x: mx / mLen, y: my / mLen };
  const dotM = clamp(nm.x * n1.x + nm.y * n1.y, 0.55, 1);
  const bendFactor = clamp(1 - (u1.x * u2.x + u1.y * u2.y), 0, 1.8);

  const rJPos = widths.rJoint * (cross > 0.08 ? clamp(1 - bendFactor * 0.22, 0.62, 1) : clamp(1 / dotM, 1, 1.18));
  const rJNeg = widths.rJoint * (cross < -0.08 ? clamp(1 - bendFactor * 0.22, 0.62, 1) : clamp(1 / dotM, 1, 1.18));

  const pt = (base: Vec2, along: Vec2, alongDist: number, normal: Vec2, off: number): Vec2 => ({
    x: base.x + along.x * alongDist + normal.x * off,
    y: base.y + along.y * alongDist + normal.y * off,
  });

  const sPos = pt(p0, u1, 0, n1, widths.rRoot);
  const b1Pos = pt(p0, u1, L1 * 0.44, n1, widths.rUpperPos);
  const jPos = { x: p1.x + nm.x * rJPos, y: p1.y + nm.y * rJPos };
  const b2Pos = pt(p1, u2, L2 * 0.32, n2, widths.rLowerPos);
  const ePos = pt(p2, u2, 0, n2, widths.rEnd);
  const eTip = pt(p2, u2, widths.rEnd * 1.15, n2, 0);

  const eNeg = pt(p2, u2, 0, n2, -widths.rEnd);
  const b2Neg = pt(p1, u2, L2 * 0.32, n2, -widths.rLowerNeg);
  const jNeg = { x: p1.x - nm.x * rJNeg, y: p1.y - nm.y * rJNeg };
  const b1Neg = pt(p0, u1, L1 * 0.44, n1, -widths.rUpperNeg);
  const sNeg = pt(p0, u1, 0, n1, -widths.rRoot);
  const sCap = pt(p0, u1, -widths.rRoot * 0.95, n1, 0);

  return [
    `M ${fmt(sPos.x)} ${fmt(sPos.y)}`,
    `Q ${fmt(b1Pos.x)} ${fmt(b1Pos.y)} ${fmt(jPos.x)} ${fmt(jPos.y)}`,
    `Q ${fmt(b2Pos.x)} ${fmt(b2Pos.y)} ${fmt(ePos.x)} ${fmt(ePos.y)}`,
    `Q ${fmt(eTip.x)} ${fmt(eTip.y)} ${fmt(eNeg.x)} ${fmt(eNeg.y)}`,
    `Q ${fmt(b2Neg.x)} ${fmt(b2Neg.y)} ${fmt(jNeg.x)} ${fmt(jNeg.y)}`,
    `Q ${fmt(b1Neg.x)} ${fmt(b1Neg.y)} ${fmt(sNeg.x)} ${fmt(sNeg.y)}`,
    `Q ${fmt(sCap.x)} ${fmt(sCap.y)} ${fmt(sPos.x)} ${fmt(sPos.y)} Z`,
  ].join(' ');
}

// ================= STUDIO ANATOMY THEME & RENDER CONTEXT =================

interface StudioCtx {
  uid: string;
  gender: AthleteGender;
  bodyGrad: string;
  backGrad: string;
  primaryGrad: string;
  secondaryGrad: string;
  voltGlow: string;
  cobaltGlow: string;
  voltAlpha: number;
  cobaltAlpha: number;
}

function getMusclePaint(role: MuscleRole, ctx: StudioCtx) {
  if (role === 'primary') {
    return {
      fill: `url(#${ctx.primaryGrad})`,
      opacity: ctx.voltAlpha,
      filter: `url(#${ctx.voltGlow})`,
    };
  }
  if (role === 'secondary') {
    return {
      fill: `url(#${ctx.secondaryGrad})`,
      opacity: ctx.cobaltAlpha,
      filter: `url(#${ctx.cobaltGlow})`,
    };
  }
  return null;
}

const STUDIO_STRIATION = 'rgba(10, 10, 14, 0.44)';

// ================= SLEEK PRO SPORTS-ILLUSTRATION ANATOMY PRIMITIVES =================

/**
 * Clean, recognizable Athletic Gym Trainer Silhouette.
 * Local origin (0, 0) = ankle center; flat sole sits at y = +8.0; heel at -9.5; forward toe at +19.0.
 */
const AthleticShoe: React.FC<{
  x: number;
  y: number;
  angleDeg?: number;
  dir?: 1 | -1;
  backLayer?: boolean;
}> = ({ x, y, angleDeg = 0, dir = 1, backLayer = false }) => (
  <g transform={`translate(${x} ${y}) rotate(${angleDeg}) scale(${dir} 1)`}>
    {/* Shoe Upper: Distinct Heel Counter + Ankle Collar + Rounded Forward Toe Box */}
    <path
      d="M -6.5 -2.2 L 2.2 -2.2 C 5.5 -0.8, 10 0.8, 15.8 2 C 19.2 2.8, 19.8 5.2, 18.4 7.2 L -8.6 7.2 C -10.2 7.2, -10.2 3.2, -9 0.4 C -8.3 -1.2, -7.5 -2.2, -6.5 -2.2 Z"
      fill={backLayer ? '#141418' : '#1E2028'}
      stroke={backLayer ? '#3F3F46' : '#64748B'}
      strokeOpacity={backLayer ? 0.5 : 0.72}
      strokeWidth="0.95"
      strokeLinejoin="round"
    />
    {/* Crisp Flat Athletic Midsole / Outsole (bottom flush at y = +8) */}
    <path
      d="M -9.2 5.4 H 18.8 C 19.2 6.8, 18.6 8, 17.2 8 H -8.4 C -9.4 8, -9.6 6.6, -9.2 5.4 Z"
      fill={backLayer ? '#18181B' : '#27272E'}
      stroke={backLayer ? '#3F3F46' : '#94A3B8'}
      strokeOpacity={backLayer ? 0.38 : 0.58}
      strokeWidth="0.85"
    />
  </g>
);

const UnifiedArm: React.FC<{
  p0: Vec2;
  p1: Vec2;
  p2: Vec2;
  bicepRole?: MuscleRole;
  tricepRole?: MuscleRole;
  forearmRole?: MuscleRole;
  deltRole?: MuscleRole;
  bicepSide?: 1 | -1;
  backLayer?: boolean;
  scale?: number;
  ctx: StudioCtx;
  handProp?: React.ReactNode;
}> = ({
  p0,
  p1,
  p2,
  bicepRole = 'none',
  tricepRole = 'none',
  forearmRole = 'none',
  deltRole = 'none',
  bicepSide = -1,
  backLayer = false,
  scale = 1,
  ctx,
  handProp,
}) => {
  const clipId = useId().replace(/:/g, '');
  const isFemale = ctx.gender === 'female';
  const effScale = isFemale ? scale * 0.80 : scale * 1.06;
  const pathD = buildUnifiedLimbPath(
    p0,
    p1,
    p2,
    isFemale
      ? {
          rRoot: 6.8 * scale,
          rUpperPos: 7.0 * scale,
          rUpperNeg: 6.8 * scale,
          rJoint: 4.9 * scale,
          rLowerPos: 5.4 * scale,
          rLowerNeg: 5.0 * scale,
          rEnd: 3.3 * scale,
        }
      : {
          rRoot: 9.6 * scale,
          rUpperPos: 9.8 * scale,
          rUpperNeg: 9.5 * scale,
          rJoint: 6.5 * scale,
          rLowerPos: 7.4 * scale,
          rLowerNeg: 6.8 * scale,
          rEnd: 4.1 * scale,
        }
  );

  const L1 = Math.hypot(p1.x - p0.x, p1.y - p0.y) || 1;
  const L2 = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
  const uDeg = (Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180) / Math.PI;
  const lDeg = (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;

  const biPaint = !backLayer ? getMusclePaint(bicepRole, ctx) : null;
  const triPaint = !backLayer ? getMusclePaint(tricepRole, ctx) : null;
  const forePaint = !backLayer ? getMusclePaint(forearmRole, ctx) : null;
  const deltPaint = !backLayer ? getMusclePaint(deltRole, ctx) : null;

  const bS = bicepSide;
  const tS = -bicepSide;

  return (
    <g>
      <defs>
        <clipPath id={`arm-clip-${clipId}`}>
          <path d={pathD} />
        </clipPath>
      </defs>

      <path
        d={pathD}
        fill={`url(#${backLayer ? ctx.backGrad : ctx.bodyGrad})`}
        stroke={backLayer ? '#2E313B' : '#52525B'}
        strokeOpacity={backLayer ? 0.52 : 0.78}
        strokeWidth={backLayer ? 0.85 : 1.0}
        strokeLinejoin="round"
      />

      {/* Defined Rounded Deltoid Shoulder Cap & Bicep/Tricep Subtle Contour on Foreground Arm */}
      {!backLayer && (
        <g transform={`translate(${p0.x} ${p0.y}) rotate(${uDeg})`} pointerEvents="none">
          <path
            d={
              isFemale
                ? `M ${-4.2 * scale} ${-3.8 * scale} C ${2.0 * scale} ${-6.6 * scale}, ${9.2 * scale} ${-5.4 * scale}, ${12.2 * scale} 0 C ${9.2 * scale} ${5.4 * scale}, ${2.0 * scale} ${6.4 * scale}, ${-4.2 * scale} ${3.8 * scale}`
                : `M ${-5.6 * scale} ${-5.6 * scale} C ${2.8 * scale} ${-9.4 * scale}, ${12.4 * scale} ${-7.8 * scale}, ${16.4 * scale} 0 C ${12.4 * scale} ${7.8 * scale}, ${2.8 * scale} ${9.2 * scale}, ${-5.6 * scale} ${5.6 * scale}`
            }
            fill="none"
            stroke="#71717A"
            strokeOpacity={isFemale ? 0.24 : 0.36}
            strokeWidth={isFemale ? 0.72 : 0.92}
            strokeLinecap="round"
          />
        </g>
      )}

      {!backLayer && (biPaint || triPaint || forePaint || deltPaint) && (
        <g clipPath={`url(#arm-clip-${clipId})`}>
          <g transform={`translate(${p0.x} ${p0.y}) rotate(${uDeg})`}>
            {deltPaint && (
              <g>
                <ellipse
                  cx={2 * effScale}
                  cy={0}
                  rx={10.5 * effScale}
                  ry={9.5 * effScale}
                  fill={deltPaint.fill}
                  opacity={deltPaint.opacity}
                  filter={deltPaint.filter}
                />
                <path
                  d={`M ${-4 * effScale} ${-3 * effScale} Q ${3 * effScale} ${-2 * effScale} ${9 * effScale} 0 M ${-4 * effScale} ${3 * effScale} Q ${3 * effScale} ${2 * effScale} ${9 * effScale} 0`}
                  stroke={STUDIO_STRIATION}
                  strokeWidth="0.72"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            )}
            {biPaint && (
              <g>
                <path
                  d={`M ${L1 * 0.14} ${bS * 0.5} C ${L1 * 0.36} ${bS * 10.5 * effScale}, ${L1 * 0.68} ${bS * 9.5 * effScale}, ${L1 * 0.88} ${bS * 1.8} C ${L1 * 0.62} ${bS * -0.5}, ${L1 * 0.35} ${bS * -0.5}, ${L1 * 0.14} ${bS * 0.5} Z`}
                  fill={biPaint.fill}
                  opacity={biPaint.opacity}
                  filter={biPaint.filter}
                />
                <path
                  d={`M ${L1 * 0.24} ${bS * 3.2 * effScale} Q ${L1 * 0.5} ${bS * 6.0 * effScale} ${L1 * 0.78} ${bS * 2.8 * effScale}`}
                  stroke={STUDIO_STRIATION}
                  strokeWidth="0.72"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            )}
            {triPaint && (
              <g>
                <path
                  d={`M ${L1 * 0.12} ${tS * 0.5} C ${L1 * 0.32} ${tS * 10.2 * effScale}, ${L1 * 0.68} ${tS * 9.0 * effScale}, ${L1 * 0.88} ${tS * 1.6} C ${L1 * 0.6} ${tS * -0.5}, ${L1 * 0.32} ${tS * -0.5}, ${L1 * 0.12} ${tS * 0.5} Z`}
                  fill={triPaint.fill}
                  opacity={triPaint.opacity}
                  filter={triPaint.filter}
                />
                <path
                  d={`M ${L1 * 0.22} ${tS * 3.4 * effScale} Q ${L1 * 0.48} ${tS * 6.0 * effScale} ${L1 * 0.74} ${tS * 2.8 * effScale}`}
                  stroke={STUDIO_STRIATION}
                  strokeWidth="0.72"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            )}
          </g>

          {forePaint && (
            <g transform={`translate(${p1.x} ${p1.y}) rotate(${lDeg})`}>
              <path
                d={`M ${L2 * 0.06} 0 C ${L2 * 0.24} ${-7.5 * effScale}, ${L2 * 0.58} ${-6.5 * effScale}, ${L2 * 0.82} 0 C ${L2 * 0.54} ${4.8 * effScale}, ${L2 * 0.24} ${5.2 * effScale}, ${L2 * 0.06} 0 Z`}
                fill={forePaint.fill}
                opacity={forePaint.opacity}
                filter={forePaint.filter}
              />
              <path
                d={`M ${L2 * 0.14} ${-1.4 * effScale} Q ${L2 * 0.44} ${-3.0 * effScale} ${L2 * 0.72} ${-0.6 * effScale}`}
                stroke={STUDIO_STRIATION}
                strokeWidth="0.7"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          )}
        </g>
      )}

      <g transform={`translate(${p2.x} ${p2.y})`}>
        {handProp}
        <circle
          cx={0}
          cy={0}
          r={4.1 * effScale}
          fill={backLayer ? '#18181D' : '#2E303A'}
          stroke={backLayer ? '#3F3F46' : '#71717A'}
          strokeOpacity={backLayer ? 0.55 : 0.82}
          strokeWidth="0.95"
        />
      </g>
    </g>
  );
};

const UnifiedLeg: React.FC<{
  p0: Vec2;
  p1: Vec2;
  p2: Vec2;
  quadRole?: MuscleRole;
  hamRole?: MuscleRole;
  calfRole?: MuscleRole;
  quadSide?: 1 | -1;
  backLayer?: boolean;
  footAngleDeg?: number;
  footDir?: 1 | -1;
  ctx: StudioCtx;
}> = ({
  p0,
  p1,
  p2,
  quadRole = 'none',
  hamRole = 'none',
  calfRole = 'none',
  quadSide = -1,
  backLayer = false,
  footAngleDeg = 0,
  footDir = 1,
  ctx,
}) => {
  const clipId = useId().replace(/:/g, '');
  const qS = quadSide;
  const hS = -quadSide;

  const isFemale = ctx.gender === 'female';
  const pathD = buildUnifiedLimbPath(
    p0,
    p1,
    p2,
    isFemale
      ? {
          rRoot: 11.4,
          rUpperPos: qS > 0 ? 11.2 : 10.2,
          rUpperNeg: qS < 0 ? 11.2 : 10.2,
          rJoint: 6.1,
          rLowerPos: hS > 0 ? 7.4 : 5.2,
          rLowerNeg: hS < 0 ? 7.4 : 5.2,
          rEnd: 3.5,
        }
      : {
          rRoot: 12.4,
          rUpperPos: qS > 0 ? 13.0 : 11.2,
          rUpperNeg: qS < 0 ? 13.0 : 11.2,
          rJoint: 7.3,
          rLowerPos: hS > 0 ? 9.0 : 6.4,
          rLowerNeg: hS < 0 ? 9.0 : 6.4,
          rEnd: 4.3,
        }
  );

  const L1 = Math.hypot(p1.x - p0.x, p1.y - p0.y) || 1;
  const L2 = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
  const uDeg = (Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180) / Math.PI;
  const lDeg = (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;

  const qPaint = !backLayer ? getMusclePaint(quadRole, ctx) : null;
  const hPaint = !backLayer ? getMusclePaint(hamRole, ctx) : null;
  const cPaint = !backLayer ? getMusclePaint(calfRole, ctx) : null;

  return (
    <g>
      <defs>
        <clipPath id={`leg-clip-${clipId}`}>
          <path d={pathD} />
        </clipPath>
      </defs>

      {/* Unified Seamless Matte Graphite Leg Silhouette */}
      <path
        d={pathD}
        fill={`url(#${backLayer ? ctx.backGrad : ctx.bodyGrad})`}
        stroke={backLayer ? '#2E313B' : '#52525B'}
        strokeOpacity={backLayer ? 0.52 : 0.78}
        strokeWidth={backLayer ? 0.85 : 1.0}
        strokeLinejoin="round"
      />

      {!backLayer && (qPaint || hPaint || cPaint) && (
        <g clipPath={`url(#leg-clip-${clipId})`}>
          <g transform={`translate(${p0.x} ${p0.y}) rotate(${uDeg})`}>
            {qPaint && (
              <g>
                <path
                  d={`M ${L1 * 0.1} ${qS * 0.5} C ${L1 * 0.34} ${qS * 14.5}, ${L1 * 0.72} ${qS * 12.2}, ${L1 * 0.92} ${qS * 2.2} C ${L1 * 0.64} ${qS * -1}, ${L1 * 0.32} ${qS * -1}, ${L1 * 0.1} ${qS * 0.5} Z`}
                  fill={qPaint.fill}
                  opacity={qPaint.opacity}
                  filter={qPaint.filter}
                />
                <path
                  d={`M ${L1 * 0.22} ${qS * 4.4} Q ${L1 * 0.52} ${qS * 8.2} ${L1 * 0.82} ${qS * 4.0} M ${L1 * 0.26} ${qS * 2.0} Q ${L1 * 0.54} ${qS * 4.2} ${L1 * 0.8} ${qS * 1.8}`}
                  stroke={STUDIO_STRIATION}
                  strokeWidth="0.78"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            )}
            {hPaint && (
              <g>
                <path
                  d={`M ${L1 * 0.1} ${hS * 0.5} C ${L1 * 0.34} ${hS * 13.5}, ${L1 * 0.72} ${hS * 11.4}, ${L1 * 0.9} ${hS * 2.2} C ${L1 * 0.62} ${hS * -0.8}, ${L1 * 0.32} ${hS * -0.8}, ${L1 * 0.1} ${hS * 0.5} Z`}
                  fill={hPaint.fill}
                  opacity={hPaint.opacity}
                  filter={hPaint.filter}
                />
                <path
                  d={`M ${L1 * 0.22} ${hS * 4.2} Q ${L1 * 0.52} ${hS * 7.6} ${L1 * 0.8} ${hS * 3.8}`}
                  stroke={STUDIO_STRIATION}
                  strokeWidth="0.78"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            )}
          </g>

          {cPaint && (
            <g transform={`translate(${p1.x} ${p1.y}) rotate(${lDeg})`}>
              <path
                d={`M ${L2 * 0.1} ${hS * 0.5} C ${L2 * 0.28} ${hS * 11.5}, ${L2 * 0.62} ${hS * 9.2}, ${L2 * 0.78} ${hS * 1.6} C ${L2 * 0.52} ${hS * -0.5}, ${L2 * 0.28} ${hS * -0.5}, ${L2 * 0.1} ${hS * 0.5} Z`}
                fill={cPaint.fill}
                opacity={cPaint.opacity}
                filter={cPaint.filter}
              />
              <path
                d={`M ${L2 * 0.18} ${hS * 3.5} Q ${L2 * 0.42} ${hS * 6.4} ${L2 * 0.68} ${hS * 2.6}`}
                stroke={STUDIO_STRIATION}
                strokeWidth="0.74"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          )}
        </g>
      )}

      {/* Grounded Athletic Shoe Rendered Cleanly Over Ankle Collar */}
      <AthleticShoe x={p2.x} y={p2.y} angleDeg={footAngleDeg} dir={footDir} backLayer={backLayer} />
    </g>
  );
};

const UnifiedSideTorso: React.FC<{
  sx: number;
  sy: number;
  hx: number;
  hy: number;
  chestSide?: 1 | -1;
  chest?: MuscleRole;
  lats?: MuscleRole;
  abs?: MuscleRole;
  upperBack?: MuscleRole;
  lowerBack?: MuscleRole;
  glute?: MuscleRole;
  headAngleAdjust?: number;
  ctx: StudioCtx;
}> = ({
  sx,
  sy,
  hx,
  hy,
  chestSide = -1,
  chest = 'none',
  lats = 'none',
  abs = 'none',
  upperBack = 'none',
  lowerBack = 'none',
  glute = 'none',
  headAngleAdjust = 0,
  ctx,
}) => {
  const clipId = useId().replace(/:/g, '');
  const dx = hx - sx;
  const dy = hy - sy;
  const L = Math.hypot(dx, dy) || 56;
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
  const f = chestSide;
  const b = -chestSide;

  const pecP = getMusclePaint(chest, ctx);
  const latP = getMusclePaint(lats, ctx);
  const absP = getMusclePaint(abs, ctx);
  const upP = getMusclePaint(upperBack, ctx);
  const lowP = getMusclePaint(lowerBack, ctx);
  const gluP = getMusclePaint(glute, ctx);

  const isFemale = ctx.gender === 'female';
  // Female: natural tasteful chest/sports-bra contour (f*16.6 -> underbust f*9.8), slimmer waist (f*8.2 / b*7.8), defined smoothly rounded glute (b*16.0)
  // Male: broader muscular upper torso, stronger chest depth (f*18.8), thick upper back/lats (b*16.0), solid athletic core
  const torsoPath = isFemale
    ? `M -7.0 ${f * 5.2} C -1.4 ${f * 8.4}, ${L * 0.14} ${f * 16.4}, ${L * 0.27} ${f * 16.4} C ${L * 0.34} ${f * 16.2}, ${L * 0.37} ${f * 10.4}, ${L * 0.44} ${f * 9.6} C ${L * 0.56} ${f * 8.4}, ${L * 0.72} ${f * 8.4}, ${L * 0.88} ${f * 9.4} C ${L + 2.8} ${f * 8.8}, ${L + 6.4} ${f * 5.6}, ${L + 6.8} ${f * 1.2} C ${L + 8.6} ${b * 6.8}, ${L + 6.4} ${b * 15.8}, ${L * 0.94} ${b * 16.0} C ${L * 0.82} ${b * 15.8}, ${L * 0.74} ${b * 9.2}, ${L * 0.58} ${b * 8.0} C ${L * 0.40} ${b * 10.2}, ${L * 0.14} ${b * 11.2}, -6.2 ${b * 6.8} C -9.6 ${b * 3.0}, -9.6 ${f * 2.2}, -7.0 ${f * 5.2} Z`
    : `M -8.4 ${f * 7.2} C -2.8 ${f * 14.0}, ${L * 0.18} ${f * 19.0}, ${L * 0.36} ${f * 17.8} C ${L * 0.46} ${f * 16.2}, ${L * 0.54} ${f * 13.4}, ${L * 0.76} ${f * 12.2} C ${L * 0.94} ${f * 11.2}, ${L + 5.2} ${f * 8.6}, ${L + 7.8} ${f * 3.4} C ${L + 8.4} ${b * 5.8}, ${L + 5.4} ${b * 13.2}, ${L * 0.92} ${b * 14.2} C ${L * 0.78} ${b * 12.0}, ${L * 0.62} ${b * 11.8}, ${L * 0.40} ${b * 15.8} C ${L * 0.16} ${b * 16.2}, -2.4 ${b * 12.8}, -7.6 ${b * 9.4} C -11.4 ${b * 4.4}, -11.4 ${f * 3.2}, -8.4 ${f * 7.2} Z`;

  return (
    <g transform={`translate(${sx} ${sy}) rotate(${deg})`}>
      <defs>
        <clipPath id={`torso-clip-${clipId}`}>
          <path d={torsoPath} />
        </clipPath>
      </defs>

      {/* Smooth Minimalist Athletic Neck + Faceless Side-Profile Head (Zero Mouth/Facial Notches) */}
      <g transform={`translate(-9 ${f * 0.4}) rotate(${headAngleAdjust})`}>
        {/* Smooth Tapered S-Curved Athletic Ponytail Flowing Naturally from Back of Head (Female Profile) */}
        {isFemale && (
          <g>
            <path
              d={`M -14.8 ${b * 5.6} C -17.4 ${b * 9.4}, -13.6 ${b * 13.6}, -7.2 ${b * 12.6} C -2.2 ${b * 11.8}, 1.4 ${b * 10.6}, 6.8 ${b * 13.4} C 2.4 ${b * 14.6}, -2.6 ${b * 14.2}, -7.4 ${b * 15.0} C -13.8 ${b * 16.0}, -19.2 ${b * 12.2}, -16.4 ${b * 6.0} Z`}
              fill={`url(#${ctx.bodyGrad})`}
              stroke="#52525B"
              strokeOpacity="0.82"
              strokeWidth="0.95"
              strokeLinejoin="round"
            />
            <path
              d={`M -15.4 ${b * 7.6} C -14.0 ${b * 12.2}, -8.8 ${b * 13.6}, -3.2 ${b * 12.8} C 0.2 ${b * 12.4}, 2.8 ${b * 12.6}, 5.2 ${b * 13.4}`}
              stroke="#71717A"
              strokeOpacity="0.46"
              strokeWidth="0.65"
              strokeLinecap="round"
              fill="none"
            />
            <ellipse
              cx={-15.4}
              cy={b * 5.9}
              rx="1.35"
              ry="1.85"
              transform={`rotate(${b > 0 ? 18 : -18} -15.4 ${b * 5.9})`}
              fill="#FF4500"
              fillOpacity="0.88"
            />
          </g>
        )}
        {/* Athletic Neck & Trapezius Base */}
        <path
          d={
            isFemale
              ? `M -3.6 ${b * 3.4} C 2 ${b * 4.4}, 8 ${b * 6.8}, 12.8 ${b * 7.6} L 11.0 ${f * 5.0} C 6 ${f * 4.4}, 1 ${f * 3.6}, -3.6 ${f * 3.0} Z`
              : `M -4.4 ${b * 5.0} C 2 ${b * 6.8}, 8.2 ${b * 10.2}, 14.4 ${b * 11.2} L 12.4 ${f * 6.8} C 6 ${f * 5.8}, 1 ${f * 4.8}, -4.4 ${f * 4.0} Z`
          }
          fill={`url(#${ctx.bodyGrad})`}
          stroke="#52525B"
          strokeOpacity="0.72"
          strokeWidth="0.95"
          strokeLinejoin="round"
        />
        {/* Smooth Faceless Side-Profile Athletic Head */}
        <path
          d={
            isFemale
              ? `M -3.8 ${b * 4.0} C -7.4 ${b * 7.6}, -16.6 ${b * 7.6}, -19.8 ${b * 1.0} C -20.3 ${f * 4.1}, -18.0 ${f * 6.7}, -14.3 ${f * 7.0} C -12.2 ${f * 7.4}, -9.9 ${f * 7.2}, -7.2 ${f * 6.5} C -5.2 ${f * 5.9}, -4.1 ${f * 4.2}, -3.8 ${f * 3.0} Z`
              : `M -4.0 ${b * 4.4} C -7.8 ${b * 8.2}, -17.4 ${b * 8.2}, -20.6 ${b * 1.2} C -21.2 ${f * 4.5}, -18.8 ${f * 7.3}, -14.8 ${f * 7.7} C -12.6 ${f * 8.1}, -10.2 ${f * 8.0}, -7.4 ${f * 7.3} C -5.2 ${f * 6.7}, -4.2 ${f * 4.8}, -4.0 ${f * 3.4} Z`
          }
          fill={`url(#${ctx.bodyGrad})`}
          stroke="#52525B"
          strokeOpacity="0.82"
          strokeWidth="1.0"
          strokeLinejoin="round"
        />
        {/* Subtle Clean Jawline Shadow Accent */}
        <path
          d={`M -6.4 ${f * 5.6} Q -8.0 ${f * 3.0} -9.2 ${f * 0.6}`}
          stroke="#71717A"
          strokeOpacity="0.3"
          strokeWidth="0.72"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      <path
        d={torsoPath}
        fill={`url(#${ctx.bodyGrad})`}
        stroke="#52525B"
        strokeOpacity="0.82"
        strokeWidth="1.05"
        strokeLinejoin="round"
      />

      {/* Subtle Athletic Sports-Bra Band Contour (Female Side Profile) */}
      {isFemale && (
        <path
          d={`M ${L * 0.37} ${f * 10.6} Q ${L * 0.36} ${f * 2.0} ${L * 0.35} ${b * 9.8}`}
          stroke="#94A3B8"
          strokeOpacity="0.26"
          strokeWidth="0.82"
          strokeLinecap="round"
          fill="none"
          pointerEvents="none"
        />
      )}

      <g clipPath={`url(#torso-clip-${clipId})`}>
        {pecP && (
          <g>
            <path
              d={`M ${L * 0.04} ${f * 2} C ${L * 0.16} ${f * 18}, ${L * 0.36} ${f * 17.5}, ${L * 0.45} ${f * 6} C ${L * 0.32} ${f * 1.8}, ${L * 0.16} ${f * 1.2}, ${L * 0.04} ${f * 2} Z`}
              fill={pecP.fill}
              opacity={pecP.opacity}
              filter={pecP.filter}
            />
            <path
              d={`M ${L * 0.12} ${f * 5.5} Q ${L * 0.25} ${f * 10.5} ${L * 0.38} ${f * 7.5} M ${L * 0.15} ${f * 9.5} Q ${L * 0.27} ${f * 13.5} ${L * 0.37} ${f * 10.5}`}
              stroke={STUDIO_STRIATION}
              strokeWidth="0.76"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}
        {latP && (
          <g>
            <path
              d={`M ${L * 0.14} ${b * 1.5} C ${L * 0.24} ${b * 15}, ${L * 0.56} ${b * 14.5}, ${L * 0.72} ${b * 3.5} C ${L * 0.52} ${f * 1.5}, ${L * 0.28} ${f * 1.5}, ${L * 0.14} ${b * 1.5} Z`}
              fill={latP.fill}
              opacity={latP.opacity}
              filter={latP.filter}
            />
            <path
              d={`M ${L * 0.22} ${b * 4.5} L ${L * 0.52} ${b * 9.5} M ${L * 0.28} ${b * 2.2} L ${L * 0.62} ${b * 6.8}`}
              stroke={STUDIO_STRIATION}
              strokeWidth="0.78"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}
        {absP && (
          <g fill={absP.fill} opacity={absP.opacity} filter={absP.filter}>
            <rect x={L * 0.48} y={f > 0 ? 4 : -11.5} width={L * 0.12} height="7.5" rx="3" />
            <rect x={L * 0.63} y={f > 0 ? 4 : -11} width={L * 0.12} height="7" rx="3" />
            <rect x={L * 0.77} y={f > 0 ? 4 : -10.5} width={L * 0.11} height="6.5" rx="3" />
          </g>
        )}
        {upP && (
          <g>
            <path
              d={`M ${L * 0.02} ${b * 2.5} C ${L * 0.18} ${b * 15.5}, ${L * 0.46} ${b * 15}, ${L * 0.56} ${b * 5.2} C ${L * 0.4} ${b * 1.5}, ${L * 0.18} ${b * 1.5}, ${L * 0.02} ${b * 2.5} Z`}
              fill={upP.fill}
              opacity={upP.opacity}
              filter={upP.filter}
            />
            <path
              d={`M ${L * 0.1} ${b * 6.0} Q ${L * 0.28} ${b * 11.2} ${L * 0.46} ${b * 7.6}`}
              stroke={STUDIO_STRIATION}
              strokeWidth="0.76"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}
        {lowP && (
          <path
            d={`M ${L * 0.56} ${b * 3} C ${L * 0.66} ${b * 12}, ${L * 0.79} ${b * 11.5}, ${L * 0.87} ${b * 3.8} C ${L * 0.76} ${b * 1.5}, ${L * 0.66} ${b * 1.5}, ${L * 0.56} ${b * 3} Z`}
            fill={lowP.fill}
            opacity={lowP.opacity}
            filter={lowP.filter}
          />
        )}
        {gluP && (
          <g>
            <path
              d={`M ${L * 0.82} ${b * 2} C ${L * 0.86} ${b * 16}, ${L + 7} ${b * 15}, ${L + 7} ${b * 2} C ${L + 3} ${b * 0.2}, ${L * 0.9} ${b * 0.2}, ${L * 0.82} ${b * 2} Z`}
              fill={gluP.fill}
              opacity={gluP.opacity}
              filter={gluP.filter}
            />
            <path
              d={`M ${L * 0.88} ${b * 5.2} Q ${L * 0.97} ${b * 10.2} ${L + 4} ${b * 5.8}`}
              stroke={STUDIO_STRIATION}
              strokeWidth="0.78"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}
      </g>
    </g>
  );
};

/**
 * Sleek Front-Facing Standing/Hinged Athletic Silhouette with Grounded Trainers on y = 196.
 */
const UnifiedFrontBody: React.FC<{
  cx: number;
  shoulderY: number;
  hipY: number;
  shoulderHalfW?: number;
  waistHalfW?: number;
  mode?: 'standing' | 'hinged' | 'seated';
  traps?: MuscleRole;
  delts?: MuscleRole;
  ctx: StudioCtx;
}> = ({
  cx,
  shoulderY,
  hipY,
  shoulderHalfW = 28,
  waistHalfW = 16,
  mode = 'standing',
  traps = 'none',
  delts = 'none',
  ctx,
}) => {
  const clipId = useId().replace(/:/g, '');
  const isFemale = ctx.gender === 'female';
  const h = hipY - shoulderY;
  const trapP = getMusclePaint(traps, ctx);
  const deltP = getMusclePaint(delts, ctx);

  // Female: distinctly slimmer & sleeker upper body (~25% narrower shoulders than male), softer trapezius slope, narrower waist, natural hourglass hip curve
  const effShoulderW = isFemale ? Math.round(shoulderHalfW * 0.74) : Math.round(shoulderHalfW * 1.08);
  const effWaistW = isFemale ? Math.round(waistHalfW * 0.66) : Math.round(waistHalfW * 0.98);
  const effHipW = isFemale ? Math.round(waistHalfW * 1.18) : waistHalfW + 1.4;

  const torsoPath = isFemale
    ? [
        `M ${cx - 4.3} ${shoulderY - 12}`,
        `C ${cx - 5.6} ${shoulderY - 5.5}, ${cx - effShoulderW * 0.66} ${shoulderY - 1.2}, ${cx - effShoulderW} ${shoulderY + 6.5}`,
        `C ${cx - effShoulderW - 0.2} ${shoulderY + 17.5}, ${cx - effWaistW - 2.2} ${shoulderY + h * 0.52}, ${cx - effWaistW} ${shoulderY + h * 0.70}`,
        `C ${cx - effWaistW - 2.4} ${shoulderY + h * 0.84}, ${cx - effHipW} ${hipY + 1.5}, ${cx - effHipW} ${hipY + 8.5}`,
        `Q ${cx} ${hipY + 13.2} ${cx + effHipW} ${hipY + 8.5}`,
        `C ${cx + effHipW} ${hipY + 1.5}, ${cx + effWaistW + 2.4} ${shoulderY + h * 0.84}, ${cx + effWaistW} ${shoulderY + h * 0.70}`,
        `C ${cx + effWaistW + 2.2} ${shoulderY + h * 0.52}, ${cx + effShoulderW + 0.2} ${shoulderY + 17.5}, ${cx + effShoulderW} ${shoulderY + 6.5}`,
        `C ${cx + effShoulderW * 0.66} ${shoulderY - 1.2}, ${cx + 5.6} ${shoulderY - 5.5}, ${cx + 4.3} ${shoulderY - 12}`,
        `Z`,
      ].join(' ')
    : [
        `M ${cx - 7.4} ${shoulderY - 12.5}`,
        `C ${cx - 11.4} ${shoulderY - 4.5}, ${cx - effShoulderW * 0.76} ${shoulderY - 5.5}, ${cx - effShoulderW} ${shoulderY + 5}`,
        `C ${cx - effShoulderW - 1.6} ${shoulderY + 18}, ${cx - effWaistW - 4.0} ${shoulderY + h * 0.60}, ${cx - effWaistW} ${hipY}`,
        `L ${cx - effHipW} ${hipY + 8}`,
        `Q ${cx} ${hipY + 12} ${cx + effHipW} ${hipY + 8}`,
        `L ${cx + effWaistW} ${hipY}`,
        `C ${cx + effWaistW + 4.0} ${shoulderY + h * 0.60}, ${cx + effShoulderW + 1.6} ${shoulderY + 18}, ${cx + effShoulderW} ${shoulderY + 5}`,
        `C ${cx + effShoulderW * 0.76} ${shoulderY - 5.5}, ${cx + 11.4} ${shoulderY - 4.5}, ${cx + 7.4} ${shoulderY - 12.5}`,
        `Z`,
      ].join(' ');

  const legFill = mode === 'hinged' ? ctx.backGrad : ctx.bodyGrad;

  return (
    <g>
      <defs>
        <clipPath id={`front-torso-${clipId}`}>
          <path d={torsoPath} />
        </clipPath>
      </defs>

      {/* Proportional Standing Legs Grounded Directly to Sneakers on y = 196 */}
      {mode !== 'seated' && (
        <>
          <path
            d={
              isFemale
                ? `M ${cx - 18.6} ${hipY + 4} C ${cx - 20.2} ${hipY + 22}, ${cx - 16.4} ${hipY + 46}, ${cx - 13.8} ${hipY + 66} L ${cx - 14.4} 189 L ${cx - 7.4} 189 L ${cx - 5.8} ${hipY + 62} C ${cx - 3.6} ${hipY + 42}, ${cx - 2.0} ${hipY + 24}, ${cx - 1.4} ${hipY + 8} Z`
                : `M ${cx - 17.2} ${hipY + 4} C ${cx - 21.4} ${hipY + 26}, ${cx - 18.8} ${hipY + 46}, ${cx - 16.0} ${hipY + 66} L ${cx - 16.6} 189 L ${cx - 7.2} 189 L ${cx - 5.2} ${hipY + 62} C ${cx - 3.2} ${hipY + 42}, ${cx - 2} ${hipY + 24}, ${cx - 1.5} ${hipY + 8} Z`
            }
            fill={`url(#${legFill})`}
            stroke="#52525B"
            strokeOpacity={mode === 'hinged' ? 0.52 : 0.78}
            strokeWidth="1.0"
            strokeLinejoin="round"
          />
          <path
            d={
              isFemale
                ? `M ${cx + 18.6} ${hipY + 4} C ${cx + 20.2} ${hipY + 22}, ${cx + 16.4} ${hipY + 46}, ${cx + 13.8} ${hipY + 66} L ${cx + 14.4} 189 L ${cx + 7.4} 189 L ${cx + 5.8} ${hipY + 62} C ${cx + 3.6} ${hipY + 42}, ${cx + 2.0} ${hipY + 24}, ${cx + 1.4} ${hipY + 8} Z`
                : `M ${cx + 17.2} ${hipY + 4} C ${cx + 21.4} ${hipY + 26}, ${cx + 18.8} ${hipY + 46}, ${cx + 16.0} ${hipY + 66} L ${cx + 16.6} 189 L ${cx + 7.2} 189 L ${cx + 5.2} ${hipY + 62} C ${cx + 3.2} ${hipY + 42}, ${cx + 2} ${hipY + 24}, ${cx + 1.5} ${hipY + 8} Z`
            }
            fill={`url(#${legFill})`}
            stroke="#52525B"
            strokeOpacity={mode === 'hinged' ? 0.52 : 0.78}
            strokeWidth="1.0"
            strokeLinejoin="round"
          />

          {/* Crisp Front-Facing Athletic Gym Trainers Flush on Gym Floor y = 196 */}
          <g>
            <path
              d={
                isFemale
                  ? `M ${cx - 18.5} 188.5 H ${cx - 6.2} C ${cx - 4.8} 188.5, ${cx - 4.4} 192.5, ${cx - 5.6} 194.5 H ${cx - 21.2} C ${cx - 22.5} 192.5, ${cx - 20.8} 188.5, ${cx - 18.5} 188.5 Z`
                  : `M ${cx - 20} 188 H ${cx - 6} C ${cx - 4.5} 188, ${cx - 4} 192.5, ${cx - 5.5} 194.5 H ${cx - 23} C ${cx - 24.5} 192.5, ${cx - 22.5} 188, ${cx - 20} 188 Z`
              }
              fill="#1E2028"
              stroke="#64748B"
              strokeOpacity="0.72"
              strokeWidth="0.95"
            />
            <rect x={cx - (isFemale ? 21.6 : 23.5)} y="193.5" width={isFemale ? 16.5 : 18.5} height="2.5" rx="1" fill="#27272E" stroke="#94A3B8" strokeOpacity="0.58" strokeWidth="0.85" />

            <path
              d={
                isFemale
                  ? `M ${cx + 6.2} 188.5 H ${cx + 18.5} C ${cx + 20.8} 188.5, ${cx + 22.5} 192.5, ${cx + 21.2} 194.5 H ${cx + 5.6} C ${cx + 4.4} 192.5, ${cx + 4.8} 188.5, ${cx + 6.2} 188.5 Z`
                  : `M ${cx + 6} 188 H ${cx + 20} C ${cx + 22.5} 188, ${cx + 24.5} 192.5, ${cx + 23} 194.5 H ${cx + 5.5} C ${cx + 4} 192.5, ${cx + 4.5} 188, ${cx + 6} 188 Z`
              }
              fill="#1E2028"
              stroke="#64748B"
              strokeOpacity="0.72"
              strokeWidth="0.95"
            />
            <rect x={cx + (isFemale ? 5.1 : 5)} y="193.5" width={isFemale ? 16.5 : 18.5} height="2.5" rx="1" fill="#27272E" stroke="#94A3B8" strokeOpacity="0.58" strokeWidth="0.85" />
          </g>
        </>
      )}

      <path
        d={torsoPath}
        fill={`url(#${ctx.bodyGrad})`}
        stroke="#52525B"
        strokeOpacity="0.82"
        strokeWidth="1.05"
        strokeLinejoin="round"
      />

      {/* Subtle Front Clavicle & Gender-Specific Torso Contour */}
      <path
        d={`M ${cx - (isFemale ? 11.5 : 19)} ${shoulderY + (isFemale ? 3.2 : 2)} Q ${cx - 6.2} ${shoulderY + (isFemale ? 4.8 : 4)} ${cx - 1.5} ${shoulderY + 2.8} M ${cx + (isFemale ? 11.5 : 19)} ${shoulderY + (isFemale ? 3.2 : 2)} Q ${cx + 6.2} ${shoulderY + (isFemale ? 4.8 : 4)} ${cx + 1.5} ${shoulderY + 2.8}`}
        stroke="#71717A"
        strokeOpacity="0.34"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
      />
      {isFemale && (
        <path
          d={`M ${cx - effShoulderW * 0.72} ${shoulderY + h * 0.35} C ${cx - effShoulderW * 0.44} ${shoulderY + h * 0.45}, ${cx - 3.2} ${shoulderY + h * 0.43}, ${cx} ${shoulderY + h * 0.38} C ${cx + 3.2} ${shoulderY + h * 0.43}, ${cx + effShoulderW * 0.44} ${shoulderY + h * 0.45}, ${cx + effShoulderW * 0.72} ${shoulderY + h * 0.35}`}
          stroke="#94A3B8"
          strokeOpacity="0.32"
          strokeWidth="0.82"
          strokeLinecap="round"
          fill="none"
          pointerEvents="none"
        />
      )}

      <g clipPath={`url(#front-torso-${clipId})`}>
        {trapP && (
          <g>
            <path
              d={`M ${cx - (isFemale ? 13.5 : 22)} ${shoulderY + (isFemale ? 3.5 : 2)} Q ${cx} ${shoulderY - (isFemale ? 7 : 10)} ${cx + (isFemale ? 13.5 : 22)} ${shoulderY + (isFemale ? 3.5 : 2)} L ${cx + (isFemale ? 8.5 : 10)} ${shoulderY + 12} H ${cx - (isFemale ? 8.5 : 10)} Z`}
              fill={trapP.fill}
              opacity={trapP.opacity}
              filter={trapP.filter}
            />
            <path
              d={`M ${cx - (isFemale ? 9 : 11)} ${shoulderY + 2} L ${cx - 3} ${shoulderY + 7} M ${cx + (isFemale ? 9 : 11)} ${shoulderY + 2} L ${cx + 3} ${shoulderY + 7}`}
              stroke={STUDIO_STRIATION}
              strokeWidth="0.72"
              strokeLinecap="round"
            />
          </g>
        )}
        {deltP && (
          <g>
            <ellipse cx={cx - effShoulderW + 2.5} cy={shoulderY + 8} rx={isFemale ? 6.2 : 10.5} ry={isFemale ? 7.4 : 10.8} fill={deltP.fill} opacity={deltP.opacity} filter={deltP.filter} />
            <ellipse cx={cx + effShoulderW - 2.5} cy={shoulderY + 8} rx={isFemale ? 6.2 : 10.5} ry={isFemale ? 7.4 : 10.8} fill={deltP.fill} opacity={deltP.opacity} filter={deltP.filter} />
            <path
              d={`M ${cx - effShoulderW + 2.5} ${shoulderY + 2} L ${cx - effShoulderW + 1} ${shoulderY + 12} M ${cx + effShoulderW - 2.5} ${shoulderY + 2} L ${cx + effShoulderW - 1} ${shoulderY + 12}`}
              stroke={STUDIO_STRIATION}
              strokeWidth="0.72"
              strokeLinecap="round"
            />
          </g>
        )}
      </g>

      {/* Smooth Tapered S-Curved Athletic Ponytail Peeking Cleanly Behind Crown (Female Front View) */}
      {isFemale && (
        <g>
          <path
            d={`M ${cx + 2.2} ${shoulderY - 31.4} C ${cx + 9.2} ${shoulderY - 35.6}, ${cx + 15.6} ${shoulderY - 30.2}, ${cx + 13.8} ${shoulderY - 22.0} C ${cx + 12.6} ${shoulderY - 17.6}, ${cx + 15.8} ${shoulderY - 13.8}, ${cx + 14.4} ${shoulderY - 10.2} C ${cx + 10.8} ${shoulderY - 12.4}, ${cx + 9.4} ${shoulderY - 16.6}, ${cx + 9.6} ${shoulderY - 21.2} C ${cx + 9.8} ${shoulderY - 25.8}, ${cx + 7.2} ${shoulderY - 28.8}, ${cx + 2.2} ${shoulderY - 29.8} Z`}
            fill={`url(#${ctx.bodyGrad})`}
            stroke="#52525B"
            strokeOpacity="0.82"
            strokeWidth="0.95"
            strokeLinejoin="round"
          />
          <ellipse
            cx={cx + 5.0}
            cy={shoulderY - 31.0}
            rx="1.8"
            ry="1.25"
            transform={`rotate(-26 ${cx + 5.0} ${shoulderY - 31.0})`}
            fill="#FF4500"
            fillOpacity="0.88"
          />
        </g>
      )}

      {/* Smooth Faceless Front Head Silhouette (Zero Protruding Ear Nubs or Facial Lines) */}
      <path
        d={
          isFemale
            ? `M ${cx} ${shoulderY - 31.8} C ${cx + 5.6} ${shoulderY - 31.8}, ${cx + 8.2} ${shoulderY - 28.0}, ${cx + 8.2} ${shoulderY - 21.4} C ${cx + 8.2} ${shoulderY - 16.0}, ${cx + 5.4} ${shoulderY - 11.4}, ${cx + 2.2} ${shoulderY - 9.6} C ${cx + 0.9} ${shoulderY - 8.9}, ${cx - 0.9} ${shoulderY - 8.9}, ${cx - 2.2} ${shoulderY - 9.6} C ${cx - 5.4} ${shoulderY - 11.4}, ${cx - 8.2} ${shoulderY - 16.0}, ${cx - 8.2} ${shoulderY - 21.4} C ${cx - 8.2} ${shoulderY - 28.0}, ${cx - 5.6} ${shoulderY - 31.8}, ${cx} ${shoulderY - 31.8} Z`
            : `M ${cx} ${shoulderY - 32.4} C ${cx + 6.2} ${shoulderY - 32.4}, ${cx + 9.0} ${shoulderY - 28.4}, ${cx + 8.9} ${shoulderY - 21.4} C ${cx + 8.8} ${shoulderY - 15.8}, ${cx + 6.2} ${shoulderY - 11.2}, ${cx + 2.8} ${shoulderY - 9.4} C ${cx + 1.2} ${shoulderY - 8.6}, ${cx - 1.2} ${shoulderY - 8.6}, ${cx - 2.8} ${shoulderY - 9.4} C ${cx - 6.2} ${shoulderY - 11.2}, ${cx - 8.8} ${shoulderY - 15.8}, ${cx - 8.9} ${shoulderY - 21.4} C ${cx - 9.0} ${shoulderY - 28.4}, ${cx - 6.2} ${shoulderY - 32.4}, ${cx} ${shoulderY - 32.4} Z`
        }
        fill={`url(#${ctx.bodyGrad})`}
        stroke="#52525B"
        strokeOpacity="0.84"
        strokeWidth="1.0"
        strokeLinejoin="round"
      />
    </g>
  );
};

// ================= CLEAN 3D-STYLED EQUIPMENT PROPS =================

const HexDumbbell3D: React.FC<{
  mode: 'horizontal' | 'neutral' | 'cupped';
  angleDeg?: number;
  scale?: number;
}> = ({ mode, angleDeg = 0, scale = 1 }) => {
  if (mode === 'neutral') {
    return (
      <g transform={`rotate(${angleDeg}) scale(${scale})`}>
        <polygon
          points="-5,-10 5,-10 9.5,-3 9.5,3 5,10 -5,10 -9.5,3 -9.5,-3"
          fill="#1E293B"
          stroke="#CBD5E1"
          strokeWidth="1.35"
          strokeLinejoin="round"
        />
        <polygon
          points="-3,-6.2 3,-6.2 5.8,-2 5.8,2 3,6.2 -3,6.2 -5.8,2 -5.8,-2"
          fill="#141418"
          stroke="#FF4500"
          strokeWidth="1.2"
        />
        <circle cx={0} cy={0} r={2.2} fill="#E4E4E7" />
      </g>
    );
  }

  if (mode === 'cupped') {
    return (
      <g transform={`rotate(${angleDeg}) scale(${scale})`}>
        <line x1="0" y1="-13" x2="0" y2="13" stroke="#E4E4E7" strokeWidth="3.6" strokeLinecap="round" />
        <polygon points="-10,-15 10,-15 12,-9 10,-6 -10,-6 -12,-9" fill="#18181B" stroke="#CBD5E1" strokeWidth="1.25" strokeLinejoin="round" />
        <line x1="-8" y1="-10.5" x2="8" y2="-10.5" stroke="#FF4500" strokeWidth="1.6" />
        <polygon points="-10,6 10,6 12,10 10,15 -10,15 -12,10" fill="#18181B" stroke="#CBD5E1" strokeWidth="1.25" strokeLinejoin="round" />
        <line x1="-8" y1="10.5" x2="8" y2="10.5" stroke="#FF4500" strokeWidth="1.6" />
      </g>
    );
  }

  return (
    <g transform={`rotate(${angleDeg}) scale(${scale})`}>
      <line x1="-13" y1="0" x2="13" y2="0" stroke="#F4F4F5" strokeWidth="3.6" strokeLinecap="round" />
      <polygon points="-17,-7.5 -10.5,-8.5 -8.5,-5.5 -8.5,5.5 -10.5,8.5 -17,7.5 -19,4.5 -19,-4.5" fill="#18181B" stroke="#CBD5E1" strokeWidth="1.2" strokeLinejoin="round" />
      <line x1="-13.5" y1="-6.2" x2="-13.5" y2="6.2" stroke="#FF4500" strokeWidth="1.7" />
      <polygon points="10.5,-8.5 17,-7.5 19,-4.5 19,4.5 17,7.5 10.5,8.5 8.5,5.5 8.5,-5.5" fill="#18181B" stroke="#CBD5E1" strokeWidth="1.2" strokeLinejoin="round" />
      <line x1="13.5" y1="-6.2" x2="13.5" y2="6.2" stroke="#FF4500" strokeWidth="1.7" />
    </g>
  );
};

/**
 * Unmistakable Vertical / Neutral-Grip Hammer Dumbbell showing both top and bottom
 * 3D hex weight plates, metallic knurled center shaft, and thumbs-up neutral orientation.
 */
const HammerDumbbell3D: React.FC<{
  angleDeg?: number;
  scale?: number;
  backLayer?: boolean;
}> = ({ angleDeg = 0, scale = 1, backLayer = false }) => (
  <g transform={`rotate(${angleDeg}) scale(${scale})`} opacity={backLayer ? 0.55 : 1}>
    {/* Machined steel center handle shaft */}
    <rect
      x="-2.4"
      y="-11"
      width="4.8"
      height="22"
      rx="1.6"
      fill={backLayer ? '#64748B' : '#E2E8F0'}
      stroke="#0F172A"
      strokeWidth="0.9"
    />

    {/* Top Hex Weight Plate (Thumb-Up Side) */}
    <polygon
      points="-8.8,-17.5 8.8,-17.5 10.8,-14 9.5,-8.8 -9.5,-8.8 -10.8,-14"
      fill={backLayer ? '#131A26' : '#1E293B'}
      stroke={backLayer ? '#64748B' : '#CBD5E1'}
      strokeWidth="1.35"
      strokeLinejoin="round"
    />
    <ellipse
      cx="0"
      cy="-16.8"
      rx="7.6"
      ry="2.1"
      fill={backLayer ? '#1E293B' : '#334155'}
      stroke={backLayer ? '#64748B' : '#E2E8F0'}
      strokeOpacity="0.8"
      strokeWidth="0.95"
    />
    <line
      x1="-8.2"
      y1="-12.2"
      x2="8.2"
      y2="-12.2"
      stroke="#FF4500"
      strokeWidth="2.1"
      strokeLinecap="round"
    />

    {/* Bottom Hex Weight Plate (Pinky Side) */}
    <polygon
      points="-9.5,8.8 9.5,8.8 10.8,14 8.8,17.5 -8.8,17.5 -10.8,14"
      fill={backLayer ? '#131317' : '#18181B'}
      stroke={backLayer ? '#64748B' : '#CBD5E1'}
      strokeWidth="1.35"
      strokeLinejoin="round"
    />
    <ellipse
      cx="0"
      cy="16.8"
      rx="7.6"
      ry="2.1"
      fill="#0D0D0F"
      stroke={backLayer ? '#64748B' : '#94A3B8'}
      strokeOpacity="0.7"
      strokeWidth="0.9"
    />
    <line
      x1="-8.2"
      y1="12.2"
      x2="8.2"
      y2="12.2"
      stroke="#FF4500"
      strokeWidth="2.1"
      strokeLinecap="round"
    />

    {/* Neutral Thumbs-Up Hand Grip Wrap over Center Shaft */}
    {!backLayer && (
      <g>
        <rect
          x="-4.6"
          y="-4.6"
          width="9.2"
          height="9.6"
          rx="3.4"
          fill="#27272A"
          stroke="#E4E4E7"
          strokeWidth="1.2"
        />
        {/* Thumb pointing up toward top weight plate */}
        <path
          d="M -2.2 -4.2 C -2.2 -7.4, 2.2 -7.4, 2.2 -4.2"
          fill="#3F3F46"
          stroke="#F4F4F5"
          strokeWidth="1.15"
          strokeLinecap="round"
        />
      </g>
    )}
  </g>
);

const OlympicBarbellSide3D: React.FC<{ r?: number }> = ({ r = 16.5 }) => (
  <g>
    <circle cx={0} cy={0} r={r} fill="#141418" stroke="#E4E4E7" strokeWidth="2.2" />
    <circle cx={0} cy={0} r={r - 2.8} fill="none" stroke="#FF4500" strokeOpacity="0.9" strokeWidth="2" />
    <circle cx={0} cy={0} r={r * 0.54} fill="#1F1F26" stroke="#94A3B8" strokeOpacity="0.7" strokeWidth="1.1" />
    <circle cx={0} cy={0} r={4} fill="#FACC15" stroke="#0D0D0F" strokeWidth="1.2" />
  </g>
);

const OlympicBarbellFront3D: React.FC<{ y: number; x1?: number; x2?: number; plateH?: number }> = ({
  y,
  x1 = 114,
  x2 = 246,
  plateH = 26,
}) => (
  <g>
    <line x1={x1 - 12} y1={y} x2={x2 + 12} y2={y} stroke="#E4E4E7" strokeWidth="4.2" strokeLinecap="round" />
    <rect x={x1} y={y - plateH / 2} width="8" height={plateH} rx="2" fill="#991B1B" stroke="#FF6B35" strokeWidth="1.2" />
    <rect x={x1 + 9} y={y - plateH * 0.38} width="5" height={plateH * 0.76} rx="1.5" fill="#27272A" stroke="#E4E4E7" strokeWidth="1" />
    <rect x={x2 - 8} y={y - plateH / 2} width="8" height={plateH} rx="2" fill="#991B1B" stroke="#FF6B35" strokeWidth="1.2" />
    <rect x={x2 - 14} y={y - plateH * 0.38} width="5" height={plateH * 0.76} rx="1.5" fill="#27272A" stroke="#E4E4E7" strokeWidth="1" />
  </g>
);

const CableDHandle3D: React.FC<{ angleDeg?: number }> = ({ angleDeg = 0 }) => (
  <g transform={`rotate(${angleDeg})`}>
    <path d="M -2 -6.5 L 7 0 L -2 6.5" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <rect x="-4.5" y="-7.5" width="4.5" height="15" rx="2" fill="#18181B" stroke="#E4E4E7" strokeWidth="1.2" />
    <circle cx="8" cy="0" r="2.3" fill="#FACC15" stroke="#E4E4E7" strokeWidth="0.8" />
  </g>
);

// ================= MASTER BIOMECHANICAL SCENE RENDERER (27/27 VERIFIED) =================

const StudioBiomechanicalScene: React.FC<{
  exercise: Exercise;
  gender: AthleteGender;
  p: number;
  isPeakHold: boolean;
  dashOffset: number;
}> = ({ exercise, gender, p, isPeakHold, dashOffset }) => {
  const uid = useId().replace(/:/g, '');
  const bodyGrad = `studio-body-${uid}`;
  const backGrad = `studio-back-${uid}`;
  const primaryGrad = `studio-primary-${uid}`;
  const secondaryGrad = `studio-secondary-${uid}`;
  const voltGlow = `studio-volt-${uid}`;
  const cobaltGlow = `studio-cobalt-${uid}`;
  const arrowId = `studio-arrow-${uid}`;

  const ctx: StudioCtx = {
    uid,
    gender,
    bodyGrad,
    backGrad,
    primaryGrad,
    secondaryGrad,
    voltGlow,
    cobaltGlow,
    voltAlpha: isPeakHold ? 0.98 : 0.56 + p * 0.42,
    cobaltAlpha: isPeakHold ? 0.85 : 0.5 + p * 0.3,
  };

  const renderTrajectory = (d: string) => (
    <path
      d={d}
      stroke="#FACC15"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeDasharray="6 4.5"
      strokeDashoffset={dashOffset}
      markerEnd={`url(#${arrowId})`}
      fill="none"
      opacity="0.94"
    />
  );

  const isTopDown = exercise.id === 'cable-chest-fly';

  const renderExercise = () => {
    switch (exercise.id) {
      // ==================== CHEST (4) ====================
      case 'barbell-bench-press':
      case 'close-grip-bench-press': {
        const isCloseGrip = exercise.id === 'close-grip-bench-press';
        const shoulder = { x: 130, y: 126 };
        const hip = { x: 196, y: 130 };
        const handTarget = {
          x: lerp(isCloseGrip ? 154 : 150, 134, p),
          y: lerp(104, 56, p),
        };
        const arm = solveTwoBoneIK(shoulder.x, shoulder.y, handTarget.x, handTarget.y, 38, 36, 1);
        const leg = solveTwoBoneIK(hip.x, hip.y, 248, GROUNDED_ANKLE_Y, 44, 44, -1);

        return (
          <g>
            {/* Flat 0° Bench + Rack Upright */}
            <path d="M98 44V196" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
            <path d="M91 74H107" stroke="#64748B" strokeWidth="3.2" strokeLinecap="round" />
            <rect x="92" y="142" width="132" height="12" rx="4" fill="#18202C" stroke="#475569" strokeWidth="1.4" />
            <path d="M110 154V196M204 154V196" stroke="#334155" strokeWidth="4.5" strokeLinecap="round" />

            <UnifiedLeg p0={leg.p0} p1={leg.p1} p2={leg.p2} quadSide={-1} ctx={ctx} />
            <UnifiedSideTorso
              sx={shoulder.x}
              sy={shoulder.y}
              hx={hip.x}
              hy={hip.y}
              chestSide={-1}
              chest={isCloseGrip ? 'secondary' : 'primary'}
              ctx={ctx}
            />

            {renderTrajectory('M 158 102 Q 152 76 142 54')}

            <UnifiedArm
              p0={arm.p0}
              p1={arm.p1}
              p2={arm.p2}
              tricepRole={isCloseGrip ? 'primary' : 'secondary'}
              deltRole="secondary"
              bicepSide={-1}
              ctx={ctx}
              handProp={<OlympicBarbellSide3D r={16} />}
            />
          </g>
        );
      }

      case 'incline-dumbbell-press': {
        const shoulder = { x: 136, y: 98 };
        const hip = { x: 184, y: 142 };
        const handTarget = { x: lerp(158, 146, p), y: lerp(86, 28, p) };
        const arm = solveTwoBoneIK(shoulder.x, shoulder.y, handTarget.x, handTarget.y, 38, 36, 1);
        const leg = solveTwoBoneIK(hip.x, hip.y, 240, GROUNDED_ANKLE_Y, 44, 42, -1);

        return (
          <g>
            {/* 35° Incline Bench */}
            <path d="M104 92L174 156H216" stroke="#18202C" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M104 92L174 156H216" stroke="#475569" strokeWidth="1.4" fill="none" />
            <path d="M132 126L114 196M180 162V196M206 162V196" stroke="#334155" strokeWidth="4.5" strokeLinecap="round" />
            <text x="148" y="151" fill="#FACC15" fontSize="9.5" fontWeight="700" opacity="0.88">
              35°
            </text>

            <UnifiedLeg p0={leg.p0} p1={leg.p1} p2={leg.p2} quadSide={-1} ctx={ctx} />
            <UnifiedSideTorso sx={shoulder.x} sy={shoulder.y} hx={hip.x} hy={hip.y} chestSide={-1} chest="primary" ctx={ctx} />

            {renderTrajectory('M 184 86 L 174 30')}

            <UnifiedArm
              p0={arm.p0}
              p1={arm.p1}
              p2={arm.p2}
              tricepRole="secondary"
              deltRole="secondary"
              bicepSide={-1}
              ctx={ctx}
              handProp={<HexDumbbell3D mode="horizontal" angleDeg={lerp(12, 0, p)} />}
            />
          </g>
        );
      }

      case 'cable-chest-fly': {
        // CLEAN TOP-DOWN 3/4 OVERHEAD ARC — smooth hug-a-tree inward sweep, cables 100% welded to D-handles!
        const isFemale = ctx.gender === 'female';
        const cx = 180;
        const torsoY = 140;
        const shOffset = isFemale ? 24 : 33;
        const lSh = { x: cx - shOffset, y: torsoY };
        const rSh = { x: cx + shOffset, y: torsoY };

        const lUpperDeg = lerp(-174, -112, p);
        const lLowerDeg = lUpperDeg + 26;
        const rUpperDeg = lerp(-6, -68, p);
        const rLowerDeg = rUpperDeg - 26;

        const lArm = solveTwoBoneFK(lSh.x, lSh.y, 40, lUpperDeg, 36, lLowerDeg);
        const rArm = solveTwoBoneFK(rSh.x, rSh.y, 40, rUpperDeg, 36, rLowerDeg);

        const lPulley = { x: 46, y: 150 };
        const rPulley = { x: 314, y: 150 };

        const lCableRad = Math.atan2(lPulley.y - lArm.p2.y, lPulley.x - lArm.p2.x);
        const rCableRad = Math.atan2(rPulley.y - rArm.p2.y, rPulley.x - rArm.p2.x);
        const lHandleDeg = (lCableRad * 180) / Math.PI;
        const rHandleDeg = (rCableRad * 180) / Math.PI;

        const lRing = { x: lArm.p2.x + Math.cos(lCableRad) * 8, y: lArm.p2.y + Math.sin(lCableRad) * 8 };
        const rRing = { x: rArm.p2.x + Math.cos(rCableRad) * 8, y: rArm.p2.y + Math.sin(rCableRad) * 8 };

        const pecP = getMusclePaint('primary', ctx);
        const deltP = getMusclePaint('secondary', ctx);

        return (
          <g>
            {/* Left & Right Cable Towers */}
            <rect x="28" y="134" width="22" height="32" rx="4" fill="#18202C" stroke="#475569" strokeWidth="1.5" />
            <rect x="310" y="134" width="22" height="32" rx="4" fill="#18202C" stroke="#475569" strokeWidth="1.5" />
            <circle cx={lPulley.x} cy={lPulley.y} r="6" fill="#1E293B" stroke="#94A3B8" strokeWidth="1.4" />
            <circle cx={rPulley.x} cy={rPulley.y} r="6" fill="#1E293B" stroke="#94A3B8" strokeWidth="1.4" />

            {/* Staggered Grounded Trainers (Top-Down) */}
            <ellipse cx={cx - 14} cy={170} rx="7.5" ry="13" fill="#111827" stroke="#64748B" strokeWidth="1.2" />
            <ellipse cx={cx + 16} cy={156} rx="7.5" ry="13" fill="#111827" stroke="#64748B" strokeWidth="1.2" />

            {/* Live Welded Steel Cables */}
            <line x1={lPulley.x} y1={lPulley.y} x2={lRing.x} y2={lRing.y} stroke="#CBD5E1" strokeWidth="2.1" />
            <line x1={rPulley.x} y1={rPulley.y} x2={rRing.x} y2={rRing.y} stroke="#CBD5E1" strokeWidth="2.1" />

            {renderTrajectory('M 278 100 Q 262 60 204 58')}

            <UnifiedArm
              p0={lArm.p0}
              p1={lArm.p1}
              p2={lArm.p2}
              deltRole="secondary"
              bicepSide={1}
              scale={isFemale ? 0.82 : 0.97}
              ctx={ctx}
              handProp={<CableDHandle3D angleDeg={lHandleDeg} />}
            />
            <UnifiedArm
              p0={rArm.p0}
              p1={rArm.p1}
              p2={rArm.p2}
              deltRole="secondary"
              bicepSide={-1}
              scale={isFemale ? 0.82 : 0.97}
              ctx={ctx}
              handProp={<CableDHandle3D angleDeg={rHandleDeg} />}
            />

            {/* Top-Down Athletic Shoulders (Gender-Adaptive) */}
            <path
              d={
                ctx.gender === 'female'
                  ? `M ${cx - 28.5} ${torsoY + 2} C ${cx - 26.5} ${torsoY - 11.5}, ${cx - 11} ${torsoY - 15.5}, ${cx} ${torsoY - 14.2} C ${cx + 11} ${torsoY - 15.5}, ${cx + 26.5} ${torsoY - 11.5}, ${cx + 28.5} ${torsoY + 2} C ${cx + 26.5} ${torsoY + 12.5}, ${cx + 13} ${torsoY + 15.2}, ${cx} ${torsoY + 14.4} C ${cx - 13} ${torsoY + 15.2}, ${cx - 26.5} ${torsoY + 12.5}, ${cx - 28.5} ${torsoY + 2} Z`
                  : `M ${cx - 37} ${torsoY + 2} C ${cx - 35} ${torsoY - 15.5}, ${cx - 16} ${torsoY - 20}, ${cx} ${torsoY - 17.5} C ${cx + 16} ${torsoY - 20}, ${cx + 35} ${torsoY - 15.5}, ${cx + 37} ${torsoY + 2} C ${cx + 35} ${torsoY + 16.5}, ${cx + 18} ${torsoY + 19.5}, ${cx} ${torsoY + 18.2} C ${cx - 18} ${torsoY + 19.5}, ${cx - 35} ${torsoY + 16.5}, ${cx - 37} ${torsoY + 2} Z`
              }
              fill={`url(#${ctx.bodyGrad})`}
              stroke="#52525B"
              strokeOpacity="0.82"
              strokeWidth="1.05"
            />
            {pecP && (
              <g>
                <path d={`M ${cx - (ctx.gender === 'female' ? 22 : 26)} ${torsoY - 3} C ${cx - 18} ${torsoY - 14}, ${cx - 6} ${torsoY - 15}, ${cx - 2} ${torsoY - 12} L ${cx - 2} ${torsoY - 3} Z`} fill={pecP.fill} opacity={pecP.opacity} filter={pecP.filter} />
                <path d={`M ${cx + (ctx.gender === 'female' ? 22 : 26)} ${torsoY - 3} C ${cx + 18} ${torsoY - 14}, ${cx + 6} ${torsoY - 15}, ${cx + 2} ${torsoY - 12} L ${cx + 2} ${torsoY - 3} Z`} fill={pecP.fill} opacity={pecP.opacity} filter={pecP.filter} />
                <path d={`M ${cx - 20} ${torsoY - 6} Q ${cx - 11} ${torsoY - 10} ${cx - 4} ${torsoY - 8} M ${cx + 20} ${torsoY - 6} Q ${cx + 11} ${torsoY - 10} ${cx + 4} ${torsoY - 8}`} stroke={STUDIO_STRIATION} strokeWidth="0.72" strokeLinecap="round" fill="none" />
              </g>
            )}
            {deltP && (
              <g>
                <ellipse cx={cx - (ctx.gender === 'female' ? 24.5 : 31.5)} cy={torsoY - 2} rx={ctx.gender === 'female' ? 6.0 : 8.4} ry={ctx.gender === 'female' ? 7.6 : 9.8} fill={deltP.fill} opacity={deltP.opacity} filter={deltP.filter} />
                <ellipse cx={cx + (ctx.gender === 'female' ? 24.5 : 31.5)} cy={torsoY - 2} rx={ctx.gender === 'female' ? 6.0 : 8.4} ry={ctx.gender === 'female' ? 7.6 : 9.8} fill={deltP.fill} opacity={deltP.opacity} filter={deltP.filter} />
              </g>
            )}
            {/* Top-Down Flowing Tapered S-Curved Athletic Ponytail (Female) */}
            {ctx.gender === 'female' && (
              <g>
                <path
                  d={`M ${cx - 2.6} ${torsoY + 12.0} C ${cx - 5.2} ${torsoY + 16.5}, ${cx - 4.4} ${torsoY + 21.8}, ${cx - 1.2} ${torsoY + 26.2} C ${cx + 0.4} ${torsoY + 28.4}, ${cx + 1.8} ${torsoY + 29.8}, ${cx + 2.4} ${torsoY + 30.8} C ${cx + 2.8} ${torsoY + 28.2}, ${cx + 3.4} ${torsoY + 25.0}, ${cx + 4.4} ${torsoY + 21.0} C ${cx + 5.4} ${torsoY + 17.2}, ${cx + 4.2} ${torsoY + 13.8}, ${cx + 2.6} ${torsoY + 12.0} Z`}
                  fill={`url(#${ctx.bodyGrad})`}
                  stroke="#52525B"
                  strokeOpacity="0.82"
                  strokeWidth="0.95"
                  strokeLinejoin="round"
                />
                <path
                  d={`M ${cx - 0.6} ${torsoY + 14.8} C ${cx - 1.6} ${torsoY + 18.8}, ${cx - 0.4} ${torsoY + 23.2}, ${cx + 1.4} ${torsoY + 27.6}`}
                  fill="none"
                  stroke="#94A3B8"
                  strokeOpacity="0.28"
                  strokeWidth="0.7"
                  strokeLinecap="round"
                />
                <ellipse cx={cx} cy={torsoY + 13.2} rx="2.6" ry="1.3" fill="#FF4500" fillOpacity="0.86" />
              </g>
            )}
            {/* Smooth Minimalist Top-Down Athletic Head Silhouette */}
            <path
              d={
                ctx.gender === 'female'
                  ? `M ${cx} ${torsoY - 12.6} C ${cx + 5.4} ${torsoY - 12.2}, ${cx + 9.8} ${torsoY - 7.8}, ${cx + 10.0} ${torsoY + 0.4} C ${cx + 9.8} ${torsoY + 8.4}, ${cx + 5.4} ${torsoY + 13.4}, ${cx} ${torsoY + 13.4} C ${cx - 5.4} ${torsoY + 13.4}, ${cx - 9.8} ${torsoY + 8.4}, ${cx - 10.0} ${torsoY + 0.4} C ${cx - 9.8} ${torsoY - 7.8}, ${cx - 5.4} ${torsoY - 12.2}, ${cx} ${torsoY - 12.6} Z`
                  : `M ${cx} ${torsoY - 13.4} C ${cx + 6.0} ${torsoY - 13.0}, ${cx + 10.8} ${torsoY - 8.4}, ${cx + 11.0} ${torsoY + 0.5} C ${cx + 10.8} ${torsoY + 9.0}, ${cx + 6.0} ${torsoY + 14.2}, ${cx} ${torsoY + 14.2} C ${cx - 6.0} ${torsoY + 14.2}, ${cx - 10.8} ${torsoY + 9.0}, ${cx - 11.0} ${torsoY + 0.5} C ${cx - 10.8} ${torsoY - 8.4}, ${cx - 6.0} ${torsoY - 13.0}, ${cx} ${torsoY - 13.4} Z`
              }
              fill={`url(#${ctx.bodyGrad})`}
              stroke="#52525B"
              strokeOpacity="0.86"
              strokeWidth="1.05"
            />
          </g>
        );
      }

      case 'chest-dip': {
        const dropY = lerp(24, 0, p);
        const shoulder = { x: 180, y: 54 + dropY };
        const backShoulder = { x: 188, y: 51 + dropY };
        const hip = { x: 158, y: 108 + dropY };
        const nearBarHand = { x: 174, y: 118 };
        const farBarHand = { x: 186, y: 112 };

        const nearArm = solveTwoBoneIK(shoulder.x, shoulder.y, nearBarHand.x, nearBarHand.y, 35, 34, 1);
        const farArm = solveTwoBoneIK(backShoulder.x, backShoulder.y, farBarHand.x, farBarHand.y, 35, 34, 1);
        const leg = solveTwoBoneFK(hip.x, hip.y, 34, 96, 32, 146);
        const backLeg = solveTwoBoneFK(hip.x + 5, hip.y - 2, 34, 92, 32, 140);

        return (
          <g>
            {/* Back Parallel Bar */}
            <path d="M148 112H224M160 112V196M214 112V196" stroke="#1E293B" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="150" y1="112" x2="222" y2="112" stroke="#64748B" strokeWidth="2.2" strokeLinecap="round" />

            <UnifiedArm p0={farArm.p0} p1={farArm.p1} p2={farArm.p2} backLayer scale={0.93} ctx={ctx} />
            <UnifiedLeg p0={backLeg.p0} p1={backLeg.p1} p2={backLeg.p2} backLayer quadSide={-1} footAngleDeg={38} ctx={ctx} />
            <UnifiedLeg p0={leg.p0} p1={leg.p1} p2={leg.p2} quadSide={-1} footAngleDeg={42} ctx={ctx} />
            <UnifiedSideTorso sx={shoulder.x} sy={shoulder.y} hx={hip.x} hy={hip.y} chestSide={-1} chest="primary" ctx={ctx} />

            {/* Front Parallel Bar */}
            <path d="M132 118H212M146 118V196M200 118V196" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
            <line x1="136" y1="118" x2="208" y2="118" stroke="#CBD5E1" strokeWidth="2.6" strokeLinecap="round" />

            {renderTrajectory('M 232 94 L 232 54')}

            <UnifiedArm
              p0={nearArm.p0}
              p1={nearArm.p1}
              p2={nearArm.p2}
              tricepRole="secondary"
              deltRole="secondary"
              bicepSide={-1}
              ctx={ctx}
            />
          </g>
        );
      }

      // ==================== BACK (6) ====================
      case 'lat-pulldown': {
        // CRYSTAL-CLEAR 3/4 SIDE PROFILE: Athlete seated facing RIGHT with thighs locked under thigh hold-down pad,
        // torso leaning back 15°, overhead cable & wide lat bar clearly layered IN FRONT of face, pulling smoothly
        // down to upper chest with elbows driving down & back while Lats glow #FF4500.
        const pulley = { x: 204, y: 20 };
        const hip = { x: 152, y: 136 };
        const shoulder = { x: lerp(139, 134, p), y: 82 };
        const farShoulder = { x: shoulder.x + 11, y: shoulder.y - 4 };

        const knee = { x: 202, y: 141 };
        const ankle = { x: 202, y: GROUNDED_ANKLE_Y };

        // Bar center descends cleanly IN FRONT of face/chin down to upper chest
        const barCenter = { x: lerp(188, 162, p), y: lerp(34, 92, p) };
        const farHand = { x: barCenter.x + 15, y: barCenter.y - 5 };
        const nearHand = { x: barCenter.x - 15, y: barCenter.y + 6 };

        // Elbows drive smoothly downward and back behind ribcage at peak contraction
        const nearArm = solveTwoBoneIK(shoulder.x, shoulder.y, nearHand.x, nearHand.y, 32, 31, 1);
        const farArm = solveTwoBoneIK(farShoulder.x, farShoulder.y, farHand.x, farHand.y, 32, 31, 1);

        const stackRise = lerp(0, 32, p);

        return (
          <g>
            {/* Pulldown Machine Frame, Live Moving Weight Stack & Overhead Cantilever Pulley */}
            <rect x="266" y="14" width="24" height="182" rx="3" fill="#13151B" stroke="#3F3F46" strokeWidth="1.4" />
            <line x1="278" y1="22" x2="278" y2="190" stroke="#27272A" strokeWidth="2" />
            {/* Moving Iron Weight Stack Plates */}
            <g transform={`translate(0 ${-stackRise})`}>
              {[0, 1, 2, 3, 4].map((i) => (
                <rect
                  key={i}
                  x="269"
                  y={144 + i * 7}
                  width="18"
                  height="5.2"
                  rx="1.2"
                  fill={i === 0 ? '#3F3F46' : '#27272A'}
                  stroke="#52525B"
                  strokeWidth="0.8"
                />
              ))}
              <circle cx="278" cy="146.5" r="1.4" fill="#FF4500" />
            </g>
            {/* Overhead Boom + Pulley Sheave */}
            <path d="M276 18H198" stroke="#334155" strokeWidth="5.2" strokeLinecap="round" />
            <line x1="276" y1="18" x2="204" y2="18" stroke="#64748B" strokeWidth="1.8" />
            <circle cx={pulley.x} cy={pulley.y} r="6.5" fill="#141418" stroke="#94A3B8" strokeWidth="1.5" />
            <circle cx={pulley.x} cy={pulley.y} r="2.1" fill="#FACC15" />

            {/* Bench Seat & Thigh Hold-Down Vertical Stanchion */}
            <rect x="114" y="144" width="68" height="10" rx="4" fill="#181A22" stroke="#475569" strokeWidth="1.2" />
            <line x1="146" y1="154" x2="146" y2="196" stroke="#334155" strokeWidth="5.5" strokeLinecap="round" />
            <line x1="204" y1="126" x2="204" y2="196" stroke="#334155" strokeWidth="4.8" strokeLinecap="round" />
            <line x1="146" y1="176" x2="266" y2="176" stroke="#27272A" strokeWidth="4" strokeLinecap="round" />

            {/* Far Seated Leg (3/4 Depth Layer) */}
            <UnifiedLeg
              p0={{ x: hip.x + 8, y: hip.y - 3 }}
              p1={{ x: knee.x + 10, y: knee.y - 2 }}
              p2={{ x: ankle.x + 11, y: ankle.y }}
              quadSide={-1}
              backLayer
              ctx={ctx}
            />

            {/* Far Pulling Arm (3/4 Depth Layer) */}
            <UnifiedArm p0={farArm.p0} p1={farArm.p1} p2={farArm.p2} bicepSide={-1} backLayer scale={0.92} ctx={ctx} />

            {/* Near Seated Leg Locked Firmly Under Thigh Pad */}
            <UnifiedLeg p0={hip} p1={knee} p2={ankle} quadSide={-1} ctx={ctx} />

            {/* Cushioned Cylindrical Thigh Hold-Down Pad Pressing Down Over Thighs */}
            <rect x="180" y="122" width="28" height="11" rx="5.5" fill="#27272E" stroke="#94A3B8" strokeWidth="1.3" />
            <circle cx="194" cy="127.5" r="2.2" fill="#FACC15" />

            {/* 3/4 Side-Profile Torso Leaning Back 15° with Glowing 3D Blaze Orange Lats */}
            <UnifiedSideTorso
              sx={shoulder.x}
              sy={shoulder.y}
              hx={hip.x}
              hy={hip.y}
              chestSide={-1}
              lats="primary"
              upperBack="secondary"
              headAngleAdjust={8}
              ctx={ctx}
            />

            {/* FOREGROUND LAYER (Explicitly IN FRONT of Face): Taut Steel Cable + Wide 3/4 Angled Lat Bar */}
            <line x1={pulley.x} y1={pulley.y + 6} x2={barCenter.x} y2={barCenter.y} stroke="#CBD5E1" strokeWidth="2.1" />
            <path
              d={`M ${farHand.x + 6} ${farHand.y - 2} L ${barCenter.x} ${barCenter.y} L ${nearHand.x - 6} ${nearHand.y + 2}`}
              stroke="#E4E4E7"
              strokeWidth="4.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Rubber Wide Grips */}
            <line x1={farHand.x - 4} y1={farHand.y + 1.5} x2={farHand.x + 5} y2={farHand.y - 1.5} stroke="#FF4500" strokeWidth="5.2" strokeLinecap="round" />
            <line x1={nearHand.x - 5} y1={nearHand.y + 2} x2={nearHand.x + 4} y2={nearHand.y - 1.5} stroke="#FF4500" strokeWidth="5.2" strokeLinecap="round" />
            <circle cx={barCenter.x} cy={barCenter.y} r="3.2" fill="#FACC15" stroke="#0D0D0F" strokeWidth="1" />

            {/* Downward Pull Trajectory Arrow */}
            {renderTrajectory('M 226 42 L 210 92')}

            {/* Near Pulling Arm Driving Elbow Smoothly Down & Back */}
            <UnifiedArm
              p0={nearArm.p0}
              p1={nearArm.p1}
              p2={nearArm.p2}
              bicepRole="secondary"
              deltRole="secondary"
              bicepSide={-1}
              scale={0.96}
              ctx={ctx}
            />
          </g>
        );
      }

      case 'pull-up': {
        // CRYSTAL-CLEAR 3/4 SIDE PROFILE: Hanging from fixed overhead bar on clean rig,
        // entire athletic body pulls smoothly upward with a slight chest-up arch so the chin clears cleanly
        // BEHIND and ABOVE the bar (ZERO clipping through the head!) while Lats glow #FF4500.
        const farHand = { x: 196, y: 31 };
        const nearHand = { x: 176, y: 38 };

        // Entire body lifts smoothly 42px upward with an athletic chest-up arch at peak
        const shoulder = { x: lerp(172, 156, p), y: lerp(94, 52, p) };
        const farShoulder = { x: shoulder.x + 13, y: shoulder.y - 4 };
        const hip = { x: lerp(172, 174, p), y: lerp(148, 104, p) };

        // Hanging knees slightly bent & ankles neatly tucked off the gym floor (y < 196)
        const knee = { x: hip.x + lerp(5, 8, p), y: hip.y + 30 };
        const ankle = { x: knee.x - 24, y: knee.y + 7 };

        const nearArm = solveTwoBoneIK(shoulder.x, shoulder.y, nearHand.x, nearHand.y, 31, 30, 1);
        const farArm = solveTwoBoneIK(farShoulder.x, farShoulder.y, farHand.x, farHand.y, 31, 30, 1);

        return (
          <g>
            {/* Clean 3/4 Pull-Up Rig Upright & Overhead Cantilever Bracket (Completely Clear of Athlete) */}
            <line x1="232" y1="16" x2="232" y2="196" stroke="#272A36" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M214 196H252" stroke="#334155" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M232 22 L192 32 M232 48 L206 29" stroke="#334155" strokeWidth="4" strokeLinecap="round" />

            {/* Far Arm Fixed on Overhead Bar (3/4 Depth Layer) */}
            <UnifiedArm p0={farArm.p0} p1={farArm.p1} p2={farArm.p2} bicepSide={-1} backLayer scale={0.92} ctx={ctx} />

            {/* Far Hanging Leg (3/4 Depth Layer) */}
            <UnifiedLeg
              p0={{ x: hip.x + 7, y: hip.y - 2 }}
              p1={{ x: knee.x + 7, y: knee.y - 2 }}
              p2={{ x: ankle.x + 6, y: ankle.y - 2 }}
              quadSide={-1}
              backLayer
              footAngleDeg={42}
              ctx={ctx}
            />

            {/* Near Hanging Leg (Suspended Cleanly Off Floor) */}
            <UnifiedLeg
              p0={hip}
              p1={knee}
              p2={ankle}
              quadSide={-1}
              footAngleDeg={46}
              ctx={ctx}
            />

            {/* Sculpted 3/4 Side-Profile Torso Pulling Up With Slight Chest-Up Arch (Chin Clears Behind & Above Bar!) */}
            <UnifiedSideTorso
              sx={shoulder.x}
              sy={shoulder.y}
              hx={hip.x}
              hy={hip.y}
              chestSide={-1}
              lats="primary"
              upperBack="secondary"
              abs="secondary"
              headAngleAdjust={lerp(2, -6, p)}
              ctx={ctx}
            />

            {/* Fixed 3/4 Overhead Pull-Up Bar (Layered Cleanly IN FRONT of Throat/Upper Chest — ZERO Head Clipping!) */}
            <line x1="214" y1="26" x2="164" y2="42" stroke="#E4E4E7" strokeWidth="4.8" strokeLinecap="round" />
            <line x1="201" y1="30" x2="191" y2="33" stroke="#FF4500" strokeWidth="5.6" strokeLinecap="round" />
            <line x1="181" y1="36.5" x2="171" y2="39.5" stroke="#FF4500" strokeWidth="5.6" strokeLinecap="round" />
            <circle cx="214" cy="26" r="2.8" fill="#64748B" />
            <circle cx="164" cy="42" r="2.8" fill="#64748B" />

            {/* Upward Pull Trajectory Arrow */}
            {renderTrajectory('M 118 128 L 118 68')}

            {/* Near Pulling Arm Driving Elbow Cleanly Downward */}
            <UnifiedArm
              p0={nearArm.p0}
              p1={nearArm.p1}
              p2={nearArm.p2}
              bicepRole="secondary"
              deltRole="secondary"
              bicepSide={-1}
              scale={0.96}
              ctx={ctx}
            />
          </g>
        );
      }

      case 'barbell-bent-over-row': {
        const hip = { x: 152, y: 110 };
        const shoulder = { x: 198, y: 76 };
        const handTarget = { x: lerp(202, 178, p), y: lerp(142, 108, p) };
        const arm = solveTwoBoneIK(shoulder.x, shoulder.y, handTarget.x, handTarget.y, 35, 34, 1);
        const leg = solveTwoBoneIK(hip.x, hip.y, 174, GROUNDED_ANKLE_Y, 44, 44, -1);

        return (
          <g>
            <UnifiedLeg p0={leg.p0} p1={leg.p1} p2={leg.p2} quadSide={-1} ctx={ctx} />
            <UnifiedSideTorso
              sx={shoulder.x}
              sy={shoulder.y}
              hx={hip.x}
              hy={hip.y}
              chestSide={-1}
              upperBack="primary"
              lats="primary"
              lowerBack="secondary"
              ctx={ctx}
            />

            {renderTrajectory('M 228 142 L 204 106')}

            <UnifiedArm
              p0={arm.p0}
              p1={arm.p1}
              p2={arm.p2}
              bicepRole="secondary"
              bicepSide={-1}
              ctx={ctx}
              handProp={<OlympicBarbellSide3D r={16} />}
            />
          </g>
        );
      }

      case 'seated-cable-row': {
        const shoulder = { x: 214, y: 84 };
        const hip = { x: 210, y: 142 };
        const handTarget = { x: lerp(152, 196, p), y: lerp(124, 128, p) };
        const arm = solveTwoBoneIK(shoulder.x, shoulder.y, handTarget.x, handTarget.y, 38, 36, -1);
        const leg = solveTwoBoneIK(hip.x, hip.y, 124, 160, 46, 44, 1);
        const pulley = { x: 64, y: 128 };
        const cableRad = Math.atan2(pulley.y - arm.p2.y, pulley.x - arm.p2.x);
        const handleDeg = (cableRad * 180) / Math.PI;
        const ring = { x: arm.p2.x + Math.cos(cableRad) * 8, y: arm.p2.y + Math.sin(cableRad) * 8 };

        return (
          <g>
            <rect x="46" y="42" width="16" height="154" rx="3" fill="#18202C" stroke="#475569" strokeWidth="1.4" />
            <circle cx={pulley.x} cy={pulley.y} r="7" fill="#1E293B" stroke="#94A3B8" strokeWidth="1.4" />
            {/* Angled Footplate & Bench Grounded to Floor y=196 */}
            <path d="M110 144L124 180M118 164L104 196M170 154H244M184 154V196M230 154V196" stroke="#334155" strokeWidth="5" strokeLinecap="round" />

            <line x1={pulley.x} y1={pulley.y} x2={ring.x} y2={ring.y} stroke="#CBD5E1" strokeWidth="2.1" />

            {/* Left-facing shoe planted flat against angled footrest (toes pointing up-left!) */}
            <UnifiedLeg p0={leg.p0} p1={leg.p1} p2={leg.p2} quadSide={-1} footDir={-1} footAngleDeg={70} ctx={ctx} />
            <UnifiedSideTorso
              sx={shoulder.x}
              sy={shoulder.y}
              hx={hip.x}
              hy={hip.y}
              chestSide={1}
              upperBack="primary"
              lats="secondary"
              ctx={ctx}
            />

            {renderTrajectory('M 148 102 L 198 102')}

            <UnifiedArm
              p0={arm.p0}
              p1={arm.p1}
              p2={arm.p2}
              bicepRole="secondary"
              bicepSide={1}
              ctx={ctx}
              handProp={<CableDHandle3D angleDeg={handleDeg} />}
            />
          </g>
        );
      }

      case 'back-extension': {
        const hip = { x: 178, y: 120 };
        const rad = (lerp(-98, -140, p) * Math.PI) / 180;
        const shoulder = { x: hip.x + Math.cos(rad) * 56, y: hip.y + Math.sin(rad) * 56 };
        const leg = solveTwoBoneFK(hip.x, hip.y, 42, 40, 40, 40);
        const arm = solveTwoBoneIK(shoulder.x, shoulder.y, shoulder.x + 12, shoulder.y + 18, 22, 20, -1);

        return (
          <g>
            {/* 45° Roman Chair Frame + Angled Footplate */}
            <path d="M176 128L162 196M178 128L238 182M232 194L250 172" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
            <rect x="162" y="122" width="30" height="12" rx="5" fill="#18202C" stroke="#64748B" strokeWidth="1.4" transform="rotate(36 177 128)" />

            {/* Shoe sole planted flat against angled Roman Chair footplate */}
            <UnifiedLeg p0={leg.p0} p1={leg.p1} p2={leg.p2} hamRole="secondary" quadSide={1} footAngleDeg={130} ctx={ctx} />
            {/* Ankle Hold Roller Behind Achilles */}
            <circle cx="240" cy="166" r="6" fill="#27272A" fillOpacity="0.92" stroke="#E4E4E7" strokeWidth="1.2" />

            <UnifiedSideTorso
              sx={shoulder.x}
              sy={shoulder.y}
              hx={hip.x}
              hy={hip.y}
              chestSide={1}
              lowerBack="primary"
              glute="secondary"
              ctx={ctx}
            />

            {renderTrajectory('M 142 64 Q 124 72 118 92')}

            <UnifiedArm p0={arm.p0} p1={arm.p1} p2={arm.p2} scale={0.85} ctx={ctx} />
          </g>
        );
      }

      // ==================== SHOULDERS (4) ====================
      case 'overhead-press': {
        const hip = { x: 176, y: 112 };
        const shoulder = { x: 176, y: 60 };
        const handTarget = {
          x: lerp(194, 178, p) + Math.sin(Math.PI * p) * 5,
          y: lerp(66, 14, p),
        };
        const arm = solveTwoBoneIK(shoulder.x, shoulder.y, handTarget.x, handTarget.y, 32, 31, 1);
        const leg = solveTwoBoneIK(hip.x, hip.y, 176, GROUNDED_ANKLE_Y, 40, 39, -1);

        return (
          <g>
            <UnifiedLeg p0={leg.p0} p1={leg.p1} p2={leg.p2} quadSide={-1} ctx={ctx} />
            <UnifiedSideTorso sx={shoulder.x} sy={shoulder.y} hx={hip.x} hy={hip.y} chestSide={-1} abs="secondary" ctx={ctx} />

            {renderTrajectory('M 222 66 Q 226 40 214 16')}

            <UnifiedArm
              p0={arm.p0}
              p1={arm.p1}
              p2={arm.p2}
              deltRole="primary"
              tricepRole="secondary"
              bicepSide={-1}
              scale={0.94}
              ctx={ctx}
              handProp={<OlympicBarbellSide3D r={14.5} />}
            />
          </g>
        );
      }

      case 'dumbbell-lateral-raise': {
        const isFemale = ctx.gender === 'female';
        const cx = 180;
        const shoulderY = 64;
        const hipY = 120;
        const shOffset = isFemale ? 19.5 : 28.5;
        const lSh = { x: cx - shOffset, y: shoulderY + (isFemale ? 7.5 : 6) };
        const rSh = { x: cx + shOffset, y: shoulderY + (isFemale ? 7.5 : 6) };

        const liftDeg = lerp(80, 4, p);
        const elbowSoft = lerp(10, 16, p);

        const lArm = solveTwoBoneFK(lSh.x, lSh.y, 33, 180 - liftDeg, 31, 180 - liftDeg - elbowSoft);
        const rArm = solveTwoBoneFK(rSh.x, rSh.y, 33, liftDeg, 31, liftDeg + elbowSoft);

        return (
          <g>
            <UnifiedFrontBody cx={cx} shoulderY={shoulderY} hipY={hipY} mode="standing" delts="primary" traps="secondary" ctx={ctx} />
            {renderTrajectory('M 244 128 Q 272 106 270 74')}

            <UnifiedArm
              p0={lArm.p0}
              p1={lArm.p1}
              p2={lArm.p2}
              deltRole="primary"
              scale={isFemale ? 0.80 : 0.96}
              ctx={ctx}
              handProp={<HexDumbbell3D mode="horizontal" angleDeg={lerp(84, -12, p)} scale={isFemale ? 0.84 : 0.92} />}
            />
            <UnifiedArm
              p0={rArm.p0}
              p1={rArm.p1}
              p2={rArm.p2}
              deltRole="primary"
              scale={isFemale ? 0.80 : 0.96}
              ctx={ctx}
              handProp={<HexDumbbell3D mode="horizontal" angleDeg={lerp(-84, 12, p)} scale={isFemale ? 0.84 : 0.92} />}
            />
          </g>
        );
      }

      case 'face-pull': {
        const shoulder = { x: 212, y: 74 };
        const hip = { x: 208, y: 126 };
        const elbow = { x: lerp(178, 224, p), y: lerp(74, 70, p) };
        const hand = { x: lerp(146, 198, p), y: lerp(72, 52, p) };
        const leg = solveTwoBoneIK(hip.x, hip.y, 206, GROUNDED_ANKLE_Y, 34, 32, 1);
        const pulley = { x: 64, y: 66 };
        const ropeKnot = { x: hand.x - 8, y: hand.y + 4 };

        return (
          <g>
            <rect x="46" y="24" width="16" height="172" rx="3" fill="#18202C" stroke="#475569" strokeWidth="1.4" />
            <circle cx={pulley.x} cy={pulley.y} r="6.5" fill="#1E293B" stroke="#94A3B8" strokeWidth="1.4" />
            <line x1={pulley.x} y1={pulley.y} x2={ropeKnot.x} y2={ropeKnot.y} stroke="#CBD5E1" strokeWidth="2.1" />

            <UnifiedLeg p0={leg.p0} p1={leg.p1} p2={leg.p2} quadSide={1} footDir={-1} ctx={ctx} />
            <UnifiedSideTorso sx={shoulder.x} sy={shoulder.y} hx={hip.x} hy={hip.y} chestSide={1} upperBack="secondary" ctx={ctx} />

            {renderTrajectory('M 140 44 L 194 40')}

            <UnifiedArm
              p0={shoulder}
              p1={elbow}
              p2={hand}
              deltRole="primary"
              bicepRole="secondary"
              bicepSide={1}
              scale={0.94}
              ctx={ctx}
              handProp={
                <g>
                  <line x1="-8" y1="4" x2="2" y2="-4" stroke="#E4E4E7" strokeWidth="3.5" strokeLinecap="round" />
                  <circle cx="-8" cy="4" r="2.8" fill="#FACC15" />
                  <circle cx="3" cy="-5" r="2.8" fill="#FF4500" stroke="#E4E4E7" strokeWidth="1" />
                </g>
              }
            />
          </g>
        );
      }

      case 'rear-delt-dumbbell-fly': {
        const isFemale = ctx.gender === 'female';
        const cx = 180;
        const shoulderY = 82;
        const hipY = 122;
        const shOffset = isFemale ? 19.5 : 28.5;
        const lSh = { x: cx - shOffset, y: shoulderY + (isFemale ? 7.5 : 6) };
        const rSh = { x: cx + shOffset, y: shoulderY + (isFemale ? 7.5 : 6) };

        const sweepDeg = lerp(84, 8, p);
        const softBend = lerp(12, 18, p);
        const lArm = solveTwoBoneFK(lSh.x, lSh.y, 33, 180 - sweepDeg, 30, 180 - sweepDeg - softBend);
        const rArm = solveTwoBoneFK(rSh.x, rSh.y, 33, sweepDeg, 30, sweepDeg + softBend);

        return (
          <g>
            <UnifiedFrontBody cx={cx} shoulderY={shoulderY} hipY={hipY} mode="hinged" delts="primary" traps="secondary" ctx={ctx} />
            {renderTrajectory('M 242 142 Q 274 122 270 90')}

            <UnifiedArm
              p0={lArm.p0}
              p1={lArm.p1}
              p2={lArm.p2}
              deltRole="primary"
              scale={isFemale ? 0.79 : 0.95}
              ctx={ctx}
              handProp={<HexDumbbell3D mode="neutral" angleDeg={lerp(0, -18, p)} scale={isFemale ? 0.80 : 0.86} />}
            />
            <UnifiedArm
              p0={rArm.p0}
              p1={rArm.p1}
              p2={rArm.p2}
              deltRole="primary"
              scale={isFemale ? 0.79 : 0.95}
              ctx={ctx}
              handProp={<HexDumbbell3D mode="neutral" angleDeg={lerp(0, 18, p)} scale={isFemale ? 0.80 : 0.86} />}
            />
          </g>
        );
      }

      // ==================== LEGS (6) ====================
      case 'barbell-back-squat': {
        const depth = 1 - p;
        const ankle = { x: 184, y: GROUNDED_ANKLE_Y };
        const hip = { x: lerp(178, 144, depth), y: lerp(110, 146, depth) };
        const shoulder = { x: lerp(180, 174, depth), y: lerp(56, 96, depth) };
        const leg = solveTwoBoneIK(hip.x, hip.y, ankle.x, ankle.y, 44, 44, -1);
        const backLeg = solveTwoBoneIK(hip.x - 4, hip.y, ankle.x - 10, ankle.y, 44, 44, -1);
        const barPos = { x: shoulder.x - 4, y: shoulder.y - 3 };
        const arm = solveTwoBoneIK(shoulder.x, shoulder.y, barPos.x + 6, barPos.y + 4, 24, 22, 1);

        return (
          <g>
            <path d="M104 34V196M104 114H122" stroke="#334155" strokeWidth="5" strokeLinecap="round" />

            <UnifiedLeg p0={backLeg.p0} p1={backLeg.p1} p2={backLeg.p2} backLayer quadSide={-1} ctx={ctx} />
            <UnifiedLeg p0={leg.p0} p1={leg.p1} p2={leg.p2} quadRole="primary" hamRole="secondary" quadSide={-1} ctx={ctx} />
            <UnifiedSideTorso sx={shoulder.x} sy={shoulder.y} hx={hip.x} hy={hip.y} chestSide={-1} glute="secondary" abs="secondary" ctx={ctx} />

            {renderTrajectory('M 232 98 L 232 50')}

            <UnifiedArm p0={arm.p0} p1={arm.p1} p2={arm.p2} scale={0.86} ctx={ctx} handProp={<OlympicBarbellSide3D r={16} />} />
          </g>
        );
      }

      case 'romanian-deadlift': {
        const hinge = 1 - p;
        const hip = { x: lerp(176, 148, hinge), y: lerp(108, 116, hinge) };
        const torsoDeg = lerp(-90, -18, hinge);
        const rad = (torsoDeg * Math.PI) / 180;
        const shoulder = { x: hip.x + Math.cos(rad) * 56, y: hip.y + Math.sin(rad) * 56 };
        const leg = solveTwoBoneIK(hip.x, hip.y, 180, GROUNDED_ANKLE_Y, 44, 44, -1);
        const barPos = { x: lerp(188, 196, hinge), y: lerp(118, 162, hinge) };
        const arm = solveTwoBoneIK(shoulder.x, shoulder.y, barPos.x, barPos.y, 35, 35, 1);

        return (
          <g>
            <UnifiedLeg p0={leg.p0} p1={leg.p1} p2={leg.p2} hamRole="primary" quadSide={-1} ctx={ctx} />
            <UnifiedSideTorso sx={shoulder.x} sy={shoulder.y} hx={hip.x} hy={hip.y} chestSide={-1} glute="secondary" lowerBack="secondary" ctx={ctx} />

            {renderTrajectory('M 232 160 L 232 116')}

            <UnifiedArm p0={arm.p0} p1={arm.p1} p2={arm.p2} scale={0.9} ctx={ctx} handProp={<OlympicBarbellSide3D r={16} />} />
          </g>
        );
      }

      case 'leg-press': {
        // AUDITED 45° LEG PRESS: Shoe sole pressed 100% FLAT against sled plate (footAngleDeg = -126) & knees flexing toward chest!
        const shoulder = { x: 112, y: 122 };
        const hip = { x: 152, y: 162 };
        const sledShift = lerp(0, 26, p);
        const footPos = { x: 196 + sledShift, y: 118 - sledShift * 0.72 };
        const leg = solveTwoBoneIK(hip.x, hip.y, footPos.x, footPos.y, 47, 45, -1);

        return (
          <g>
            <path d="M180 156L284 78" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
            <path d="M96 116L146 172H186M116 146V196M172 172V196" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
            <path d="M96 116L146 172H182" stroke="#18202C" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />

            {/* Moving Footplate Sled + Weight Plate */}
            <g transform={`translate(${footPos.x + 8} ${footPos.y - 6}) rotate(-36)`}>
              <rect x="-4" y="-26" width="9" height="52" rx="3" fill="#1E293B" stroke="#94A3B8" strokeWidth="1.4" />
              <circle cx="18" cy="-4" r="14.5" fill="#991B1B" stroke="#FF6B35" strokeWidth="2.2" />
              <circle cx="18" cy="-4" r="3.8" fill="#FACC15" />
            </g>

            <UnifiedSideTorso sx={shoulder.x} sy={shoulder.y} hx={hip.x} hy={hip.y} chestSide={-1} glute="secondary" ctx={ctx} />
            {renderTrajectory('M 206 84 L 244 56')}

            <UnifiedLeg
              p0={leg.p0}
              p1={leg.p1}
              p2={leg.p2}
              quadRole="primary"
              hamRole="secondary"
              quadSide={1}
              footAngleDeg={-126}
              ctx={ctx}
            />
          </g>
        );
      }

      case 'lying-leg-curl': {
        // Crisp Side Profile of Prone Leg Curl Machine: athlete lies face-down flush ON TOP of bench pad (y=138),
        // hips & thighs remain completely flat and stationary, and ONLY the shins + ankle roller pad rotate upward around the knee pivot toward the glutes (zero bench clipping!).
        const shoulder = { x: 112, y: 120 };
        const hip = { x: 170, y: 124 };
        const knee = { x: 218, y: 125 };
        const shinDeg = lerp(6, -112, p);
        const rad = (shinDeg * Math.PI) / 180;
        const ankle = { x: knee.x + Math.cos(rad) * 44, y: knee.y + Math.sin(rad) * 44 };

        // Foam ankle roller sits cleanly against the back of the Achilles/ankle (dorsal side of shin)
        const roller = { x: ankle.x + Math.sin(rad) * 7.5, y: ankle.y - Math.cos(rad) * 7.5 };
        const handle = { x: 96, y: 152 };
        const arm = solveTwoBoneIK(shoulder.x, shoulder.y, handle.x, handle.y, 24, 24, -1);

        return (
          <g>
            {/* Prone Leg Curl Machine Frame & Base Grounded to FLOOR_Y = 196 */}
            <path d="M98 150V196M202 150V196M86 196H230" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
            {/* Front Grip Handle Bar */}
            <path d="M98 150L92 156" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
            <circle cx={handle.x} cy={handle.y} r="3.4" fill="#FACC15" />

            {/* Contoured Bench Pad Ending Cleanly BEFORE Knee Pivot (Zero Leg Clipping!) */}
            <rect x="86" y="138" width="126" height="13" rx="5" fill="#18202C" stroke="#64748B" strokeWidth="1.4" />
            <line x1="92" y1="141" x2="206" y2="141" stroke="#475569" strokeWidth="1.1" />

            {/* Pivoting Machine Lever Arm + Cam Directly Aligned Under Knee Joint */}
            <line x1={knee.x} y1={knee.y + 6} x2={roller.x} y2={roller.y} stroke="#64748B" strokeWidth="4.2" strokeLinecap="round" />
            <circle cx={knee.x} cy={knee.y + 6} r="5.5" fill="#1E293B" stroke="#CBD5E1" strokeWidth="1.4" />
            <circle cx={knee.x} cy={knee.y + 6} r="2" fill="#FACC15" />

            {/* Back Leg & Back Arm */}
            <UnifiedLeg
              p0={{ x: hip.x + 2, y: hip.y - 2 }}
              p1={{ x: knee.x + 2, y: knee.y - 2 }}
              p2={{ x: ankle.x + 2, y: ankle.y - 2 }}
              quadSide={1}
              backLayer
              footDir={-1}
              footAngleDeg={shinDeg - 90}
              ctx={ctx}
            />

            {/* Prone Torso Resting Flat ON TOP of Pad */}
            <UnifiedSideTorso
              sx={shoulder.x}
              sy={shoulder.y}
              hx={hip.x}
              hy={hip.y}
              chestSide={1}
              glute="secondary"
              headAngleAdjust={-14}
              ctx={ctx}
            />

            {/* Arm Gripping Front Stability Handle */}
            <UnifiedArm p0={arm.p0} p1={arm.p1} p2={arm.p2} scale={0.86} bicepSide={1} ctx={ctx} />

            {/* Smooth Upward Knee-Flexion Arc Trajectory */}
            {renderTrajectory('M 272 122 Q 266 78 218 68')}

            {/* Front Leg: Stationary Thigh on Pad + ONLY Shin Rotating Up Toward Glutes */}
            <UnifiedLeg
              p0={hip}
              p1={knee}
              p2={ankle}
              hamRole="primary"
              calfRole="secondary"
              quadSide={1}
              footDir={-1}
              footAngleDeg={shinDeg - 90}
              ctx={ctx}
            />

            {/* Foam Ankle Roller Pad Riding Cleanly Behind Achilles */}
            <circle cx={roller.x} cy={roller.y} r="7" fill="#27272A" stroke="#E4E4E7" strokeWidth="1.6" />
            <circle cx={roller.x} cy={roller.y} r="2.2" fill="#FF4500" />
          </g>
        );
      }

      case 'barbell-hip-thrust': {
        const shoulder = { x: 126, y: 118 };
        const hip = { x: lerp(175, 186, p), y: lerp(158, 118, p) };
        const ankle = { x: 234, y: GROUNDED_ANKLE_Y };
        const backAnkle = { x: 224, y: GROUNDED_ANKLE_Y - 2 };
        const leg = solveTwoBoneIK(hip.x, hip.y, ankle.x, ankle.y, 46, 44, -1);
        const backLeg = solveTwoBoneIK(hip.x - 4, hip.y - 2, backAnkle.x, backAnkle.y, 46, 44, -1);
        const arm = solveTwoBoneIK(shoulder.x, shoulder.y, hip.x - 2, hip.y - 8, 30, 28, 1);

        return (
          <g>
            {/* Padded Hip Thrust Bench */}
            <rect x="64" y="124" width="72" height="16" rx="4.5" fill="#18202C" stroke="#475569" strokeWidth="1.4" />
            <path d="M78 140V196M124 140V196" stroke="#334155" strokeWidth="5" strokeLinecap="round" />

            {/* Far Leg for Side-3/4 Depth */}
            <UnifiedLeg p0={backLeg.p0} p1={backLeg.p1} p2={backLeg.p2} quadSide={-1} backLayer ctx={ctx} />

            {/* Near Working Leg & Torso with Glowing Glutes */}
            <UnifiedLeg p0={leg.p0} p1={leg.p1} p2={leg.p2} hamRole="secondary" quadRole="secondary" quadSide={-1} ctx={ctx} />
            <UnifiedSideTorso
              sx={shoulder.x}
              sy={shoulder.y}
              hx={hip.x}
              hy={hip.y}
              chestSide={-1}
              glute="primary"
              abs="secondary"
              headAngleAdjust={lerp(6, 22, p)}
              ctx={ctx}
            />

            {renderTrajectory('M 186 106 L 186 68')}

            {/* Foam Barbell Hip Pad + Hands Guiding Loaded Olympic Barbell */}
            <ellipse cx={hip.x - 2} cy={hip.y - 8} rx="7.5" ry="5.5" fill="#27272A" stroke="#71717A" strokeWidth="1.1" />
            <UnifiedArm p0={arm.p0} p1={arm.p1} p2={arm.p2} scale={0.86} ctx={ctx} handProp={<OlympicBarbellSide3D r={15} />} />
          </g>
        );
      }

      case 'bulgarian-split-squat': {
        // Side-3/4 Bulgarian Split Squat:
        // Front foot planted flat on Gym Floor (FLOOR_Y = 196), top of rear foot (instep/laces) resting cleanly FLAT
        // on top of the padded bench surface (y = 148) with toes pointing back — never jammed vertically into the bench corner!
        const frontAnkle = { x: 214, y: GROUNDED_ANKLE_Y };
        const benchTopY = 148;
        // At footAngleDeg = 163 (dir = 1), the entire shoe instep/laces lies horizontally at y = ankle.y + 2.7 -> flush on benchTopY = 148!
        const rearFootOnBench = { x: 112, y: benchTopY - 2.7 };
        const hip = { x: lerp(182, 178, p), y: lerp(110, 144, p) };
        const shoulder = { x: lerp(188, 186, p), y: lerp(54, 90, p) };

        const frontLeg = solveTwoBoneIK(hip.x + 2, hip.y, frontAnkle.x, frontAnkle.y, 44, 42, -1);
        const rearLeg = solveTwoBoneIK(hip.x - 4, hip.y + 1, rearFootOnBench.x, rearFootOnBench.y, 42, 41, -1);

        const nearHand = { x: shoulder.x - 2, y: shoulder.y + 52 };
        const farHand = { x: shoulder.x + 12, y: shoulder.y + 50 };
        const nearArm = solveTwoBoneIK(shoulder.x - 2, shoulder.y + 3, nearHand.x, nearHand.y, 28, 26, 1);
        const farArm = solveTwoBoneIK(shoulder.x + 9, shoulder.y + 3, farHand.x, farHand.y, 28, 26, 1);

        return (
          <g>
            {/* Rear Elevation Bench (top pad surface cleanly at y = 148) */}
            <rect x="60" y={benchTopY} width="66" height="13" rx="4" fill="#18202C" stroke="#475569" strokeWidth="1.4" />
            <path d="M72 161V196M114 161V196" stroke="#334155" strokeWidth="5" strokeLinecap="round" />

            {/* Far Dumbbell Arm & Elevated Rear Leg (Instep Flat on Top of Bench Pad) */}
            <UnifiedArm
              p0={farArm.p0}
              p1={farArm.p1}
              p2={farArm.p2}
              scale={0.86}
              backLayer
              ctx={ctx}
              handProp={<HexDumbbell3D mode="horizontal" angleDeg={0} scale={0.84} />}
            />
            <UnifiedLeg
              p0={rearLeg.p0}
              p1={rearLeg.p1}
              p2={rearLeg.p2}
              quadRole="secondary"
              quadSide={-1}
              footDir={1}
              footAngleDeg={163}
              backLayer
              ctx={ctx}
            />

            {/* Primary Front Working Leg & Torso (Glutes + Quads Glowing) */}
            <UnifiedLeg
              p0={frontLeg.p0}
              p1={frontLeg.p1}
              p2={frontLeg.p2}
              quadRole="primary"
              hamRole="secondary"
              quadSide={-1}
              ctx={ctx}
            />
            <UnifiedSideTorso
              sx={shoulder.x}
              sy={shoulder.y}
              hx={hip.x}
              hy={hip.y}
              chestSide={-1}
              glute="primary"
              abs="secondary"
              ctx={ctx}
            />

            {/* Vertical Split-Squat Drive Trajectory */}
            {renderTrajectory('M 244 134 L 244 82')}

            {/* Near Dumbbell Arm */}
            <UnifiedArm
              p0={nearArm.p0}
              p1={nearArm.p1}
              p2={nearArm.p2}
              scale={0.9}
              ctx={ctx}
              handProp={<HexDumbbell3D mode="horizontal" angleDeg={0} scale={0.92} />}
            />
          </g>
        );
      }

      case 'cable-glute-kickback': {
        // Side-3/4 Standing Low Cable Glute Kickback:
        // Cable column on right (x=286), athlete faces right holding column lightly at chest height,
        // left stance leg grounded flat, working leg attached to low pulley ankle strap kicks back & up!
        const hip = { x: 184, y: 112 };
        const shoulder = { x: 204, y: 60 };
        const stanceAnkle = { x: 184, y: GROUNDED_ANKLE_Y };
        const stanceLeg = solveTwoBoneIK(hip.x + 2, hip.y, stanceAnkle.x, stanceAnkle.y, 42, 41, -1);

        // Working leg kicks backward from standing near floor to ~42° posterior glute extension
        const kickDeg = lerp(84, 134, p);
        const kickRad = (kickDeg * Math.PI) / 180;
        const thighLen = 40;
        const shinLen = 40;
        const kickKnee = {
          x: hip.x - 2 + Math.cos(kickRad) * thighLen,
          y: hip.y + Math.sin(kickRad) * thighLen,
        };
        const shinRad = kickRad - lerp(0.18, 0.08, p);
        const kickAnkle = {
          x: kickKnee.x + Math.cos(shinRad) * shinLen,
          y: kickKnee.y + Math.sin(shinRad) * shinLen,
        };

        const gripPoint = { x: 256, y: 78 };
        const nearArm = solveTwoBoneIK(shoulder.x - 2, shoulder.y + 4, gripPoint.x, gripPoint.y, 28, 28, 1);
        const farArm = solveTwoBoneIK(shoulder.x + 6, shoulder.y + 3, gripPoint.x + 2, gripPoint.y - 2, 28, 28, 1);
        const pulley = { x: 266, y: 184 };

        return (
          <g>
            {/* Cable Tower Column & Weight Stack on Right */}
            <rect x="262" y="24" width="12" height="172" rx="3" fill="#18202C" stroke="#475569" strokeWidth="1.3" />
            <rect x="276" y="42" width="30" height="154" rx="4" fill="#121722" stroke="#334155" strokeWidth="1.2" />
            {[0, 1, 2, 3, 4].map((idx) => (
              <rect
                key={idx}
                x="280"
                y={132 + idx * 10 - p * 18}
                width="22"
                height="7"
                rx="1.5"
                fill="#27272A"
                stroke="#52525B"
                strokeWidth="0.8"
              />
            ))}
            {/* Low Pulley Wheel */}
            <circle cx={pulley.x} cy={pulley.y} r="5.5" fill="#27272A" stroke="#94A3B8" strokeWidth="1.2" />

            {/* Tensioned Low Cable Line to Ankle Cuff */}
            <line
              x1={pulley.x}
              y1={pulley.y}
              x2={kickAnkle.x}
              y2={kickAnkle.y}
              stroke="#E4E4E7"
              strokeWidth="1.6"
              strokeDasharray="none"
              opacity="0.78"
            />

            {/* Far Stabilizing Arm & Stance Leg */}
            <UnifiedArm p0={farArm.p0} p1={farArm.p1} p2={farArm.p2} scale={0.86} backLayer ctx={ctx} />
            <UnifiedLeg p0={stanceLeg.p0} p1={stanceLeg.p1} p2={stanceLeg.p2} quadSide={-1} backLayer ctx={ctx} />

            {/* Torso with Glowing Primary Glutes */}
            <UnifiedSideTorso
              sx={shoulder.x}
              sy={shoulder.y}
              hx={hip.x}
              hy={hip.y}
              chestSide={-1}
              glute="primary"
              abs="secondary"
              ctx={ctx}
            />

            {/* Curved Posterior Kickback Arc Trajectory */}
            {renderTrajectory('M 164 182 Q 126 172 104 136')}

            {/* Working Kickback Leg + Ankle Cuff */}
            <UnifiedLeg
              p0={{ x: hip.x - 2, y: hip.y }}
              p1={kickKnee}
              p2={kickAnkle}
              hamRole="secondary"
              quadSide={-1}
              footAngleDeg={lerp(0, 26, p)}
              ctx={ctx}
            />
            <circle cx={kickAnkle.x} cy={kickAnkle.y} r="4.6" fill="#FF4500" stroke="#F8FAFC" strokeWidth="1.2" />

            {/* Near Stabilizing Arm Bracing on Cable Column */}
            <UnifiedArm p0={nearArm.p0} p1={nearArm.p1} p2={nearArm.p2} scale={0.9} ctx={ctx} />
          </g>
        );
      }

      case 'seated-hip-abduction': {
        // Front-3/4 Seated Hip Abduction Machine:
        // Athlete sits upright on machine seat, hands gripping side handles,
        // pressing outer thigh pads symmetrically outward to fire Glute Medius & Outer Thighs!
        const cx = 180;
        const hipY = 128;
        const spreadX = lerp(16, 48, p);
        const kneeY = lerp(144, 140, p);
        const footSpreadX = lerp(16, 36, p);
        const footY = 184;

        const glutePaint = getMusclePaint('primary', ctx);
        const outerPaint = getMusclePaint('secondary', ctx);

        return (
          <g>
            {/* Hip Abduction Machine Frame & Backrest */}
            <rect x="148" y="42" width="64" height="86" rx="10" fill="#18202C" stroke="#475569" strokeWidth="1.4" />
            <rect x="136" y="122" width="88" height="16" rx="5" fill="#1E293B" stroke="#475569" strokeWidth="1.3" />
            <path d="M148 138V196M212 138V196M130 196H230" stroke="#334155" strokeWidth="5" strokeLinecap="round" />

            {/* Side Machine Handles */}
            <path d="M138 122V100H126M222 122V100H234" stroke="#64748B" strokeWidth="3.5" strokeLinecap="round" fill="none" />

            {/* Seated Upper Body (Front View) */}
            <UnifiedFrontBody cx={cx} shoulderY={66} hipY={hipY} mode="seated" ctx={ctx} />

            {/* Arms Gripping Side Handles (Gender-Adaptive Shoulder Sockets) */}
            <UnifiedArm p0={{ x: cx - (ctx.gender === 'female' ? 18.5 : 27), y: 73 }} p1={{ x: cx - (ctx.gender === 'female' ? 32 : 36), y: 98 }} p2={{ x: 132, y: 104 }} scale={ctx.gender === 'female' ? 0.76 : 0.90} ctx={ctx} />
            <UnifiedArm p0={{ x: cx + (ctx.gender === 'female' ? 18.5 : 27), y: 73 }} p1={{ x: cx + (ctx.gender === 'female' ? 32 : 36), y: 98 }} p2={{ x: 228, y: 104 }} scale={ctx.gender === 'female' ? 0.76 : 0.90} ctx={ctx} />

            {/* Pivoting Lower Machine Arms + Footrests */}
            <line x1={cx - 18} y1={hipY + 8} x2={cx - spreadX - 10} y2={kneeY + 4} stroke="#475569" strokeWidth="4.5" strokeLinecap="round" />
            <line x1={cx + 18} y1={hipY + 8} x2={cx + spreadX + 10} y2={kneeY + 4} stroke="#475569" strokeWidth="4.5" strokeLinecap="round" />

            {/* Left & Right Abducting Thighs + Shins */}
            <g>
              {/* Left Leg */}
              <line
                x1={cx - 12}
                y1={hipY}
                x2={cx - spreadX}
                y2={kneeY}
                stroke={`url(#${ctx.bodyGrad})`}
                strokeWidth="17"
                strokeLinecap="round"
              />
              <line
                x1={cx - spreadX}
                y1={kneeY}
                x2={cx - footSpreadX}
                y2={footY}
                stroke={`url(#${ctx.bodyGrad})`}
                strokeWidth="12"
                strokeLinecap="round"
              />
              {/* Right Leg */}
              <line
                x1={cx + 12}
                y1={hipY}
                x2={cx + spreadX}
                y2={kneeY}
                stroke={`url(#${ctx.bodyGrad})`}
                strokeWidth="17"
                strokeLinecap="round"
              />
              <line
                x1={cx + spreadX}
                y1={kneeY}
                x2={cx + footSpreadX}
                y2={footY}
                stroke={`url(#${ctx.bodyGrad})`}
                strokeWidth="12"
                strokeLinecap="round"
              />

              {/* Glowing Glute Medius & Outer Hip Abductor Zones (#FF4500) */}
              {glutePaint && (
                <g fill={glutePaint.fill} opacity={glutePaint.opacity} filter={glutePaint.filter}>
                  <ellipse
                    cx={cx - 16 - spreadX * 0.32}
                    cy={hipY + 5}
                    rx="11"
                    ry="6.5"
                    transform={`rotate(${-18 - p * 14} ${cx - 16 - spreadX * 0.32} ${hipY + 5})`}
                  />
                  <ellipse
                    cx={cx + 16 + spreadX * 0.32}
                    cy={hipY + 5}
                    rx="11"
                    ry="6.5"
                    transform={`rotate(${18 + p * 14} ${cx + 16 + spreadX * 0.32} ${hipY + 5})`}
                  />
                </g>
              )}
              {outerPaint && (
                <g fill={outerPaint.fill} opacity={outerPaint.opacity * 0.85} filter={outerPaint.filter}>
                  <ellipse cx={cx - spreadX * 0.82} cy={kneeY - 2} rx="7.5" ry="5" />
                  <ellipse cx={cx + spreadX * 0.82} cy={kneeY - 2} rx="7.5" ry="5" />
                </g>
              )}

              {/* Grounded Shoes on Foot Pegs */}
              <rect x={cx - footSpreadX - 8} y={footY - 3} width="16" height="8" rx="3.5" fill="#18181B" stroke="#71717A" strokeWidth="1" />
              <rect x={cx + footSpreadX - 8} y={footY - 3} width="16" height="8" rx="3.5" fill="#18181B" stroke="#71717A" strokeWidth="1" />
            </g>

            {/* Outer Knee Cushions Pressing Outward */}
            <rect
              x={cx - spreadX - 15}
              y={kneeY - 11}
              width="10"
              height="22"
              rx="4"
              fill="#27272A"
              stroke="#FF4500"
              strokeWidth="1.4"
            />
            <rect
              x={cx + spreadX + 5}
              y={kneeY - 11}
              width="10"
              height="22"
              rx="4"
              fill="#27272A"
              stroke="#FF4500"
              strokeWidth="1.4"
            />

            {/* Symmetrical Outward Abduction Trajectories */}
            {renderTrajectory('M 148 158 Q 124 156 106 146')}
            {renderTrajectory('M 212 158 Q 236 156 254 146')}
          </g>
        );
      }

      case 'standing-calf-raise': {
        // EXACT RIGID-BODY FOREFOOT PIVOT:
        // Ball of shoe (local 14, +8) stays 100% PLANTED on calf block edge (190, 182) while heel drops & rises!
        const blockEdge = { x: 190, y: 182 };
        const footAngleDeg = lerp(-22, 32, p);
        const footRad = (footAngleDeg * Math.PI) / 180;
        const ox = 14 * Math.cos(footRad) - 8 * Math.sin(footRad);
        const oy = 14 * Math.sin(footRad) + 8 * Math.cos(footRad);
        const ankle = { x: blockEdge.x - ox, y: blockEdge.y - oy };

        const deltaY = ankle.y - 174;
        const hip = { x: ankle.x, y: 104 + deltaY };
        const shoulder = { x: ankle.x, y: 50 + deltaY };
        const leg = solveTwoBoneIK(hip.x, hip.y, ankle.x, ankle.y, 36, 35, -1);
        const arm = solveTwoBoneFK(shoulder.x, shoulder.y, 26, 72, 24, -18);

        return (
          <g>
            {/* Calf Block Seated Flush on Gym Floor y=196 */}
            <rect x="186" y="182" width="30" height="14" rx="2.5" fill="#18202C" stroke="#64748B" strokeWidth="1.4" />
            <path d="M132 32V196M132 46H188" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
            <rect x={shoulder.x - 12} y={shoulder.y - 12} width="24" height="10" rx="4" fill="#27272A" fillOpacity="0.9" stroke="#E4E4E7" strokeWidth="1.2" />

            <UnifiedLeg
              p0={leg.p0}
              p1={leg.p1}
              p2={leg.p2}
              calfRole="primary"
              quadRole="secondary"
              quadSide={-1}
              footAngleDeg={footAngleDeg}
              ctx={ctx}
            />
            <UnifiedSideTorso sx={shoulder.x} sy={shoulder.y} hx={hip.x} hy={hip.y} chestSide={-1} abs="secondary" ctx={ctx} />

            {renderTrajectory('M 232 168 L 232 132')}

            <UnifiedArm p0={arm.p0} p1={arm.p1} p2={arm.p2} scale={0.86} ctx={ctx} />
          </g>
        );
      }

      // ==================== BICEPS (4) ====================
      case 'barbell-bicep-curl': {
        const isFemale = ctx.gender === 'female';
        const cx = 180;
        const shoulderY = 64;
        const hipY = 120;
        const shOffset = isFemale ? 19.5 : 28.5;
        const elbOffset = isFemale ? 22.5 : 31.5;
        const handOffset = isFemale ? 25.5 : 35;
        const lSh = { x: cx - shOffset, y: shoulderY + (isFemale ? 7.5 : 6) };
        const rSh = { x: cx + shOffset, y: shoulderY + (isFemale ? 7.5 : 6) };

        const barY = lerp(136, 84, p);
        const lElb = { x: cx - elbOffset, y: 104 };
        const rElb = { x: cx + elbOffset, y: 104 };
        const lHand = { x: cx - handOffset, y: barY };
        const rHand = { x: cx + handOffset, y: barY };

        return (
          <g>
            <UnifiedFrontBody cx={cx} shoulderY={shoulderY} hipY={hipY} mode="standing" delts="secondary" ctx={ctx} />
            {renderTrajectory('M 272 134 L 272 84')}

            <UnifiedArm p0={lSh} p1={lElb} p2={lHand} bicepRole="primary" forearmRole="secondary" bicepSide={1} scale={isFemale ? 0.80 : 0.97} ctx={ctx} />
            <UnifiedArm p0={rSh} p1={rElb} p2={rHand} bicepRole="primary" forearmRole="secondary" bicepSide={-1} scale={isFemale ? 0.80 : 0.97} ctx={ctx} />
            <OlympicBarbellFront3D y={barY} x1={isFemale ? 124 : 116} x2={isFemale ? 236 : 244} plateH={isFemale ? 23 : 26} />
          </g>
        );
      }

      case 'hammer-curl': {
        // Side-3/4 Standing Athlete facing right, feet planted flat on Gym Floor y = 196
        const shoulder = { x: 158, y: 66 };
        const hip = { x: 160, y: 120 };

        // Upper arm strictly locked vertically against the side of the torso (elbow pinned still)
        const nearSh = { x: 156, y: 70 };
        const nearElb = { x: 156, y: 112 }; // Exact vertical upper arm (dx = 0)

        // Far-side arm for crisp Side-3/4 spatial depth
        const farSh = { x: 169, y: 69 };
        const farElb = { x: 169, y: 111 };

        // Rotate ONLY the forearm + hand around the pinned elbow pivot from 0° (down at thigh) to 130° (peak)
        const curlDeg = lerp(0, 130, p);
        const foreDeg = 90 - curlDeg; // +90° straight down -> 0° horizontal -> -40° (130° peak contraction)
        const foreRad = (foreDeg * Math.PI) / 180;
        const foreLen = 36;

        const nearHand = {
          x: nearElb.x + Math.cos(foreRad) * foreLen,
          y: nearElb.y + Math.sin(foreRad) * foreLen,
        };
        const farHand = {
          x: farElb.x + Math.cos(foreRad) * (foreLen * 0.96),
          y: farElb.y + Math.sin(foreRad) * (foreLen * 0.96),
        };

        // Grounded athletic stance (both shoes flat on Gym Floor y = 196)
        const farLeg = solveTwoBoneIK(hip.x + 8, hip.y, 174, GROUNDED_ANKLE_Y, 36, 34, -1);
        const nearLeg = solveTwoBoneIK(hip.x - 2, hip.y, 158, GROUNDED_ANKLE_Y, 36, 34, -1);

        // Hammer dumbbell orientation: neutral thumbs-up sweep from thigh hang to vertical hammer peak
        const dbAngleDeg = lerp(84, -22, p);
        const brachialisGlow = 0.42 + p * 0.58;

        return (
          <g>
            {/* Far-Side Leg & Arm for authentic Side-3/4 perspective */}
            <UnifiedLeg p0={farLeg.p0} p1={farLeg.p1} p2={farLeg.p2} quadSide={-1} backLayer ctx={ctx} />
            <UnifiedArm
              p0={farSh}
              p1={farElb}
              p2={farHand}
              bicepSide={-1}
              scale={0.9}
              backLayer
              ctx={ctx}
              handProp={<HammerDumbbell3D angleDeg={dbAngleDeg} scale={0.9} backLayer />}
            />

            {/* Near Grounded Leg + Sculpted Upright Torso */}
            <UnifiedLeg p0={nearLeg.p0} p1={nearLeg.p1} p2={nearLeg.p2} quadSide={-1} ctx={ctx} />
            <UnifiedSideTorso
              sx={shoulder.x}
              sy={shoulder.y}
              hx={hip.x}
              hy={hip.y}
              chestSide={-1}
              abs="secondary"
              ctx={ctx}
            />

            {/* Smooth Curved 0° -> 130° Trajectory Arc Concentric to Pinned Elbow */}
            {renderTrajectory('M 171 164 A 54 54 0 0 0 198 76')}

            {/* Subtle Vertical Upper-Arm Lock Guide & Pinned Elbow Pivot Indicator */}
            <line
              x1={nearSh.x}
              y1={nearSh.y + 4}
              x2={nearElb.x}
              y2={nearElb.y}
              stroke="#94A3B8"
              strokeOpacity="0.38"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />

            {/* Near Working Arm: Biceps Brachii + Brachialis (Blaze Orange-Red) & Brachioradialis (Steel Blue) */}
            <UnifiedArm
              p0={nearSh}
              p1={nearElb}
              p2={nearHand}
              bicepRole="primary"
              forearmRole="secondary"
              deltRole="secondary"
              bicepSide={-1}
              scale={0.98}
              ctx={ctx}
              handProp={<HammerDumbbell3D angleDeg={dbAngleDeg} scale={1.04} />}
            />

            {/* Distinct Sculpted Brachialis Highlight Wedge (Lower Lateral Upper Arm, Intensifies at Peak) */}
            <path
              d={`M ${nearElb.x + 2.5} ${nearElb.y - 18} C ${nearElb.x + 8.5} ${nearElb.y - 13}, ${nearElb.x + 8} ${nearElb.y - 4.5}, ${nearElb.x + 2.8} ${nearElb.y - 1.5} C ${nearElb.x + 1.2} ${nearElb.y - 6.5}, ${nearElb.x + 1.2} ${nearElb.y - 13}, ${nearElb.x + 2.5} ${nearElb.y - 18} Z`}
              fill="#FF4500"
              opacity={brachialisGlow}
              filter={`url(#${ctx.voltGlow})`}
            />

            {/* Pinned Elbow Pivot Ring (Visual Confirmation that Elbow Stays Fixed) */}
            <circle
              cx={nearElb.x}
              cy={nearElb.y}
              r="3.2"
              fill="#141418"
              stroke="#FACC15"
              strokeWidth="1.35"
              opacity="0.9"
            />
          </g>
        );
      }

      case 'incline-dumbbell-curl': {
        const shoulder = { x: 146, y: 84 };
        const hip = { x: 174, y: 142 };
        const elbow = { x: 144, y: 122 };
        const foreDeg = lerp(84, -38, p);
        const rad = (foreDeg * Math.PI) / 180;
        const hand = { x: elbow.x + Math.cos(rad) * 34, y: elbow.y + Math.sin(rad) * 34 };
        const leg = solveTwoBoneIK(hip.x, hip.y, 224, GROUNDED_ANKLE_Y, 44, 42, -1);

        return (
          <g>
            <path d="M126 70L164 156H204" stroke="#18202C" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M126 70L164 156H204" stroke="#475569" strokeWidth="1.4" fill="none" />
            <path d="M142 114L126 196M172 162V196M196 162V196" stroke="#334155" strokeWidth="4.5" strokeLinecap="round" />

            <UnifiedLeg p0={leg.p0} p1={leg.p1} p2={leg.p2} quadSide={-1} ctx={ctx} />
            <UnifiedSideTorso sx={shoulder.x} sy={shoulder.y} hx={hip.x} hy={hip.y} chestSide={-1} ctx={ctx} />
            {renderTrajectory('M 164 156 Q 194 134 184 96')}

            <UnifiedArm
              p0={shoulder}
              p1={elbow}
              p2={hand}
              bicepRole="primary"
              forearmRole="secondary"
              bicepSide={-1}
              ctx={ctx}
              handProp={<HexDumbbell3D mode="horizontal" angleDeg={lerp(10, -24, p)} scale={0.92} />}
            />
          </g>
        );
      }

      case 'preacher-curl': {
        // Crisp Side Profile of Angled Preacher Curl Bench + EZ-Bar:
        // Seated athlete leans snugly into the 45° sloped cushion with upper arms resting flat & completely stationary on top of the pad;
        // ONLY the forearms + EZ-bar rotate smoothly upward around the pinned elbow pivot.
        const shoulder = { x: 154, y: 80 };
        const hip = { x: 140, y: 140 };
        const elbow = { x: 186, y: 112 }; // Exact 45° upper arm resting flush ON TOP of sloped cushion
        const foreDeg = lerp(38, -78, p);
        const rad = (foreDeg * Math.PI) / 180;
        const hand = { x: elbow.x + Math.cos(rad) * 35, y: elbow.y + Math.sin(rad) * 35 };

        const leg = solveTwoBoneIK(hip.x, hip.y, 166, GROUNDED_ANKLE_Y, 42, 42, -1);
        const backLeg = solveTwoBoneIK(hip.x + 5, hip.y - 2, 174, GROUNDED_ANKLE_Y, 42, 42, -1);

        return (
          <g>
            {/* Preacher Bench Steel Frame + Seat Post + Front EZ-Bar Cradle Grounded to FLOOR_Y = 196 */}
            <path d="M114 196H226M136 154V196M184 128V196M184 152H216V140" stroke="#334155" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="114" y="148" width="46" height="10" rx="4" fill="#18202C" stroke="#64748B" strokeWidth="1.3" />

            {/* Back Leg & Far Arm */}
            <UnifiedLeg p0={backLeg.p0} p1={backLeg.p1} p2={backLeg.p2} quadSide={-1} backLayer ctx={ctx} />
            <UnifiedArm
              p0={{ x: shoulder.x + 6, y: shoulder.y - 2 }}
              p1={{ x: elbow.x + 6, y: elbow.y - 2 }}
              p2={{ x: hand.x + 6, y: hand.y - 2 }}
              bicepSide={-1}
              scale={0.92}
              backLayer
              ctx={ctx}
            />

            {/* Front Seated Leg (Feet Flat on Gym Floor) */}
            <UnifiedLeg p0={leg.p0} p1={leg.p1} p2={leg.p2} quadSide={-1} ctx={ctx} />

            {/* Seated Athlete Leaning Slightly Forward Against Top of Preacher Cushion */}
            <UnifiedSideTorso sx={shoulder.x} sy={shoulder.y} hx={hip.x} hy={hip.y} chestSide={-1} headAngleAdjust={8} ctx={ctx} />

            {/* Thick 45° Angled Preacher Cushion Pad Directly Beneath Stationary Upper Arm (Zero Overlap!) */}
            <path
              d="M 153 91 L 193 131 L 182 142 L 142 102 Z"
              fill="#1E293B"
              stroke="#94A3B8"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <line x1="153" y1="91" x2="193" y2="131" stroke="#E4E4E7" strokeOpacity="0.6" strokeWidth="1.2" />

            {/* Smooth Upward Curl Arc Trajectory Centered on Pinned Elbow */}
            {renderTrajectory('M 228 134 Q 232 94 202 72')}

            {/* Working Arm: Stationary Upper Arm on Cushion + ONLY Forearm & EZ-Bar Rotating Around Elbow Pivot */}
            <UnifiedArm
              p0={shoulder}
              p1={elbow}
              p2={hand}
              bicepRole="primary"
              forearmRole="secondary"
              bicepSide={-1}
              ctx={ctx}
              handProp={<OlympicBarbellSide3D r={13} />}
            />

            {/* Pinned Elbow Pivot Indicator */}
            <circle cx={elbow.x} cy={elbow.y} r="3.1" fill="#141418" stroke="#FACC15" strokeWidth="1.35" opacity="0.92" />
          </g>
        );
      }

      // ==================== TRICEPS (4) ====================
      case 'tricep-rope-pushdown': {
        const shoulder = { x: 204, y: 74 };
        const hip = { x: 208, y: 126 };
        const elbow = { x: 196, y: 112 };
        const foreDeg = lerp(202, 108, p);
        const rad = (foreDeg * Math.PI) / 180;
        const hand = { x: elbow.x + Math.cos(rad) * 34, y: elbow.y + Math.sin(rad) * 34 };
        const leg = solveTwoBoneIK(hip.x, hip.y, 206, GROUNDED_ANKLE_Y, 34, 32, 1);
        const pulley = { x: 162, y: 28 };
        const ropeTop = { x: hand.x - 4, y: hand.y - 7 };

        return (
          <g>
            <rect x="116" y="20" width="16" height="176" rx="3" fill="#18202C" stroke="#475569" strokeWidth="1.4" />
            <line x1="132" y1="28" x2="168" y2="28" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
            <circle cx={pulley.x} cy={pulley.y} r="5.8" fill="#1E293B" stroke="#94A3B8" strokeWidth="1.3" />
            <line x1={pulley.x} y1={pulley.y} x2={ropeTop.x} y2={ropeTop.y} stroke="#CBD5E1" strokeWidth="2.1" />

            <UnifiedLeg p0={leg.p0} p1={leg.p1} p2={leg.p2} quadSide={1} footDir={-1} ctx={ctx} />
            <UnifiedSideTorso sx={shoulder.x} sy={shoulder.y} hx={hip.x} hy={hip.y} chestSide={1} abs="secondary" ctx={ctx} />

            {renderTrajectory('M 148 104 Q 144 132 168 152')}

            <UnifiedArm
              p0={shoulder}
              p1={elbow}
              p2={hand}
              tricepRole="primary"
              bicepSide={1}
              scale={0.94}
              ctx={ctx}
              handProp={
                <g>
                  <line x1="-4" y1="-7" x2="3" y2="7" stroke="#E4E4E7" strokeWidth="3.6" strokeLinecap="round" />
                  <circle cx="-4" cy="-7" r="2.6" fill="#FACC15" />
                  <circle cx="3" cy="8" r="3.2" fill="#FF4500" stroke="#E4E4E7" strokeWidth="1.1" />
                </g>
              }
            />
          </g>
        );
      }

      case 'overhead-dumbbell-extension': {
        const shoulder = { x: 178, y: 84 };
        const hip = { x: 178, y: 140 };
        const elbow = { x: 182, y: 48 };
        const foreDeg = lerp(168, 276, p);
        const rad = (foreDeg * Math.PI) / 180;
        const hand = { x: elbow.x + Math.cos(rad) * 32, y: elbow.y + Math.sin(rad) * 32 };
        const leg = solveTwoBoneIK(hip.x, hip.y, 224, GROUNDED_ANKLE_Y, 40, 38, -1);

        return (
          <g>
            <rect x="148" y="150" width="56" height="10" rx="4" fill="#18202C" stroke="#475569" strokeWidth="1.4" />
            <path d="M162 160V196M190 160V196" stroke="#334155" strokeWidth="5" strokeLinecap="round" />

            <UnifiedLeg p0={leg.p0} p1={leg.p1} p2={leg.p2} quadSide={-1} ctx={ctx} />
            <UnifiedSideTorso sx={shoulder.x} sy={shoulder.y} hx={hip.x} hy={hip.y} chestSide={-1} abs="secondary" ctx={ctx} />

            {renderTrajectory('M 140 44 Q 148 16 178 14')}

            <UnifiedArm
              p0={shoulder}
              p1={elbow}
              p2={hand}
              tricepRole="primary"
              deltRole="secondary"
              bicepSide={-1}
              scale={0.92}
              ctx={ctx}
              handProp={<HexDumbbell3D mode="cupped" angleDeg={lerp(-42, 0, p)} scale={0.86} />}
            />
          </g>
        );
      }

      case 'skull-crusher': {
        const shoulder = { x: 136, y: 126 };
        const hip = { x: 200, y: 130 };
        const elbow = { x: 128, y: 88 };
        const foreDeg = lerp(178, 276, p);
        const rad = (foreDeg * Math.PI) / 180;
        const hand = { x: elbow.x + Math.cos(rad) * 34, y: elbow.y + Math.sin(rad) * 34 };
        const leg = solveTwoBoneIK(hip.x, hip.y, 250, GROUNDED_ANKLE_Y, 44, 44, -1);

        return (
          <g>
            <rect x="96" y="142" width="132" height="12" rx="4" fill="#18202C" stroke="#475569" strokeWidth="1.4" />
            <path d="M114 154V196M208 154V196" stroke="#334155" strokeWidth="4.5" strokeLinecap="round" />

            <UnifiedLeg p0={leg.p0} p1={leg.p1} p2={leg.p2} quadSide={-1} ctx={ctx} />
            <UnifiedSideTorso sx={shoulder.x} sy={shoulder.y} hx={hip.x} hy={hip.y} chestSide={-1} ctx={ctx} />

            {renderTrajectory('M 84 84 Q 90 52 122 46')}

            <UnifiedArm
              p0={shoulder}
              p1={elbow}
              p2={hand}
              tricepRole="primary"
              deltRole="secondary"
              bicepSide={-1}
              ctx={ctx}
              handProp={<OlympicBarbellSide3D r={14} />}
            />
          </g>
        );
      }

      case 'cable-crunch': {
        // Crystal-clear Side Profile kneeling cleanly ON TOP of mat (y = 191) facing LEFT toward high cable tower.
        // Knees, shins, and instep-flat feet rest flush on top of the mat (ZERO clipping below FLOOR_Y = 196).
        // Hips stay 100% stationary vertically stacked above knees while ONLY the upper spine curls smoothly into C-curve flexion.
        const pulley = { x: 84, y: 34 };
        const matTopY = 191;
        const knee = { x: 204, y: 184.5 };
        // At footDir = -1, footAngleDeg = -163, shoe instep lies flat at y = ankle.y + 2.7 -> flush on matTopY = 191!
        const ankle = { x: 252, y: matTopY - 2.7 };
        const hip = { x: 204, y: 134 }; // Completely stationary pelvis vertically above knee!

        // Upper spine curls smoothly downward toward thighs (unmistakable thoracic C-curve flexion)
        const shoulder = { x: lerp(186, 146, p), y: lerp(80, 118, p) };
        const midBack = { x: lerp(208, 184, p), y: lerp(104, 102, p) };
        const midAbs = { x: lerp(185, 166, p), y: lerp(112, 132, p) };

        // Head tracks naturally with thoracic flexion, staying completely unobscured
        const headCenter = { x: lerp(177, 130, p), y: lerp(59, 121, p) };
        const headRot = lerp(-12, 48, p);

        // Hands held clearly beside the forehead/temples (in front of brow edge, NOT covering the head!)
        const hand = { x: headCenter.x - lerp(6.5, 5.5, p), y: headCenter.y + lerp(-3.5, -4.5, p) };
        const farHand = { x: hand.x - 5.5, y: hand.y - 2.5 };
        const arm = solveTwoBoneIK(shoulder.x, shoulder.y, hand.x, hand.y, 26, 24, -1);
        const farArm = solveTwoBoneIK(shoulder.x - 4, shoulder.y - 2, farHand.x, farHand.y, 26, 24, -1);
        const elbow = arm.p1;

        // Rope knot sits cleanly 24px along the taut cable vector toward the top pulley
        const cableDx = pulley.x - hand.x;
        const cableDy = pulley.y - hand.y;
        const cableDist = Math.hypot(cableDx, cableDy) || 1;
        const ropeKnot = {
          x: hand.x + (cableDx / cableDist) * 24,
          y: hand.y + (cableDy / cableDist) * 24,
        };

        // Smooth curved torso silhouette showing clear spinal flexion (Gender-Adaptive)
        const isFemale = ctx.gender === 'female';
        const curvedTorsoPath = isFemale
          ? [
              `M ${shoulder.x + 6.5} ${shoulder.y - 6.5}`,
              `C ${midBack.x + 10.8} ${midBack.y - 5.5}, ${hip.x + 10.2} ${hip.y - 10.0}, ${hip.x + 15.5} ${hip.y + 1.5}`,
              `C ${hip.x + 17.2} ${hip.y + 10.2}, ${hip.x + 6.5} ${hip.y + 12.2}, ${hip.x - 3.5} ${hip.y + 10.0}`,
              `C ${midAbs.x - 7.0} ${midAbs.y + 7.4}, ${shoulder.x - 9.0} ${shoulder.y + 15.2}, ${shoulder.x - 14.0} ${shoulder.y + 11.0}`,
              `C ${shoulder.x - 15.6} ${shoulder.y + 5.8}, ${shoulder.x - 11.2} ${shoulder.y - 5.0}, ${shoulder.x + 6.5} ${shoulder.y - 6.5}`,
              `Z`,
            ].join(' ')
          : [
              `M ${shoulder.x + 9.5} ${shoulder.y - 8.0}`,
              `Q ${midBack.x + 14.5} ${midBack.y - 6.0}, ${hip.x + 12.2} ${hip.y - 2.0}`,
              `Q ${hip.x + 13.2} ${hip.y + 11.0}, ${hip.x - 3.5} ${hip.y + 11.0}`,
              `Q ${midAbs.x - 11.5} ${midAbs.y + 8.6}, ${shoulder.x - 14.2} ${shoulder.y + 8.6}`,
              `Q ${shoulder.x - 14.8} ${shoulder.y - 6.8}, ${shoulder.x + 9.5} ${shoulder.y - 8.0}`,
              `Z`,
            ].join(' ');

        // Curved Rectus Abdominis muscle strip along front stomach wall (visibly compresses along C-curve!)
        const absTop = { x: lerp(shoulder.x - 8.2, shoulder.x - 5.5, p), y: lerp(shoulder.y + 12.5, shoulder.y + 12.8, p) };
        const absMid = { x: midAbs.x - (isFemale ? 2.2 : 4.2), y: midAbs.y + 3.2 };
        const absBot = { x: hip.x - 3.2, y: hip.y + 4.5 };
        const absStripPath = [
          `M ${absTop.x - 2.2} ${absTop.y + 1.4}`,
          `Q ${absMid.x - 4.4} ${absMid.y + 2.8}, ${absBot.x - 2.4} ${absBot.y + 2.2}`,
          `L ${absBot.x + 3.6} ${absBot.y - 1.8}`,
          `Q ${absMid.x + 3.4} ${absMid.y - 2.6}, ${absTop.x + 4.2} ${absTop.y - 2.2}`,
          `Z`,
        ].join(' ');

        const absPaint = getMusclePaint('primary', ctx);
        const corePaint = getMusclePaint('secondary', ctx);

        return (
          <g>
            {/* High Cable Tower + Guide Rod + Top Pulley Wheel */}
            <rect x="60" y="18" width="15" height="178" rx="3" fill="#131926" stroke="#475569" strokeWidth="1.4" />
            <rect x="75" y="25" width="13" height="16" rx="3" fill="#1E293B" stroke="#64748B" strokeWidth="1.2" />
            <circle cx={pulley.x} cy={pulley.y} r="7.5" fill="#0F172A" stroke="#94A3B8" strokeWidth="1.6" />
            <circle cx={pulley.x} cy={pulley.y} r="2.6" fill="#FACC15" />

            {/* Stationary Vertical Hip-to-Knee Alignment Guide */}
            <line
              x1={hip.x}
              y1={hip.y + 10}
              x2={knee.x}
              y2={knee.y}
              stroke="#475569"
              strokeWidth="1.1"
              strokeDasharray="3 3"
              strokeOpacity="0.45"
            />

            {/* Kneeling Gym Mat (Flush on FLOOR_Y = 196; Top Surface at y = 191) */}
            <rect x="148" y={matTopY} width="136" height="5" rx="2.5" fill="#1E293B" stroke="#475569" strokeWidth="1.1" />

            {/* Taut Angled Steel Cable + Carabiner Knot + Far Braided Rope Tail */}
            <line
              x1={pulley.x + 3}
              y1={pulley.y + 6.5}
              x2={ropeKnot.x}
              y2={ropeKnot.y}
              stroke="#CBD5E1"
              strokeWidth="2.1"
              strokeLinecap="round"
            />
            <path
              d={`M ${ropeKnot.x} ${ropeKnot.y} Q ${(ropeKnot.x + farHand.x) / 2 - 2} ${(ropeKnot.y + farHand.y) / 2 + 2} ${farHand.x} ${farHand.y}`}
              stroke="#94A3B8"
              strokeWidth="3.6"
              strokeLinecap="round"
              fill="none"
            />

            {/* Back Kneeling Leg Resting Cleanly ON TOP of Mat */}
            <UnifiedLeg
              p0={{ x: hip.x + 5, y: hip.y - 2 }}
              p1={{ x: knee.x + 6, y: knee.y - 1.5 }}
              p2={{ x: ankle.x + 5, y: ankle.y - 1.2 }}
              quadSide={1}
              backLayer
              footDir={-1}
              footAngleDeg={-163}
              ctx={ctx}
            />

            {/* Back Arm Holding Far Rope End Beside Far Temple */}
            <UnifiedArm
              p0={farArm.p0}
              p1={farArm.p1}
              p2={farArm.p2}
              bicepSide={1}
              backLayer
              scale={isFemale ? 0.84 : 0.96}
              ctx={ctx}
            />

            {/* Front Kneeling Leg (Knees, Shins & Instep-Flat Foot Grounded Cleanly ON TOP of Mat!) */}
            <UnifiedLeg
              p0={hip}
              p1={knee}
              p2={ankle}
              quadSide={1}
              footDir={-1}
              footAngleDeg={-163}
              ctx={ctx}
            />

            {/* Curved Spinal-Flexion Torso + Smooth Faceless Side-Profile Athletic Head */}
            <g>
              <g transform={`translate(${headCenter.x} ${headCenter.y}) rotate(${headRot})`}>
                {isFemale && (
                  <g>
                    {/* Flowing Tapered S-Curved Athletic Ponytail */}
                    <path
                      d="M 5.2 -5.0 C 9.8 -7.8, 15.2 -4.8, 15.6 0.8 C 16.0 5.4, 14.0 9.4, 15.4 13.2 C 16.2 15.2, 17.4 16.4, 18.0 17.0 C 15.2 16.4, 12.8 14.0, 11.8 10.2 C 11.0 7.0, 11.6 3.6, 10.6 0.6 C 9.6 -2.2, 7.6 -3.6, 4.8 -3.4 Z"
                      fill={`url(#${ctx.bodyGrad})`}
                      stroke="#52525B"
                      strokeOpacity="0.82"
                      strokeWidth="0.95"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 8.2 -4.0 C 12.2 -3.6, 13.8 0.4, 13.4 5.2 C 13.1 8.8, 13.8 11.8, 15.8 14.6"
                      fill="none"
                      stroke="#94A3B8"
                      strokeOpacity="0.28"
                      strokeWidth="0.7"
                      strokeLinecap="round"
                    />
                    <ellipse cx="6.0" cy="-4.6" rx="1.45" ry="2.1" transform="rotate(-28 6.0 -4.6)" fill="#FF4500" fillOpacity="0.86" />
                  </g>
                )}
                <path
                  d={
                    isFemale
                      ? 'M 4.8 7.0 C 8.4 3.4, 8.2 -5.8, 1.8 -8.8 C -3.4 -10.0, -7.2 -7.2, -7.8 -3.2 C -8.3 -0.6, -8.2 2.2, -7.2 4.8 C -6.2 6.8, -3.8 7.8, -1.2 7.8 C 1.4 7.8, 3.4 7.8, 4.8 7.0 Z'
                      : 'M 5.2 7.4 C 9.0 3.6, 8.8 -6.2, 2.0 -9.4 C -3.6 -10.6, -7.6 -7.6, -8.4 -3.4 C -8.9 -0.6, -8.8 2.4, -7.6 5.2 C -6.6 7.2, -4.0 8.2, -1.2 8.2 C 1.4 8.2, 3.6 8.2, 5.2 7.4 Z'
                  }
                  fill={`url(#${ctx.bodyGrad})`}
                  stroke="#52525B"
                  strokeOpacity="0.84"
                  strokeWidth="1.0"
                  strokeLinejoin="round"
                />
              </g>
              <path
                d={curvedTorsoPath}
                fill={`url(#${ctx.bodyGrad})`}
                stroke="#52525B"
                strokeOpacity="0.82"
                strokeWidth="1.05"
                strokeLinejoin="round"
              />
              {/* Subtle Athletic Sports-Bra Band Contour (Female) */}
              {isFemale && (
                <path
                  d={`M ${shoulder.x - 9.0} ${shoulder.y + 14.8} Q ${shoulder.x + 1.5} ${shoulder.y + 10.2} ${midBack.x + 7.2} ${midBack.y - 2.0}`}
                  fill="none"
                  stroke="#94A3B8"
                  strokeOpacity="0.22"
                  strokeWidth="0.85"
                  strokeLinecap="round"
                />
              )}

              {/* Highlighted Curved Rectus Abdominis Muscle Strip Along Front Stomach (Blaze Orange-Red #FF4500) */}
              {absPaint && (
                <g>
                  <path
                    d={absStripPath}
                    fill={absPaint.fill}
                    opacity={Math.min(1, absPaint.opacity * (0.88 + 0.12 * p))}
                    filter={absPaint.filter}
                  />
                  {/* Tendinous Ab Intersections Visibly Compressing During Crunch */}
                  <path
                    d={`M ${lerp(absTop.x - 1, absMid.x - 2, 0.35)} ${lerp(absTop.y + 1, absMid.y + 1, 0.35)} L ${lerp(absTop.x + 3.5, absMid.x + 2.8, 0.35)} ${lerp(absTop.y - 1.5, absMid.y - 1.8, 0.35)} M ${lerp(absMid.x - 3.5, absBot.x - 2, 0.2)} ${lerp(absMid.y + 2, absBot.y + 1.5, 0.2)} L ${lerp(absMid.x + 2.8, absBot.x + 3, 0.2)} ${lerp(absMid.y - 1.8, absBot.y - 1.5, 0.2)}`}
                    stroke={STUDIO_STRIATION}
                    strokeWidth="1.05"
                    strokeLinecap="round"
                    fill="none"
                  />
                </g>
              )}
              {corePaint && (
                <path
                  d={`M ${lerp(195, 174, p)} ${lerp(106, 118, p)} Q ${lerp(200, 187, p)} ${lerp(122, 127, p)} ${lerp(201, 197, p)} ${lerp(133, 134, p)}`}
                  stroke={corePaint.fill}
                  strokeWidth="3.6"
                  strokeLinecap="round"
                  opacity={corePaint.opacity * 0.8}
                  filter={corePaint.filter}
                  fill="none"
                />
              )}
            </g>

            {/* Foreground Braided Cable Rope + Carabiner Stopper Connecting Pulley to Near Temple Hand */}
            <path
              d={`M ${ropeKnot.x} ${ropeKnot.y} Q ${(ropeKnot.x + hand.x) / 2 - 2} ${(ropeKnot.y + hand.y) / 2 + 2} ${hand.x} ${hand.y}`}
              stroke="#E2E8F0"
              strokeWidth="4.2"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx={ropeKnot.x} cy={ropeKnot.y} r="3.8" fill="#1E293B" stroke="#FACC15" strokeWidth="1.35" />

            {/* Curved Crunch Trajectory Arrow */}
            {renderTrajectory('M 146 78 Q 118 114 134 148')}

            {/* Front Arm Locked Cleanly Beside Forehead/Temple Holding Rope Grip */}
            <UnifiedArm
              p0={shoulder}
              p1={elbow}
              p2={hand}
              bicepSide={1}
              scale={isFemale ? 0.84 : 0.96}
              ctx={ctx}
              handProp={
                <rect x="-4.5" y="-3.2" width="9" height="6.4" rx="2.6" fill="#0F172A" stroke="#CBD5E1" strokeWidth="1.2" />
              }
            />
          </g>
        );
      }

      case 'hanging-leg-raise': {
        // Side-3/4 View hanging steadily from fixed overhead bar.
        // Torso & arms stay 100% VERTICAL and STATIONARY (zero swinging); ONLY the legs rotate smoothly 0° -> 90° around the hip pivot.
        const barY = 20;
        const hand = { x: 158, y: barY };
        const elbow = { x: 158, y: 44 };
        const shoulder = { x: 158, y: 68 };
        const hip = { x: 158, y: 120 }; // Perfectly vertical & stationary torso

        // Strict hip flexion from 90° (vertical straight down = 0° raise) to 0° (horizontal = 90° parallel to floor)
        const thighDeg = lerp(90, 0, p);
        const shinDeg = thighDeg + 6;
        const frontLeg = solveTwoBoneFK(hip.x, hip.y, 33, thighDeg, 31, shinDeg);
        const backLeg = solveTwoBoneFK(hip.x + 6, hip.y - 2, 32, thighDeg - 2, 30, shinDeg - 2);
        const lowerAbPaint = getMusclePaint('primary', ctx);

        return (
          <g>
            {/* Fixed Overhead Pull-Up Bar & Uprights */}
            <path d="M108 20V196M252 20V196" stroke="#243045" strokeWidth="4" strokeLinecap="round" />
            <line x1="102" y1={barY} x2="258" y2={barY} stroke="#64748B" strokeWidth="5.5" strokeLinecap="round" />
            <rect x="144" y={barY - 3.5} width="28" height="7" rx="3.5" fill="#1E293B" stroke="#CBD5E1" strokeWidth="1.2" />

            {/* Vertical Zero-Swing Spine Reference Axis */}
            <line
              x1={hip.x}
              y1={barY + 6}
              x2={hip.x}
              y2="188"
              stroke="#475569"
              strokeWidth="1.1"
              strokeDasharray="3 4"
              strokeOpacity="0.4"
            />

            {/* Back Arm Gripping Bar Steadily */}
            <UnifiedArm
              p0={{ x: shoulder.x + 7, y: shoulder.y - 2 }}
              p1={{ x: elbow.x + 7, y: elbow.y - 2 }}
              p2={{ x: hand.x + 7, y: barY }}
              bicepSide={-1}
              backLayer
              ctx={ctx}
            />

            {/* Back Leg Rotating Cleanly 0° -> 90° */}
            <UnifiedLeg
              p0={backLeg.p0}
              p1={backLeg.p1}
              p2={backLeg.p2}
              quadSide={-1}
              backLayer
              footAngleDeg={lerp(18, -72, p)}
              ctx={ctx}
            />

            {/* Completely Stationary Vertical Torso with Glowing Blaze Orange-Red Lower Abs */}
            <UnifiedSideTorso
              sx={shoulder.x}
              sy={shoulder.y}
              hx={hip.x}
              hy={hip.y}
              chestSide={-1}
              abs="primary"
              lats="secondary"
              headAngleAdjust={0}
              ctx={ctx}
            />

            {/* Extra Focused Lower-Abs Contraction Highlight Above Hip Pivot */}
            {lowerAbPaint && (
              <ellipse
                cx={hip.x + 6.5}
                cy={hip.y - 10}
                rx="5.2"
                ry="8.5"
                fill={lowerAbPaint.fill}
                opacity={lerp(0.35, 0.95, p)}
                filter={lowerAbPaint.filter}
              />
            )}

            {/* Smooth 0° -> 90° Hip-Pivot Arc Trajectory */}
            {renderTrajectory('M 176 178 Q 220 166 226 126')}

            {/* Front Leg Rotating Around Stationary Hip Pivot */}
            <UnifiedLeg
              p0={frontLeg.p0}
              p1={frontLeg.p1}
              p2={frontLeg.p2}
              quadRole="secondary"
              quadSide={-1}
              footAngleDeg={lerp(18, -72, p)}
              ctx={ctx}
            />

            {/* Front Arm Locked Vertically on Bar */}
            <UnifiedArm
              p0={shoulder}
              p1={elbow}
              p2={hand}
              bicepSide={-1}
              ctx={ctx}
            />
          </g>
        );
      }

      case 'ab-wheel-rollout': {
        // Side profile kneeling on mat facing RIGHT; rolling Ab Wheel glides smoothly along FLOOR_Y while neutral spine extends
        const wheelR = 13;
        const wheelY = FLOOR_Y - wheelR; // 183 -> tire sits pixel-flush on FLOOR_Y = 196
        const wheelStartX = 166;
        const wheelEndX = 266;
        const wheelX = lerp(wheelStartX, wheelEndX, p);
        const wheelRotDeg = ((wheelX - wheelStartX) / wheelR) * (180 / Math.PI);

        const knee = { x: 112, y: 189 };
        const ankle = { x: 64, y: 188 };

        // Hips glide forward & lower cleanly in line with torso (zero lumbar sag)
        const hip = { x: lerp(118, 158, p), y: lerp(142, 165, p) };
        const shoulder = { x: lerp(160, 212, p), y: lerp(112, 148, p) };

        // Straight braced arms connecting shoulder to Ab Wheel handle
        const arm = solveTwoBoneIK(shoulder.x, shoulder.y, wheelX, wheelY, 37, 36, 1);

        return (
          <g>
            {/* Kneeling Gym Mat */}
            <rect x="54" y="191" width="246" height="5" rx="2.5" fill="#1E293B" stroke="#475569" strokeWidth="1.1" />

            {/* Back Kneeling Leg */}
            <UnifiedLeg
              p0={{ x: hip.x - 4, y: hip.y - 3 }}
              p1={{ x: knee.x - 4, y: knee.y - 2 }}
              p2={{ x: ankle.x - 3, y: ankle.y - 2 }}
              quadSide={1}
              backLayer
              footDir={1}
              footAngleDeg={78}
              ctx={ctx}
            />

            {/* Back Arm */}
            <UnifiedArm
              p0={{ x: shoulder.x + 3, y: shoulder.y - 3 }}
              p1={{ x: arm.p1.x + 3, y: arm.p1.y - 3 }}
              p2={{ x: wheelX + 3, y: wheelY - 2 }}
              bicepSide={-1}
              backLayer
              ctx={ctx}
            />

            {/* Front Kneeling Leg */}
            <UnifiedLeg
              p0={hip}
              p1={knee}
              p2={ankle}
              quadSide={1}
              footDir={1}
              footAngleDeg={78}
              ctx={ctx}
            />

            {/* Neutral Braced Torso (chestSide=-1 faces DOWN toward mat when shoulder is RIGHT of hip) */}
            <UnifiedSideTorso
              sx={shoulder.x}
              sy={shoulder.y}
              hx={hip.x}
              hy={hip.y}
              chestSide={-1}
              abs="primary"
              lats="secondary"
              glute="secondary"
              headAngleAdjust={lerp(-6, -12, p)}
              ctx={ctx}
            />

            {/* Horizontal Rollout Trajectory Arrow */}
            {renderTrajectory('M 176 158 L 266 158')}

            {/* Front Braced Arm */}
            <UnifiedArm
              p0={shoulder}
              p1={arm.p1}
              p2={{ x: wheelX, y: wheelY }}
              deltRole="secondary"
              bicepSide={-1}
              ctx={ctx}
            />

            {/* Rolling Ab Wheel (Spokes Rotate Proportionally to Ground Distance) */}
            <g transform={`translate(${wheelX} ${wheelY})`}>
              <g transform={`rotate(${wheelRotDeg})`}>
                <circle r={wheelR} fill="#0F172A" stroke="#94A3B8" strokeWidth="3.2" />
                <circle r={wheelR - 3.5} fill="#1E293B" stroke="#475569" strokeWidth="1" />
                {/* Wheel Spokes */}
                <line x1={-(wheelR - 4)} y1="0" x2={wheelR - 4} y2="0" stroke="#FF4500" strokeWidth="1.6" strokeOpacity="0.88" />
                <line x1="0" y1={-(wheelR - 4)} x2="0" y2={wheelR - 4} stroke="#64748B" strokeWidth="1.5" />
                <line x1="-6" y1="-6" x2="6" y2="6" stroke="#475569" strokeWidth="1.2" />
                <line x1="-6" y1="6" x2="6" y2="-6" stroke="#475569" strokeWidth="1.2" />
              </g>
              {/* Axle & Ergonomic Handle Cap */}
              <circle r="4.2" fill="#E4E4E7" stroke="#0D0D0F" strokeWidth="1.3" />
              <circle r="1.8" fill="#FACC15" />
            </g>
          </g>
        );
      }

      case 'russian-twist': {
        // Clean 3/4 Front-Seated View (torso leaned back 45°, knees bent cleanly below chest, heels resting on floor mat y=196).
        // Both arms stay 100% connected holding a compact weight/clasped hands in front of chest, rotating cleanly from left hip to right hip with ZERO tangled or detached limbs!
        const cx = 180;
        const twist = lerp(-1, 1, p);
        const yawRad = (twist * 36 * Math.PI) / 180;
        const cosY = Math.cos(yawRad);
        const sinY = Math.sin(yawRad);

        const isFemale = ctx.gender === 'female';
        const hipCenter = { x: cx, y: 168 };
        const shoulderY = 102;

        // Rotating shoulders around inclined torso centerline (distinctly narrower & sleeker for female)
        const shHalf = isFemale ? 18.0 : 26.5;
        const lShoulder = { x: cx - shHalf * cosY + twist * 3, y: shoulderY + 3.5 * sinY };
        const rShoulder = { x: cx + shHalf * cosY + twist * 3, y: shoulderY - 3.5 * sinY };
        const headCenter = { x: cx + twist * 4.5, y: 74 };

        // Connected hands sweeping cleanly from left hip (x=154) across chest (x=180) to right hip (x=206)
        const hands = { x: cx + 36 * sinY + twist * 5, y: 136 + Math.abs(twist) * 8 };

        // CRITICAL: bendDir=+1 on left arm & bendDir=-1 on right arm keeps both elbows naturally outside the ribcage (zero crossing/tangling!)
        const lArm = solveTwoBoneIK(lShoulder.x, lShoulder.y, hands.x - 4, hands.y, 33, 31, 1);
        const rArm = solveTwoBoneIK(rShoulder.x, rShoulder.y, hands.x + 4, hands.y, 33, 31, -1);

        // Seated bent knees spread cleanly below hands with heels firmly anchored on the floor mat
        const lKnee = { x: cx - 22, y: 154 };
        const rKnee = { x: cx + 22, y: 154 };
        const lAnkle = { x: cx - 28, y: GROUNDED_ANKLE_Y };
        const rAnkle = { x: cx + 28, y: GROUNDED_ANKLE_Y };

        const absPaint = getMusclePaint('primary', ctx);
        const coreSecPaint = getMusclePaint('secondary', ctx);
        const obliqueShift = twist * 5;

        const torsoPath = isFemale
          ? [
              `M ${lShoulder.x - 0.6} ${lShoulder.y + 2.5}`,
              `Q ${cx + twist * 3} ${shoulderY - 5.5}, ${rShoulder.x + 0.6} ${rShoulder.y + 2.5}`,
              `C ${rShoulder.x + 0.8} ${shoulderY + 17}, ${cx + 12.6} ${hipCenter.y - 20}, ${cx + 20.6} ${hipCenter.y + 6}`,
              `Q ${cx} ${hipCenter.y + 14.0}, ${cx - 20.6} ${hipCenter.y + 6}`,
              `C ${cx - 12.6} ${hipCenter.y - 20}, ${lShoulder.x - 0.8} ${shoulderY + 17}, ${lShoulder.x - 0.6} ${lShoulder.y + 2.5}`,
              `Z`,
            ].join(' ')
          : [
              `M ${lShoulder.x - 5.2} ${lShoulder.y + 1.5}`,
              `Q ${cx + twist * 3} ${shoulderY - 9.5}, ${rShoulder.x + 5.2} ${rShoulder.y + 1.5}`,
              `C ${rShoulder.x + 6.0} ${shoulderY + 23}, ${cx + 21.2} ${hipCenter.y - 14}, ${cx + 17.6} ${hipCenter.y + 6}`,
              `Q ${cx} ${hipCenter.y + 14.0}, ${cx - 17.6} ${hipCenter.y + 6}`,
              `C ${cx - 21.2} ${hipCenter.y - 14}, ${lShoulder.x - 6.0} ${shoulderY + 23}, ${lShoulder.x - 5.2} ${lShoulder.y + 1.5}`,
              `Z`,
            ].join(' ');

        return (
          <g>
            {/* Floor Mat & Seated Shadow */}
            <rect x="86" y="191" width="188" height="5" rx="2.5" fill="#1E293B" stroke="#475569" strokeWidth="1.1" />
            <ellipse cx={cx} cy="193" rx="34" ry="3.5" fill="#020617" opacity="0.55" />

            {/* Seated Torso Leaned Back 45° + Smooth Faceless Athletic Head */}
            <g>
              <path
                d={`M ${headCenter.x - (isFemale ? 4.2 : 5.6)} ${headCenter.y + 8} L ${headCenter.x + (isFemale ? 4.2 : 5.6)} ${headCenter.y + 8} L ${headCenter.x + (isFemale ? 5.8 : 7.8)} ${headCenter.y + 23} L ${headCenter.x - (isFemale ? 5.8 : 7.8)} ${headCenter.y + 23} Z`}
                fill={`url(#${ctx.bodyGrad})`}
                stroke="#52525B"
                strokeOpacity="0.72"
                strokeWidth="0.95"
              />
              {isFemale && (
                <g>
                  {/* Flowing Tapered S-Curved Athletic Ponytail */}
                  <path
                    d={`M ${headCenter.x + 2.4} ${headCenter.y - 11.0} C ${headCenter.x + 8.8} ${headCenter.y - 15.2}, ${headCenter.x + 15.2} ${headCenter.y - 10.4}, ${headCenter.x + 15.0} ${headCenter.y - 3.6} C ${headCenter.x + 14.8} ${headCenter.y + 1.2}, ${headCenter.x + 13.8} ${headCenter.y + 5.2}, ${headCenter.x + 16.4} ${headCenter.y + 9.2} C ${headCenter.x + 13.2} ${headCenter.y + 8.4}, ${headCenter.x + 10.6} ${headCenter.y + 5.4}, ${headCenter.x + 10.0} ${headCenter.y + 0.8} C ${headCenter.x + 9.6} ${headCenter.y - 3.8}, ${headCenter.x + 8.0} ${headCenter.y - 7.8}, ${headCenter.x + 2.2} ${headCenter.y - 9.4} Z`}
                    fill={`url(#${ctx.bodyGrad})`}
                    stroke="#52525B"
                    strokeOpacity="0.82"
                    strokeWidth="0.95"
                    strokeLinejoin="round"
                  />
                  <path
                    d={`M ${headCenter.x + 6.4} ${headCenter.y - 10.6} C ${headCenter.x + 11.4} ${headCenter.y - 9.2}, ${headCenter.x + 13.0} ${headCenter.y - 4.2}, ${headCenter.x + 12.6} ${headCenter.y + 1.6} C ${headCenter.x + 12.4} ${headCenter.y + 4.4}, ${headCenter.x + 13.4} ${headCenter.y + 6.4}, ${headCenter.x + 14.8} ${headCenter.y + 7.8}`}
                    fill="none"
                    stroke="#94A3B8"
                    strokeOpacity="0.28"
                    strokeWidth="0.7"
                    strokeLinecap="round"
                  />
                  <ellipse cx={headCenter.x + 4.8} cy={headCenter.y - 10.6} rx="1.95" ry="1.3" transform={`rotate(-28 ${headCenter.x + 4.8} ${headCenter.y - 10.6})`} fill="#FF4500" fillOpacity="0.86" />
                </g>
              )}
              <path
                d={
                  isFemale
                    ? `M ${headCenter.x} ${headCenter.y - 11.8} C ${headCenter.x + 5.6} ${headCenter.y - 11.8}, ${headCenter.x + 8.2} ${headCenter.y - 8.0}, ${headCenter.x + 8.2} ${headCenter.y - 1.4} C ${headCenter.x + 8.2} ${headCenter.y + 4.0}, ${headCenter.x + 5.4} ${headCenter.y + 8.6}, ${headCenter.x + 2.2} ${headCenter.y + 10.4} C ${headCenter.x + 0.9} ${headCenter.y + 11.1}, ${headCenter.x - 0.9} ${headCenter.y + 11.1}, ${headCenter.x - 2.2} ${headCenter.y + 10.4} C ${headCenter.x - 5.4} ${headCenter.y + 8.6}, ${headCenter.x - 8.2} ${headCenter.y + 4.0}, ${headCenter.x - 8.2} ${headCenter.y - 1.4} C ${headCenter.x - 8.2} ${headCenter.y - 8.0}, ${headCenter.x - 5.6} ${headCenter.y - 11.8}, ${headCenter.x} ${headCenter.y - 11.8} Z`
                    : `M ${headCenter.x} ${headCenter.y - 12.4} C ${headCenter.x + 6.2} ${headCenter.y - 12.4}, ${headCenter.x + 9.0} ${headCenter.y - 8.4}, ${headCenter.x + 8.9} ${headCenter.y - 1.4} C ${headCenter.x + 8.8} ${headCenter.y + 4.2}, ${headCenter.x + 6.2} ${headCenter.y + 8.8}, ${headCenter.x + 2.8} ${headCenter.y + 10.6} C ${headCenter.x + 1.2} ${headCenter.y + 11.4}, ${headCenter.x - 1.2} ${headCenter.y + 11.4}, ${headCenter.x - 2.8} ${headCenter.y + 10.6} C ${headCenter.x - 6.2} ${headCenter.y + 8.8}, ${headCenter.x - 8.8} ${headCenter.y + 4.2}, ${headCenter.x - 8.9} ${headCenter.y - 1.4} C ${headCenter.x - 9.0} ${headCenter.y - 8.4}, ${headCenter.x - 6.2} ${headCenter.y - 12.4}, ${headCenter.x} ${headCenter.y - 12.4} Z`
                }
                fill={`url(#${ctx.bodyGrad})`}
                stroke="#52525B"
                strokeOpacity="0.84"
                strokeWidth="1.0"
                strokeLinejoin="round"
              />
              <path
                d={torsoPath}
                fill={`url(#${ctx.bodyGrad})`}
                stroke="#52525B"
                strokeOpacity="0.82"
                strokeWidth="1.05"
                strokeLinejoin="round"
              />
              {/* Subtle Athletic Sports-Bra Underbust Contour (Female) */}
              {isFemale && (
                <path
                  d={`M ${cx - 15.2 + obliqueShift * 0.45} 124.5 Q ${cx - 7.5 + obliqueShift * 0.45} 127.8 ${cx + obliqueShift * 0.45} 125.0 Q ${cx + 7.5 + obliqueShift * 0.45} 127.8 ${cx + 15.2 + obliqueShift * 0.45} 124.5`}
                  fill="none"
                  stroke="#94A3B8"
                  strokeOpacity="0.24"
                  strokeWidth="0.9"
                  strokeLinecap="round"
                />
              )}

              {/* Glowing Blaze Orange-Red (#FF4500) Obliques */}
              {absPaint && (
                <g fill={absPaint.fill} filter={absPaint.filter}>
                  <path
                    d={`M ${cx - 18 + obliqueShift * 0.45} 118 Q ${cx - 21 + obliqueShift * 0.35} 138 ${cx - 15 + obliqueShift * 0.2} 158 Q ${cx - 9 + obliqueShift * 0.3} 140 ${cx - 11 + obliqueShift * 0.45} 120 Z`}
                    opacity={twist < 0 ? absPaint.opacity : absPaint.opacity * 0.55}
                  />
                  <path
                    d={`M ${cx + 18 + obliqueShift * 0.45} 118 Q ${cx + 21 + obliqueShift * 0.35} 138 ${cx + 15 + obliqueShift * 0.2} 158 Q ${cx + 9 + obliqueShift * 0.3} 140 ${cx + 11 + obliqueShift * 0.45} 120 Z`}
                    opacity={twist >= 0 ? absPaint.opacity : absPaint.opacity * 0.55}
                  />
                </g>
              )}
              {coreSecPaint && (
                <g fill={coreSecPaint.fill} opacity={coreSecPaint.opacity * 0.8} filter={coreSecPaint.filter}>
                  <rect x={cx - 7.5 + obliqueShift * 0.5} y="122" width="6.2" height="8.5" rx="2.5" />
                  <rect x={cx + 1.3 + obliqueShift * 0.5} y="122" width="6.2" height="8.5" rx="2.5" />
                  <rect x={cx - 7 + obliqueShift * 0.4} y="134" width="5.8" height="8.5" rx="2.5" />
                  <rect x={cx + 1.2 + obliqueShift * 0.4} y="134" width="5.8" height="8.5" rx="2.5" />
                </g>
              )}
            </g>

            {/* Symmetrical Bent Legs Grounded by Heels on Floor Mat (Layered Cleanly Behind Sweeping Hands) */}
            <UnifiedLeg
              p0={{ x: cx - 12, y: hipCenter.y }}
              p1={lKnee}
              p2={lAnkle}
              quadSide={-1}
              footDir={-1}
              footAngleDeg={12}
              ctx={ctx}
            />
            <UnifiedLeg
              p0={{ x: cx + 12, y: hipCenter.y }}
              p1={rKnee}
              p2={rAnkle}
              quadSide={1}
              footDir={1}
              footAngleDeg={-12}
              ctx={ctx}
            />

            {/* Clean Left-to-Right Rotational Arc Trajectory */}
            {renderTrajectory('M 142 152 Q 180 164 218 152')}

            {/* Both Arms Cleanly Outside Ribcage & 100% Connected to Hands */}
            <UnifiedArm p0={lShoulder} p1={lArm.p1} p2={lArm.p2} bicepSide={1} scale={isFemale ? 0.80 : 0.95} ctx={ctx} />
            <UnifiedArm p0={rShoulder} p1={rArm.p1} p2={rArm.p2} bicepSide={-1} scale={isFemale ? 0.80 : 0.95} ctx={ctx} />

            {/* Compact Grip Disc / Clasped Hands Rotating Cleanly From Left Hip to Right Hip */}
            <g transform={`translate(${hands.x} ${hands.y}) rotate(${twist * 14})`}>
              <circle r="9.5" fill="#18181B" stroke="#E4E4E7" strokeWidth="1.8" />
              <circle r="5.2" fill="#0D0D0F" stroke="#FF4500" strokeWidth="1.2" />
              <circle r="2" fill="#FACC15" />
            </g>
          </g>
        );
      }

      case 'forearm-plank': {
        // Crisp Side Profile on Gym Mat facing RIGHT: Head -> Shoulder -> Hip -> Ankle laser-aligned with isometric core brace pulse
        const braceLift = lerp(0, -1.8, p);
        const shoulder = { x: 226, y: 147 + braceLift * 0.4 };
        const elbow = { x: 228, y: 187 };
        const hand = { x: 266, y: 187 };
        const hip = { x: 164, y: 156 + braceLift };
        const knee = { x: 120, y: 168 + braceLift * 0.5 };
        const ankle = { x: 78, y: 181 };

        return (
          <g>
            {/* Floor Mat */}
            <rect x="52" y="191" width="252" height="5" rx="2.5" fill="#1E293B" stroke="#475569" strokeWidth="1.1" />

            {/* Neutral Spine Laser Alignment Reference Line (Ear -> Shoulder -> Hip -> Ankle) */}
            <line
              x1="248"
              y1={141 + braceLift * 0.4}
              x2="78"
              y2="181"
              stroke="#94A3B8"
              strokeWidth="1.4"
              strokeDasharray="4 4"
              strokeOpacity="0.65"
            />
            {[
              { x: shoulder.x, y: shoulder.y },
              { x: hip.x, y: hip.y },
              { x: ankle.x, y: ankle.y },
            ].map((pt, idx) => (
              <circle
                key={idx}
                cx={pt.x}
                cy={pt.y}
                r="2.8"
                fill="#0D0D0F"
                stroke="#FACC15"
                strokeWidth="1.4"
                opacity={0.75 + p * 0.25}
              />
            ))}

            {/* Back Arm & Back Leg */}
            <UnifiedArm
              p0={{ x: shoulder.x + 4, y: shoulder.y - 2 }}
              p1={{ x: elbow.x + 5, y: elbow.y - 2 }}
              p2={{ x: hand.x + 4, y: hand.y - 2 }}
              bicepSide={-1}
              backLayer
              ctx={ctx}
            />
            <UnifiedLeg
              p0={{ x: hip.x + 3, y: hip.y - 3 }}
              p1={{ x: knee.x + 3, y: knee.y - 2 }}
              p2={{ x: ankle.x + 3, y: ankle.y - 2 }}
              quadSide={1}
              backLayer
              footDir={1}
              footAngleDeg={76}
              ctx={ctx}
            />

            {/* Front Straight Leg with Toes Planted on Mat */}
            <UnifiedLeg
              p0={hip}
              p1={knee}
              p2={ankle}
              quadRole="secondary"
              quadSide={1}
              footDir={1}
              footAngleDeg={76}
              ctx={ctx}
            />

            {/* Laser-Straight Braced Torso with Intense Electric Volt Core Glow */}
            <UnifiedSideTorso
              sx={shoulder.x}
              sy={shoulder.y}
              hx={hip.x}
              hy={hip.y}
              chestSide={-1}
              abs="primary"
              glute="secondary"
              lowerBack="secondary"
              headAngleAdjust={-10}
              ctx={ctx}
            />

            {/* Isometric Core Brace Tension Aura & Upward Pelvic-Brace Cue */}
            <ellipse
              cx={(shoulder.x + hip.x) / 2 - 4}
              cy={(shoulder.y + hip.y) / 2 + 12}
              rx={lerp(22, 26, p)}
              ry={lerp(6.5, 8.5, p)}
              fill="#FF4500"
              opacity={lerp(0.16, 0.36, p)}
              filter={`url(#${ctx.voltGlow})`}
              transform={`rotate(-8 ${(shoulder.x + hip.x) / 2 - 4} ${(shoulder.y + hip.y) / 2 + 12})`}
            />
            {renderTrajectory('M 192 182 L 192 164')}

            {/* Front Forearm Planted Flat Directly Under Shoulder */}
            <UnifiedArm
              p0={shoulder}
              p1={elbow}
              p2={hand}
              deltRole="secondary"
              bicepSide={-1}
              ctx={ctx}
            />
          </g>
        );
      }

      // ==================== FUNDAMENTAL BODYWEIGHT (8) ====================
      case 'push-up': {
        // Crisp Side Profile facing RIGHT: straight rigid plank pivoting cleanly on planted toes while pressing off the floor
        const ankle = { x: 82, y: 184 };
        const bodyDeg = lerp(-7, -25, p);
        const rad = (bodyDeg * Math.PI) / 180;
        const knee = { x: ankle.x + Math.cos(rad) * 44, y: ankle.y + Math.sin(rad) * 44 };
        const hip = { x: ankle.x + Math.cos(rad) * 88, y: ankle.y + Math.sin(rad) * 88 };
        const shoulder = { x: ankle.x + Math.cos(rad) * 146, y: ankle.y + Math.sin(rad) * 146 };
        const hand = { x: 224, y: 193 };
        const arm = solveTwoBoneIK(shoulder.x, shoulder.y, hand.x, hand.y, 38, 36, 1);

        return (
          <g>
            {/* Floor Mat */}
            <rect x="58" y="191" width="230" height="5" rx="2.5" fill="#1E293B" stroke="#475569" strokeWidth="1.1" />

            {/* Back Leg & Back Arm */}
            <UnifiedLeg
              p0={{ x: hip.x + 3, y: hip.y - 3 }}
              p1={{ x: knee.x + 3, y: knee.y - 2 }}
              p2={{ x: ankle.x + 3, y: ankle.y - 2 }}
              quadSide={1}
              backLayer
              footDir={1}
              footAngleDeg={76}
              ctx={ctx}
            />
            <UnifiedArm
              p0={{ x: shoulder.x + 4, y: shoulder.y - 3 }}
              p1={{ x: arm.p1.x + 4, y: arm.p1.y - 3 }}
              p2={{ x: hand.x + 5, y: hand.y - 2 }}
              bicepSide={-1}
              backLayer
              ctx={ctx}
            />

            {/* Front Straight Leg */}
            <UnifiedLeg
              p0={hip}
              p1={knee}
              p2={ankle}
              quadSide={1}
              footDir={1}
              footAngleDeg={76}
              ctx={ctx}
            />

            {/* Rigid Braced Torso (chestSide=-1 faces DOWN toward floor) */}
            <UnifiedSideTorso
              sx={shoulder.x}
              sy={shoulder.y}
              hx={hip.x}
              hy={hip.y}
              chestSide={-1}
              chest="primary"
              abs="secondary"
              headAngleAdjust={-10}
              ctx={ctx}
            />

            {renderTrajectory('M 256 164 L 256 118')}

            {/* Front Pressing Arm */}
            <UnifiedArm
              p0={shoulder}
              p1={arm.p1}
              p2={hand}
              tricepRole="secondary"
              deltRole="secondary"
              bicepSide={-1}
              ctx={ctx}
            />
          </g>
        );
      }

      case 'incline-push-up': {
        // Side Profile pressing off a sturdy elevated bench/plyo box on the right
        const ankle = { x: 80, y: 184 };
        const bodyDeg = lerp(-23, -41, p);
        const rad = (bodyDeg * Math.PI) / 180;
        const knee = { x: ankle.x + Math.cos(rad) * 44, y: ankle.y + Math.sin(rad) * 44 };
        const hip = { x: ankle.x + Math.cos(rad) * 88, y: ankle.y + Math.sin(rad) * 88 };
        const shoulder = { x: ankle.x + Math.cos(rad) * 146, y: ankle.y + Math.sin(rad) * 146 };
        const hand = { x: 232, y: 132 };
        const arm = solveTwoBoneIK(shoulder.x, shoulder.y, hand.x, hand.y, 35, 33, 1);

        return (
          <g>
            {/* Elevated Athletic Plyo Box / Bench */}
            <rect x="222" y="132" width="74" height="12" rx="3" fill="#27272A" stroke="#94A3B8" strokeWidth="1.4" />
            <rect x="228" y="144" width="62" height="52" rx="2" fill="#131926" stroke="#475569" strokeWidth="1.3" />
            <line x1="234" y1="158" x2="284" y2="158" stroke="#334155" strokeWidth="1.2" />

            {/* Back Leg & Back Arm */}
            <UnifiedLeg
              p0={{ x: hip.x + 3, y: hip.y - 3 }}
              p1={{ x: knee.x + 3, y: knee.y - 2 }}
              p2={{ x: ankle.x + 3, y: ankle.y - 2 }}
              quadSide={1}
              backLayer
              footDir={1}
              footAngleDeg={72}
              ctx={ctx}
            />
            <UnifiedArm
              p0={{ x: shoulder.x + 4, y: shoulder.y - 3 }}
              p1={{ x: arm.p1.x + 4, y: arm.p1.y - 3 }}
              p2={{ x: hand.x + 5, y: hand.y - 2 }}
              bicepSide={-1}
              backLayer
              ctx={ctx}
            />

            {/* Front Straight Leg */}
            <UnifiedLeg
              p0={hip}
              p1={knee}
              p2={ankle}
              quadSide={1}
              footDir={1}
              footAngleDeg={72}
              ctx={ctx}
            />

            {/* Straight Elevated Plank Torso */}
            <UnifiedSideTorso
              sx={shoulder.x}
              sy={shoulder.y}
              hx={hip.x}
              hy={hip.y}
              chestSide={-1}
              chest="primary"
              abs="secondary"
              headAngleAdjust={-10}
              ctx={ctx}
            />

            {renderTrajectory('M 180 124 L 204 82')}

            {/* Front Pressing Arm */}
            <UnifiedArm
              p0={shoulder}
              p1={arm.p1}
              p2={hand}
              tricepRole="secondary"
              deltRole="secondary"
              bicepSide={-1}
              ctx={ctx}
            />
          </g>
        );
      }

      case 'pike-push-up': {
        // Crisp Side Profile Inverted-V (A-frame) Pike Push-Up:
        // Hands & toes planted solidly on the floor line, hips lifted high, straight legs (bendDir=-1 -> zero backward knees!),
        // elbows bending smoothly backward to lower the head toward the floor right in front of/between the hands and pressing back up.
        const ankle = { x: 112, y: 185 };
        const hip = { x: lerp(172, 154, p), y: lerp(114, 96, p) };
        const torsoDeg = lerp(52, 40, p);
        const tRad = (torsoDeg * Math.PI) / 180;
        const shoulder = { x: hip.x + Math.cos(tRad) * 56, y: hip.y + Math.sin(tRad) * 56 };
        const hand = { x: 208, y: 192 };

        // CRITICAL: bendDir=-1 keeps knees anatomically straight/slightly forward toward chest (NEVER bending backward!)
        const leg = solveTwoBoneIK(hip.x, hip.y, ankle.x, ankle.y, 50, 49, -1);
        const backLeg = solveTwoBoneIK(hip.x - 4, hip.y - 2, ankle.x - 6, ankle.y - 2, 50, 49, -1);
        const arm = solveTwoBoneIK(shoulder.x, shoulder.y, hand.x, hand.y, 34, 32, 1);

        return (
          <g>
            {/* Floor Mat */}
            <rect x="82" y="191" width="192" height="5" rx="2.5" fill="#1E293B" stroke="#475569" strokeWidth="1.1" />

            {/* Subtle Inverted-V A-Frame Reference Angle */}
            <path
              d={`M ${ankle.x} 190 L ${hip.x} ${hip.y} L ${hand.x} 190`}
              stroke="#475569"
              strokeWidth="1.1"
              strokeDasharray="3 4"
              strokeOpacity="0.35"
              fill="none"
            />

            {/* Back Leg & Back Arm */}
            <UnifiedLeg
              p0={backLeg.p0}
              p1={backLeg.p1}
              p2={backLeg.p2}
              quadSide={1}
              backLayer
              footDir={1}
              footAngleDeg={55}
              ctx={ctx}
            />
            <UnifiedArm
              p0={{ x: shoulder.x + 5, y: shoulder.y - 3 }}
              p1={{ x: arm.p1.x + 5, y: arm.p1.y - 3 }}
              p2={{ x: hand.x + 6, y: hand.y - 2 }}
              bicepSide={-1}
              backLayer
              ctx={ctx}
            />

            {/* Front Straight A-Frame Leg */}
            <UnifiedLeg
              p0={leg.p0}
              p1={leg.p1}
              p2={leg.p2}
              quadSide={1}
              footDir={1}
              footAngleDeg={55}
              ctx={ctx}
            />

            {/* Inverted-V Torso Lowering Head Smoothly Toward Floor Between/Ahead of Hands */}
            <UnifiedSideTorso
              sx={shoulder.x}
              sy={shoulder.y}
              hx={hip.x}
              hy={hip.y}
              chestSide={-1}
              upperBack="secondary"
              abs="secondary"
              headAngleAdjust={6}
              ctx={ctx}
            />

            {renderTrajectory('M 244 166 L 234 122')}

            {/* Front Pressing Arm with Glowing Front Delt (#FF4500) */}
            <UnifiedArm
              p0={shoulder}
              p1={arm.p1}
              p2={hand}
              deltRole="primary"
              tricepRole="secondary"
              bicepSide={-1}
              ctx={ctx}
            />
          </g>
        );
      }

      case 'inverted-bodyweight-row': {
        // CRYSTAL-CLEAR SIDE PROFILE: Fixed overhead bar supported by vertical rack upright directly above the chest.
        // Head, neck (headAngleAdjust=0), torso, hips, and legs are locked in ONE rigid straight reverse-plank line
        // pivoting smoothly on a stationary heel contact point planted pixel-flush on FLOOR_Y = 196!
        // Arms extend cleanly straight at the bottom (p=0) and bend cleanly at the elbows behind the ribs to pull chest right up to the bar (p=1).
        const isFemale = ctx.gender === 'female';
        const bar = { x: 184, y: 91 };
        const heelPivot = { x: 280, y: FLOOR_Y };

        const bodyDeg = lerp(194, 217, p);
        const rad = (bodyDeg * Math.PI) / 180;
        // Ankle locked strictly perpendicular (90°) to straight shin so toes point cleanly upward while heel stays welded to FLOOR_Y = 196
        const footAngleDeg = bodyDeg - 270;
        const footRad = (footAngleDeg * Math.PI) / 180;
        const heelLocalX = -9 * Math.cos(footRad) - 8 * Math.sin(footRad);
        const heelLocalY = -9 * Math.sin(footRad) + 8 * Math.cos(footRad);
        const ankle = { x: heelPivot.x - heelLocalX, y: heelPivot.y - heelLocalY };

        const knee = { x: ankle.x + Math.cos(rad) * 44, y: ankle.y + Math.sin(rad) * 44 };
        const hip = { x: ankle.x + Math.cos(rad) * 88, y: ankle.y + Math.sin(rad) * 88 };
        const shoulder = { x: ankle.x + Math.cos(rad) * 142, y: ankle.y + Math.sin(rad) * 142 };

        // L1=39, L2=38 -> straight arms at bottom (dist=76.4px), clean vertical-forearm row pull at top with elbow behind ribs!
        const arm = solveTwoBoneIK(shoulder.x, shoulder.y, bar.x, bar.y, 39, 38, 1);
        const farBar = { x: bar.x - 5, y: bar.y - 3 };
        const farShoulder = { x: shoulder.x - 6, y: shoulder.y - 3 };
        const farArm = solveTwoBoneIK(farShoulder.x, farShoulder.y, farBar.x, farBar.y, 39, 38, 1);

        return (
          <g>
            {/* Clean Vertical Squat/Smith Rack Upright Directly Behind Fixed Bar (ZERO Clipping Across Athlete!) */}
            <path d="M184 58V196M162 196H206" stroke="#272A36" strokeWidth="5.4" strokeLinecap="round" />
            {[68, 80, 106, 120, 134, 148].map((hy) => (
              <circle key={hy} cx="184" cy={hy} r="1.4" fill="#52525B" />
            ))}
            {/* J-Cup Cradle Supporting Fixed Bar Directly Above Chest */}
            <rect x="177" y="84" width="14" height="14" rx="3" fill="#181A22" stroke="#64748B" strokeWidth="1.2" />

            {/* Subtle Rigid Reverse-Plank Alignment Line (Shoulder -> Hip -> Ankle) */}
            <line
              x1={shoulder.x}
              y1={shoulder.y}
              x2={ankle.x}
              y2={ankle.y}
              stroke="#52525B"
              strokeWidth="1.05"
              strokeDasharray="3 4"
              strokeOpacity="0.38"
            />

            {/* Back Leg & Back Arm (Clean 3/4 Depth Layer) */}
            <UnifiedLeg
              p0={{ x: hip.x - 4, y: hip.y - 2 }}
              p1={{ x: knee.x - 4, y: knee.y - 2 }}
              p2={{ x: ankle.x - 5, y: ankle.y - 1 }}
              quadSide={-1}
              backLayer
              footDir={1}
              footAngleDeg={footAngleDeg}
              ctx={ctx}
            />
            <UnifiedArm
              p0={farArm.p0}
              p1={farArm.p1}
              p2={farArm.p2}
              bicepSide={-1}
              backLayer
              scale={isFemale ? 0.84 : 0.92}
              ctx={ctx}
            />

            {/* Front Straight Leg Pivoting Firmly on Heel (Toes Pointing Cleanly UPWARD!) */}
            <UnifiedLeg
              p0={hip}
              p1={knee}
              p2={ankle}
              quadSide={-1}
              footDir={1}
              footAngleDeg={footAngleDeg}
              ctx={ctx}
            />

            {/* Rigid Face-Up Straight Reverse-Plank Torso (Zero Neck/Waist Bending — headAngleAdjust=0) */}
            <UnifiedSideTorso
              sx={shoulder.x}
              sy={shoulder.y}
              hx={hip.x}
              hy={hip.y}
              chestSide={-1}
              upperBack="primary"
              lats="primary"
              abs="secondary"
              headAngleAdjust={0}
              ctx={ctx}
            />

            {/* Fixed Side-Profile Overhead Barbell Shaft & Sleeve Directly Above Chest */}
            <line x1={farBar.x - 2} y1={farBar.y - 1} x2={bar.x + 4} y2={bar.y + 2} stroke="#E4E4E7" strokeWidth="5.2" strokeLinecap="round" />
            <circle cx={bar.x} cy={bar.y} r="4.6" fill="#27272E" stroke="#E4E4E7" strokeWidth="1.5" />
            <circle cx={bar.x} cy={bar.y} r="1.9" fill="#FF4500" />

            {renderTrajectory('M 208 148 L 222 108')}

            {/* Front Pulling Arm Extending Straight at Bottom & Pulling Chest Cleanly Up to Bar */}
            <UnifiedArm
              p0={shoulder}
              p1={arm.p1}
              p2={bar}
              deltRole="primary"
              bicepRole="secondary"
              bicepSide={-1}
              scale={isFemale ? 0.86 : 0.96}
              ctx={ctx}
            />

            {/* Stationary Grounded Heel Pivot Contact Marker on FLOOR_Y = 196 */}
            <circle cx={heelPivot.x} cy={FLOOR_Y - 1} r="2.8" fill="#141418" stroke="#FACC15" strokeWidth="1.35" opacity="0.92" />
          </g>
        );
      }

      case 'bodyweight-squat': {
        // Side Profile facing RIGHT: flat feet anchored on floor, counterbalance arms extending smoothly forward at bottom of squat
        const depth = 1 - p;
        const ankle = { x: 184, y: GROUNDED_ANKLE_Y };
        const hip = { x: lerp(178, 144, depth), y: lerp(110, 146, depth) };
        const shoulder = { x: lerp(180, 174, depth), y: lerp(56, 96, depth) };
        const leg = solveTwoBoneIK(hip.x, hip.y, ankle.x, ankle.y, 44, 44, -1);
        const backLeg = solveTwoBoneIK(hip.x - 4, hip.y, ankle.x - 10, ankle.y, 44, 44, -1);

        const armDeg = lerp(80, 4, depth);
        const arm = solveTwoBoneFK(shoulder.x, shoulder.y, 31, armDeg, 29, armDeg - 4);
        const backArm = solveTwoBoneFK(shoulder.x + 4, shoulder.y - 2, 30, armDeg - 3, 28, armDeg - 6);

        return (
          <g>
            {/* Back Leg & Back Counterbalance Arm */}
            <UnifiedLeg p0={backLeg.p0} p1={backLeg.p1} p2={backLeg.p2} backLayer quadSide={-1} ctx={ctx} />
            <UnifiedArm p0={backArm.p0} p1={backArm.p1} p2={backArm.p2} backLayer bicepSide={-1} ctx={ctx} />

            {/* Front Squatting Leg */}
            <UnifiedLeg
              p0={leg.p0}
              p1={leg.p1}
              p2={leg.p2}
              quadRole="primary"
              hamRole="secondary"
              quadSide={-1}
              ctx={ctx}
            />

            {/* Upright Neutral Torso */}
            <UnifiedSideTorso
              sx={shoulder.x}
              sy={shoulder.y}
              hx={hip.x}
              hy={hip.y}
              chestSide={-1}
              glute="secondary"
              abs="secondary"
              ctx={ctx}
            />

            {renderTrajectory('M 122 144 L 122 96')}

            {/* Front Counterbalance Arm */}
            <UnifiedArm p0={arm.p0} p1={arm.p1} p2={arm.p2} bicepSide={-1} scale={0.92} ctx={ctx} />
          </g>
        );
      }

      case 'reverse-lunge': {
        // Side Profile facing RIGHT: front foot planted flat, back leg steps smoothly backward into a textbook 90°/90° lunge
        const depth = 1 - p;
        const frontAnkle = { x: 212, y: GROUNDED_ANKLE_Y };
        const backAnkle = { x: lerp(200, 120, depth), y: lerp(GROUNDED_ANKLE_Y, 183, depth) };
        const hip = { x: lerp(202, 166, depth), y: lerp(108, 143, depth) };
        const shoulder = { x: lerp(204, 174, depth), y: lerp(54, 89, depth) };

        const frontLeg = solveTwoBoneIK(hip.x, hip.y, frontAnkle.x, frontAnkle.y, 44, 44, -1);
        const backLeg = solveTwoBoneIK(hip.x - 4, hip.y + 1, backAnkle.x, backAnkle.y, 44, 44, -1);
        const arm = solveTwoBoneIK(shoulder.x, shoulder.y, hip.x + 6, hip.y - 4, 28, 26, 1);

        return (
          <g>
            {/* Back Stepping Leg (90° Knee Hovering Cleanly Above Floor) */}
            <UnifiedLeg
              p0={backLeg.p0}
              p1={backLeg.p1}
              p2={backLeg.p2}
              backLayer
              quadSide={-1}
              footAngleDeg={lerp(0, 68, depth)}
              ctx={ctx}
            />

            {/* Front Anchored Driving Leg */}
            <UnifiedLeg
              p0={frontLeg.p0}
              p1={frontLeg.p1}
              p2={frontLeg.p2}
              quadRole="primary"
              hamRole="secondary"
              quadSide={-1}
              ctx={ctx}
            />

            {/* Tall Upright Torso with Glowing Glutes */}
            <UnifiedSideTorso
              sx={shoulder.x}
              sy={shoulder.y}
              hx={hip.x}
              hy={hip.y}
              chestSide={-1}
              glute="primary"
              abs="secondary"
              ctx={ctx}
            />

            {renderTrajectory('M 250 142 L 250 92')}

            {/* Hand on Hip for Clean Upright Balance */}
            <UnifiedArm p0={arm.p0} p1={arm.p1} p2={arm.p2} scale={0.9} bicepSide={-1} ctx={ctx} />
          </g>
        );
      }

      case 'glute-bridge': {
        // Side Profile supine on gym mat: shoulders & flat feet anchored while hips thrust cleanly up into straight-line bridge
        const shoulder = { x: 112, y: 181 };
        const ankle = { x: 232, y: GROUNDED_ANKLE_Y };
        const torsoDeg = lerp(2, -28, p);
        const rad = (torsoDeg * Math.PI) / 180;
        const hip = { x: shoulder.x + Math.cos(rad) * 62, y: shoulder.y + Math.sin(rad) * 62 };

        const leg = solveTwoBoneIK(hip.x, hip.y, ankle.x, ankle.y, 46, 45, -1);
        const backLeg = solveTwoBoneIK(hip.x - 4, hip.y - 2, ankle.x - 6, ankle.y - 2, 46, 45, -1);
        const elbow = { x: 144, y: 187 };
        const hand = { x: 178, y: 189 };

        return (
          <g>
            {/* Floor Mat */}
            <rect x="64" y="191" width="220" height="5" rx="2.5" fill="#1E293B" stroke="#475569" strokeWidth="1.1" />

            {/* Back Bent Leg */}
            <UnifiedLeg p0={backLeg.p0} p1={backLeg.p1} p2={backLeg.p2} backLayer quadSide={-1} ctx={ctx} />

            {/* Front Bent Leg Driving Through Heels */}
            <UnifiedLeg
              p0={leg.p0}
              p1={leg.p1}
              p2={leg.p2}
              hamRole="secondary"
              quadSide={-1}
              ctx={ctx}
            />

            {/* Supine Torso Bridging Upward with Glowing Glutes (#FF4500) */}
            <UnifiedSideTorso
              sx={shoulder.x}
              sy={shoulder.y}
              hx={hip.x}
              hy={hip.y}
              chestSide={-1}
              glute="primary"
              abs="secondary"
              headAngleAdjust={lerp(0, 14, p)}
              ctx={ctx}
            />

            {renderTrajectory('M 168 176 L 168 134')}

            {/* Stabilizing Arm Resting Flat Along Mat */}
            <UnifiedArm p0={shoulder} p1={elbow} p2={hand} scale={0.9} bicepSide={-1} ctx={ctx} />
          </g>
        );
      }

      case 'basic-abdominal-crunch': {
        // Side Profile supine on gym mat: lower back & bent knees stay anchored while upper back curls up ~35° with hands lightly beside temples
        const hip = { x: 174, y: 183 };
        const ankle = { x: 238, y: GROUNDED_ANKLE_Y };
        const leg = solveTwoBoneIK(hip.x, hip.y, ankle.x, ankle.y, 46, 45, -1);
        const backLeg = solveTwoBoneIK(hip.x - 4, hip.y - 2, ankle.x - 6, ankle.y - 2, 46, 45, -1);

        // Smooth upper-spine flexion (constant ~60px length, lower back stays pressed to mat)
        const shoulder = { x: lerp(114, 128, p), y: lerp(181, 145, p) };
        const midBack = { x: lerp(144, 146, p), y: lerp(187, 174, p) };
        const midAbs = { x: lerp(144, 154, p), y: lerp(171, 158, p) };

        const headCenter = { x: lerp(96, 120, p), y: lerp(177, 126, p) };
        const headRot = lerp(-86, -42, p);

        const hand = { x: headCenter.x + lerp(4, 3, p), y: headCenter.y + lerp(-6, -2, p) };
        const arm = solveTwoBoneIK(shoulder.x, shoulder.y, hand.x, hand.y, 24, 22, 1);

        const isFemale = ctx.gender === 'female';
        const curvedTorsoPath = isFemale
          ? [
              `M ${shoulder.x - 3.5} ${shoulder.y + 7.2}`,
              `C ${midBack.x - 4} ${midBack.y + 7.2}, ${hip.x - 4} ${hip.y + 9.2}, ${hip.x + 9.5} ${hip.y + 8.8}`,
              `C ${hip.x + 13.5} ${hip.y + 4.2}, ${hip.x + 12.0} ${hip.y - 7.5}, ${hip.x - 2.5} ${hip.y - 9.2}`,
              `C ${midAbs.x + 2} ${midAbs.y - 5.2}, ${shoulder.x + 16.5} ${shoulder.y - 7.5}, ${shoulder.x + 10.2} ${shoulder.y - 13.2}`,
              `C ${shoulder.x + 4.5} ${shoulder.y - 14.5}, ${shoulder.x - 9.5} ${shoulder.y - 4.2}, ${shoulder.x - 3.5} ${shoulder.y + 7.2}`,
              `Z`,
            ].join(' ')
          : [
              `M ${shoulder.x - 5} ${shoulder.y + 9.5}`,
              `Q ${midBack.x} ${midBack.y + 10.5}, ${hip.x + 8.5} ${hip.y + 7.5}`,
              `Q ${hip.x + 12.5} ${hip.y - 7.5}, ${hip.x - 2.5} ${hip.y - 10.2}`,
              `Q ${midAbs.x} ${midAbs.y - 8.8}, ${shoulder.x + 6} ${shoulder.y - 11.6}`,
              `Q ${shoulder.x - 11.5} ${shoulder.y - 5.0}, ${shoulder.x - 5} ${shoulder.y + 9.5}`,
              `Z`,
            ].join(' ');

        const absPaint = getMusclePaint('primary', ctx);
        const corePaint = getMusclePaint('secondary', ctx);

        return (
          <g>
            {/* Floor Mat */}
            <rect x="64" y="191" width="220" height="5" rx="2.5" fill="#1E293B" stroke="#475569" strokeWidth="1.1" />

            {/* Back Bent Leg & Back Arm */}
            <UnifiedLeg p0={backLeg.p0} p1={backLeg.p1} p2={backLeg.p2} backLayer quadSide={-1} ctx={ctx} />
            <UnifiedArm
              p0={{ x: shoulder.x - 3, y: shoulder.y - 2 }}
              p1={{ x: arm.p1.x - 4, y: arm.p1.y - 2 }}
              p2={{ x: hand.x - 3, y: hand.y - 2 }}
              bicepSide={-1}
              backLayer
              ctx={ctx}
            />

            {/* Front Bent Leg Anchored Flat on Floor */}
            <UnifiedLeg p0={leg.p0} p1={leg.p1} p2={leg.p2} quadSide={-1} ctx={ctx} />

            {/* Curved Supine Torso + Smooth Faceless Side-Profile Athletic Head */}
            <g>
              <g transform={`translate(${headCenter.x} ${headCenter.y}) rotate(${headRot})`}>
                {isFemale && (
                  <g>
                    {/* Flowing Tapered S-Curved Athletic Ponytail */}
                    <path
                      d="M -5.2 -5.0 C -9.8 -7.8, -15.2 -4.8, -15.6 0.8 C -16.0 5.4, -14.0 9.4, -15.4 13.2 C -16.2 15.2, -17.4 16.4, -18.0 17.0 C -15.2 16.4, -12.8 14.0, -11.8 10.2 C -11.0 7.0, -11.6 3.6, -10.6 0.6 C -9.6 -2.2, -7.6 -3.6, -4.8 -3.4 Z"
                      fill={`url(#${ctx.bodyGrad})`}
                      stroke="#52525B"
                      strokeOpacity="0.82"
                      strokeWidth="0.95"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M -8.2 -4.0 C -12.2 -3.6, -13.8 0.4, -13.4 5.2 C -13.1 8.8, -13.8 11.8, -15.8 14.6"
                      fill="none"
                      stroke="#94A3B8"
                      strokeOpacity="0.28"
                      strokeWidth="0.7"
                      strokeLinecap="round"
                    />
                    <ellipse cx="-6.0" cy="-4.6" rx="1.45" ry="2.1" transform="rotate(28 -6.0 -4.6)" fill="#FF4500" fillOpacity="0.86" />
                  </g>
                )}
                <path
                  d={
                    isFemale
                      ? 'M -4.8 7.0 C -8.4 3.4, -8.2 -5.8, -1.8 -8.8 C 3.4 -10.0, 7.2 -7.2, 7.8 -3.2 C 8.3 -0.6, 8.2 2.2, 7.2 4.8 C 6.2 6.8, 3.8 7.8, 1.2 7.8 C -1.4 7.8, -3.4 7.8, -4.8 7.0 Z'
                      : 'M -5.2 7.4 C -9.0 3.6, -8.8 -6.2, -2.0 -9.4 C 3.6 -10.6, 7.6 -7.6, 8.4 -3.4 C 8.9 -0.6, 8.8 2.4, 7.6 5.2 C 6.6 7.2, 4.0 8.2, 1.2 8.2 C -1.4 8.2, -3.6 8.2, -5.2 7.4 Z'
                  }
                  fill={`url(#${ctx.bodyGrad})`}
                  stroke="#52525B"
                  strokeOpacity="0.84"
                  strokeWidth="1.0"
                  strokeLinejoin="round"
                />
              </g>
              <path
                d={curvedTorsoPath}
                fill={`url(#${ctx.bodyGrad})`}
                stroke="#52525B"
                strokeOpacity="0.82"
                strokeWidth="1.05"
                strokeLinejoin="round"
              />
              {/* Subtle Athletic Sports-Bra Band Contour (Female) */}
              {isFemale && (
                <path
                  d={`M ${shoulder.x + 15.2} ${shoulder.y - 7.8} Q ${shoulder.x + 12.5} ${shoulder.y + 1.5} ${midBack.x - 10.5} ${midBack.y + 5.8}`}
                  fill="none"
                  stroke="#94A3B8"
                  strokeOpacity="0.22"
                  strokeWidth="0.85"
                  strokeLinecap="round"
                />
              )}
              {/* Blaze Orange-Red (#FF4500) Upper Abs Compressing on Crunch */}
              {absPaint && (
                <g fill={absPaint.fill} opacity={absPaint.opacity} filter={absPaint.filter}>
                  <ellipse
                    cx={lerp(138, 144, p)}
                    cy={lerp(174, 156, p)}
                    rx={lerp(6.4, 5.2, p)}
                    ry="4.8"
                    transform={`rotate(${lerp(4, 34, p)} ${lerp(138, 144, p)} ${lerp(174, 156, p)})`}
                  />
                  <ellipse
                    cx={lerp(151, 155, p)}
                    cy={lerp(174, 165, p)}
                    rx={lerp(6.0, 4.9, p)}
                    ry="4.6"
                    transform={`rotate(${lerp(2, 24, p)} ${lerp(151, 155, p)} ${lerp(174, 165, p)})`}
                  />
                </g>
              )}
              {corePaint && (
                <ellipse
                  cx={lerp(163, 165, p)}
                  cy={lerp(175, 172, p)}
                  rx="5.2"
                  ry="4.2"
                  fill={corePaint.fill}
                  opacity={corePaint.opacity * 0.8}
                  filter={corePaint.filter}
                />
              )}
            </g>

            {/* Curved Upper-Back Crunch Trajectory */}
            {renderTrajectory('M 102 152 Q 112 124 136 114')}

            {/* Front Arm with Fingertips Lightly Resting Beside Temple */}
            <UnifiedArm p0={shoulder} p1={arm.p1} p2={hand} scale={0.9} bicepSide={-1} ctx={ctx} />
          </g>
        );
      }

      default: {
        const shoulder = { x: 132, y: 126 };
        const hip = { x: 196, y: 130 };
        const handTarget = { x: lerp(148, 134, p), y: lerp(104, 54, p) };
        const arm = solveTwoBoneIK(shoulder.x, shoulder.y, handTarget.x, handTarget.y, 38, 35, 1);
        const leg = solveTwoBoneIK(hip.x, hip.y, 248, GROUNDED_ANKLE_Y, 44, 44, -1);
        return (
          <g>
            <UnifiedLeg p0={leg.p0} p1={leg.p1} p2={leg.p2} quadSide={-1} ctx={ctx} />
            <UnifiedSideTorso sx={shoulder.x} sy={shoulder.y} hx={hip.x} hy={hip.y} chestSide={-1} chest="primary" ctx={ctx} />
            {renderTrajectory('M 156 102 L 140 54')}
            <UnifiedArm p0={arm.p0} p1={arm.p1} p2={arm.p2} tricepRole="secondary" bicepSide={-1} ctx={ctx} handProp={<OlympicBarbellSide3D r={16} />} />
          </g>
        );
      }
    }
  };

  return (
    <svg
      viewBox="0 0 360 212"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-full h-full block"
      role="img"
      aria-label={`แอนิเมชันท่าฝึกชีวกลศาสตร์ ${exercise.name}`}
    >
      <defs>
        {/* MuscleWiki / Nike Training-Grade 3D Graphite Studio Body Gradients */}
        <linearGradient id={bodyGrad} x1="12%" y1="0%" x2="88%" y2="100%">
          <stop offset="0%" stopColor="#3B3B45" />
          <stop offset="48%" stopColor="#23232A" />
          <stop offset="100%" stopColor="#131317" />
        </linearGradient>
        <linearGradient id={backGrad} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#23232A" />
          <stop offset="100%" stopColor="#101014" />
        </linearGradient>
        {/* 3D Sculpted Primary Muscle Gradient (Blaze Orange-Red Depth) */}
        <linearGradient id={primaryGrad} x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#FF8B42" />
          <stop offset="40%" stopColor="#FF4500" />
          <stop offset="100%" stopColor="#A31919" />
        </linearGradient>
        {/* 3D Sculpted Secondary Synergist Gradient (Crisp Steel Blue Depth) */}
        <linearGradient id={secondaryGrad} x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#93E2FE" />
          <stop offset="45%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>
        <filter id={voltGlow} x="-35%" y="-35%" width="170%" height="170%">
          <feGaussianBlur stdDeviation={isPeakHold ? '3.4' : '2.4'} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={cobaltGlow} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <marker
          id={arrowId}
          viewBox="0 0 10 10"
          refX="6.5"
          refY="5"
          markerWidth="6.2"
          markerHeight="6.2"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.2 L 9.5 5 L 0 8.8 z" fill="#FACC15" />
        </marker>
      </defs>

      {/* Clean Subtle Dark Grid */}
      <g stroke="#E4E4E7" strokeOpacity="0.035" strokeWidth="1">
        <line x1="0" y1="54" x2="360" y2="54" />
        <line x1="0" y1="108" x2="360" y2="108" />
        <line x1="0" y1="162" x2="360" y2="162" />
        <line x1="90" y1="0" x2="90" y2="212" />
        <line x1="180" y1="0" x2="180" y2="212" />
        <line x1="270" y1="0" x2="270" y2="212" />
      </g>

      {/* Crisp Horizontal Gym Floor Plane (y = 196) so Feet Sit Flat & Grounded */}
      {!isTopDown && (
        <g>
          <rect x="0" y={FLOOR_Y} width="360" height="16" fill="#09090B" fillOpacity="0.72" />
          <line
            x1="20"
            y1={FLOOR_Y}
            x2="340"
            y2={FLOOR_Y}
            stroke="#E4E4E7"
            strokeOpacity="0.42"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      )}

      {renderExercise()}
    </svg>
  );
};

// ================= MAIN EXPORTED COMPONENT =================

export const ExerciseFormAnimation: React.FC<ExerciseFormAnimationProps> = ({
  exercise,
  gender = 'male',
  className = '',
}) => {
  const [paused, setPaused] = useState(false);
  const [slowMo, setSlowMo] = useState(false);
  const [peakHoldLocked, setPeakHoldLocked] = useState(false);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    setCycle(0);
    setPaused(false);
    setPeakHoldLocked(false);
  }, [exercise.id]);

  useEffect(() => {
    if (paused || peakHoldLocked) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setCycle(0.32);
      return;
    }

    const durationMs = slowMo ? 8000 : 4000;
    let rafId = 0;
    let lastTs = performance.now();

    const step = (now: number) => {
      const dt = Math.min(80, now - lastTs);
      lastTs = now;
      setCycle((prev) => (prev + dt / durationMs) % 1);
      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, [paused, slowMo, peakHoldLocked, exercise.id]);

  const effectiveCycle = peakHoldLocked ? 0.32 : cycle;
  const { p, phase } = sampleAsymmetricTempo(effectiveCycle);
  const isPeak = phase === 'peak' || peakHoldLocked;
  const dashOffset = -(effectiveCycle * 44);
  const spec = getExerciseSpec(exercise);

  const activeCueText = isPeak
    ? spec.peakCueTh
    : phase === 'concentric'
      ? spec.concentricCueTh
      : spec.eccentricCueTh;

  const handleTogglePlayPause = () => {
    if (peakHoldLocked) {
      setPeakHoldLocked(false);
      setPaused(false);
      return;
    }
    setPaused((prev) => !prev);
  };

  const handleTogglePeakHold = () => {
    setPeakHoldLocked((prev) => {
      const next = !prev;
      if (next) setCycle(0.32);
      return next;
    });
  };

  return (
    <div className={`scoreboard-cell rounded-2xl w-full max-w-full overflow-hidden border border-[#E4E4E7]/12 ${className}`}>
      {/* Studio Header: Camera Angle + Tempo */}
      <div className="bg-knurling px-3.5 sm:px-4 py-2.5 border-b border-[#E4E4E7]/12 flex items-start sm:items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-start sm:items-center gap-2 min-w-0 flex-1">
          <Eye className="w-3.5 h-3.5 text-[#FF4500] shrink-0 mt-0.5 sm:mt-0" />
          <span className="text-xs font-bold text-[#F4F4F5] whitespace-normal break-words leading-snug">
            {spec.cameraLabelTh}
          </span>
        </div>

        <span className="text-[11px] font-semibold text-zinc-400 tabular-nums whitespace-nowrap shrink-0">
          {slowMo ? '0.5x สโลว์ (8 วิ)' : '1.0x ปกติ (4 วิ)'}
        </span>
      </div>

      {/* Unobstructed Studio Animation Canvas (Feet & Gym Floor 100% Visible) */}
      <div className="relative h-[212px] sm:h-[228px] w-full max-w-full overflow-hidden bg-gradient-to-b from-[#121216] via-[#16161C] to-[#0D0D0F] flex items-center justify-center px-2">
        <StudioBiomechanicalScene
          exercise={exercise}
          gender={gender}
          p={p}
          isPeakHold={isPeak}
          dashOffset={dashOffset}
        />

        {/* Top-Left Key Alignment Cue Badge */}
        <div className="absolute top-2.5 left-3 max-w-[66%] pointer-events-none">
          <span className="inline-flex items-start gap-1.5 max-w-full px-2.5 py-1 rounded-lg bg-[#0D0D0F]/92 backdrop-blur-md border border-[#E4E4E7]/16 text-[11px] font-semibold text-[#F4F4F5] shadow-md shadow-black/60">
            <Compass className="w-3.5 h-3.5 text-[#FACC15] shrink-0 mt-0.5" />
            <span className="whitespace-normal break-words leading-snug">{spec.alignmentCueTh}</span>
          </span>
        </div>

        {/* Top-Right Pulsing Peak Squeeze Badge */}
        {isPeak && (
          <div className="absolute top-2.5 right-3 pointer-events-none">
            <span className="anim-peak-squeeze-badge inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FACC15] text-[#111113] font-bold text-[11px] tracking-wide">
              เกร็งค้าง (Peak)
            </span>
          </div>
        )}
      </div>

      {/* Dedicated Unobstructed Grip & Angle Bar + Muscle Target Legend */}
      <div className="px-4 py-2.5 bg-[#141418] border-t border-[#E4E4E7]/10 space-y-2 text-[11px]">
        <div className="flex items-start gap-2 text-[#F4F4F5] font-semibold">
          <Hand className="w-3.5 h-3.5 text-[#FACC15] shrink-0 mt-0.5" />
          <span className="whitespace-normal break-words leading-snug min-w-0 flex-1">{spec.gripBadgeTh}</span>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1.5 pt-1.5 border-t border-white/[0.06]">
          <div className="inline-flex items-start gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF4500] shrink-0 mt-1" />
            <span className="text-zinc-300 whitespace-normal break-words leading-snug">
              <strong className="text-[#FF6B35]">กล้ามเนื้อหลัก</strong> · {exercise.subMuscleTh}
            </span>
          </div>
          <div className="inline-flex items-start gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] shrink-0 mt-1" />
            <span className="text-zinc-300 whitespace-normal break-words leading-snug">
              <strong className="text-[#38BDF8]">กล้ามเนื้อรอง</strong> · {spec.secondaryMusclesTh}
            </span>
          </div>
        </div>
      </div>

      {/* Tempo Bar + Live Cue + Interactive 1.0x / 0.5x / Peak Hold Controls */}
      <div className="px-4 py-3 bg-[#0D0D0F] border-t border-[#E4E4E7]/10 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold">
            <span className={phase === 'concentric' && !peakHoldLocked ? 'text-[#FF6B35]' : 'text-zinc-500'}>
              ออกแรง (0–25%)
            </span>
            <span className={isPeak ? 'text-[#FACC15]' : 'text-zinc-500'}>
              เกร็งค้าง (25–40%)
            </span>
            <span className={phase === 'eccentric' && !peakHoldLocked ? 'text-[#38BDF8]' : 'text-zinc-500'}>
              ผ่อนช้า (40–100%)
            </span>
          </div>

          <div className="relative h-1.5 rounded-full bg-[#18181D] border border-[#E4E4E7]/10 overflow-hidden">
            <div
              className="absolute inset-y-0 left-[25%] w-[15%] bg-[#FACC15]/20 border-x border-[#FACC15]/45"
              aria-hidden="true"
            />
            <div
              className={`relative h-full rounded-full ${
                isPeak ? 'bg-[#FACC15]' : 'bg-gradient-to-r from-[#FF4500] to-[#FACC15]'
              }`}
              style={{ width: `${Math.max(4, Math.round(effectiveCycle * 100))}%` }}
            />
          </div>

          <p className="text-xs text-zinc-200 leading-relaxed">
            <span className={`font-bold mr-1.5 ${isPeak ? 'text-[#FACC15]' : phase === 'concentric' ? 'text-[#FF6B35]' : 'text-[#38BDF8]'}`}>
              {isPeak ? 'เกร็งค้าง:' : phase === 'concentric' ? 'ออกแรง:' : 'ผ่อนช้า:'}
            </span>
            {activeCueText}
          </p>
        </div>

        <div className="grid grid-cols-4 gap-1.5 pt-2.5 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={handleTogglePlayPause}
            className={`btn-tactile min-h-[44px] md:min-h-[40px] px-1.5 sm:px-2 rounded-xl border text-[11px] font-bold inline-flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap ${
              !paused && !peakHoldLocked
                ? 'bg-white/[0.07] hover:bg-white/[0.13] border-[#E4E4E7]/15 text-[#F4F4F5]'
                : 'bg-[#FF4500] border-[#FF4500] text-white'
            }`}
          >
            {paused || peakHoldLocked ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                <span>เล่น</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 shrink-0" />
                <span>หยุด</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setSlowMo(false);
              if (peakHoldLocked) setPeakHoldLocked(false);
            }}
            aria-pressed={!slowMo && !peakHoldLocked}
            className={`btn-tactile min-h-[44px] md:min-h-[40px] px-1.5 sm:px-2 rounded-xl border text-[11px] font-bold inline-flex items-center justify-center whitespace-nowrap tabular-nums ${
              !slowMo && !peakHoldLocked
                ? 'bg-[#FF4500]/20 border-[#FF4500]/70 text-[#F4F4F5]'
                : 'bg-white/[0.04] hover:bg-white/[0.09] border-[#E4E4E7]/10 text-zinc-400'
            }`}
          >
            1.0x
          </button>

          <button
            type="button"
            onClick={() => {
              setSlowMo(true);
              if (peakHoldLocked) setPeakHoldLocked(false);
            }}
            aria-pressed={slowMo && !peakHoldLocked}
            className={`btn-tactile min-h-[44px] md:min-h-[40px] px-1.5 sm:px-2 rounded-xl border text-[11px] font-bold inline-flex items-center justify-center gap-1 whitespace-nowrap tabular-nums ${
              slowMo && !peakHoldLocked
                ? 'bg-[#FF4500]/22 border-[#FF4500]/75 text-[#F4F4F5]'
                : 'bg-white/[0.04] hover:bg-white/[0.09] border-[#E4E4E7]/10 text-zinc-400'
            }`}
          >
            <Gauge className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
            <span>0.5x</span>
          </button>

          <button
            type="button"
            onClick={handleTogglePeakHold}
            aria-pressed={peakHoldLocked}
            className={`btn-tactile min-h-[44px] md:min-h-[40px] px-1.5 sm:px-2 rounded-xl border text-[11px] font-bold inline-flex items-center justify-center gap-1 whitespace-nowrap ${
              peakHoldLocked
                ? 'bg-[#FACC15] border-[#FACC15] text-[#111113]'
                : 'bg-white/[0.04] hover:bg-white/[0.09] border-[#E4E4E7]/10 text-zinc-300'
            }`}
          >
            {peakHoldLocked ? (
              <Unlock className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-[#FACC15] shrink-0" />
            )}
            <span>ค้างจุดสุด</span>
          </button>
        </div>
      </div>
    </div>
  );
};
