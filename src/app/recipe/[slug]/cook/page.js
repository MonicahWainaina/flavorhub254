'use client';
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CookingSettingsProvider } from "@/context/CookingSettingsContext";
import CookingPreferencesModal from "@/components/CookingPreferencesModal";
import PrepScreen from "@/components/PrepScreen";
import StepScreen from "@/components/StepScreen";
import FinishedScreen from "@/components/FinishedScreen";
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function CookingPage({ params }) {
  const { slug } = use(params); // Unwrap params for Next.js 15+
  const router = useRouter();
  const [showModal, setShowModal] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showPrep, setShowPrep] = useState(false);
  const [showStep, setShowStep] = useState(false);
  const [showFinished, setShowFinished] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [recipe, setRecipe] = useState(null);

  // Fetch recipe by slug
  useEffect(() => {
    async function fetchRecipe() {
      const q = query(collection(db, 'recipes'), where('slug', '==', slug));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setRecipe(querySnapshot.docs[0].data());
      }
    }
    if (slug) fetchRecipe();
  }, [slug]);

  const handleStart = () => {
    setShowModal(false);
    setShowPrep(true);
    setShowStep(false);
    setStepIndex(0);
  };

  const handleNextStep = () => {
    if (stepIndex < recipe.instructions.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const handleFinish = () => {
    setShowStep(false);
    setShowFinished(true);
  };

  return (
    <CookingSettingsProvider>
      {/* Background image and overlay */}
      <div className="fixed inset-0 z-0">
        <img
          src="/assets/backdrop.jpg"
          alt=""
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-black opacity-80" />
      </div>
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        {/* Initial modal: prompt on close */}
        <CookingPreferencesModal
          open={showModal}
          onStart={handleStart}
          onClose={() => {
            if (window.confirm("Are you sure you want to exit Smart Cooking?")) {
              router.push(`/recipe/${slug}`);
            }
          }}
        />
        {/* Settings modal: just close */}
        <CookingPreferencesModal
          open={showSettings}
          onStart={() => setShowSettings(false)}
          onClose={() => setShowSettings(false)}
        />
        {!showModal && showPrep && recipe && !showStep && !showFinished && (
          <PrepScreen
            recipe={recipe}
            onNext={() => {
              setShowPrep(false);
              setShowStep(true);
            }}
            onShowSettings={() => setShowSettings(true)}
          />
        )}
        {!showModal && showStep && recipe && !showFinished && (
          <StepScreen
            recipe={recipe}
            stepIndex={stepIndex}
            onPrev={handlePrevStep}
            onNext={handleNextStep}
            onFinish={handleFinish}
            onShowSettings={() => setShowSettings(true)}
          />
        )}
        {showFinished && recipe && (
          <FinishedScreen recipe={recipe} />
        )}
      </div>
    </CookingSettingsProvider>
  );
}