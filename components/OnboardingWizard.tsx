
import React, { useState } from 'react';
import { 
  CheckCircle, Circle, ChevronRight, Home, CreditCard, Calendar, 
  ArrowRight, Sparkles, Lock, Rocket
} from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: () => void;
  onNavigate: (view: string) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, onNavigate }) => {
  // Steps state: 0 = First step not done, 1 = Property done, 2 = Payments done, 3 = All done
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Steps configuration
  const steps = [
    {
      id: 0,
      title: "Compléter le premier hébergement",
      description: "Ajoutez les photos, la description et les règles de votre premier logement.",
      icon: Home,
      actionLabel: "Ajouter un logement",
      targetView: 'property-new' // Changed from 'properties' to direct creation
    },
    {
      id: 1,
      title: "Configurer les paiements",
      description: "Connectez Stripe ou un compte bancaire pour recevoir vos loyers.",
      icon: CreditCard,
      actionLabel: "Configurer Stripe",
      targetView: 'settings'
    },
    {
      id: 2,
      title: "Connecter les calendriers (iCal)",
      description: "Synchronisez Airbnb et Booking pour éviter les doubles réservations.",
      icon: Calendar,
      actionLabel: "Connecter un canal",
      targetView: 'connections'
    }
  ];

  const handleStepAction = (index: number) => {
    const step = steps[index];
    if (step.targetView) {
        onNavigate(step.targetView);
    }
  };

  const handleSkipDemo = () => {
    if(window.confirm("Passer la configuration (Mode Démo) ?")) {
        onComplete();
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 animate-fade-in">
      
      {/* Header Area */}
      <div className="mb-8 flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Rocket className="w-8 h-8 mr-3 text-indigo-600" />
                Guide de Démarrage
            </h1>
            <p className="text-gray-500 max-w-2xl">
                Suivez ces 3 étapes essentielles pour configurer votre agence. Vous pouvez naviguer librement dans l'application, mais ces actions sont recommandées pour démarrer.
            </p>
        </div>
        <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-gray-500 mb-1">Progression</p>
            <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-indigo-600 transition-all duration-500 ease-out"
                        style={{ width: `${(currentStep / 3) * 100}%` }}
                    ></div>
                </div>
                <span className="text-sm font-bold text-indigo-600">{currentStep}/3</span>
            </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          
          return (
            <div 
              key={step.id} 
              className={`
                border-b border-gray-100 last:border-0 transition-all duration-300
                ${isActive ? 'bg-indigo-50/30' : 'bg-white'}
              `}
            >
              <div 
                className={`p-6 flex items-start gap-4`}
              >
                {/* Icon Status */}
                <div className="flex-shrink-0 mt-1">
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-green-500 fill-green-50" />
                  ) : isActive ? (
                    <div className="w-6 h-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-300" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className={`text-lg font-bold ${isCompleted ? 'text-gray-500 line-through decoration-gray-300' : 'text-gray-800'}`}>
                      {step.title}
                    </h3>
                    {isActive && (
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            À Faire
                        </span>
                    )}
                  </div>
                  
                  {!isCompleted && (
                      <p className="text-gray-500 text-sm mb-4 max-w-xl">
                        {step.description}
                      </p>
                  )}

                  {/* Expanded Action Area for Active Step */}
                  {isActive && (
                    <div className={`mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm flex items-center justify-between animate-in slide-in-from-top-2 duration-300 ${isAnimating ? 'opacity-50 pointer-events-none' : ''}`}>
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                             <step.icon className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                             Étape {index + 1} : {step.actionLabel}
                          </span>
                       </div>
                       
                       <button 
                         onClick={() => handleStepAction(index)}
                         className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center transition shadow-md hover:shadow-lg hover:-translate-y-0.5"
                       >
                         {step.actionLabel}
                         <ArrowRight className="w-4 h-4 ml-2" />
                       </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Success Footer Message when done */}
        {currentStep === 3 && (
            <div className="bg-green-50 p-8 flex flex-col items-center justify-center text-center animate-in fade-in">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Configuration Terminée !</h3>
                <p className="text-gray-600 mb-6">Votre agence est prête à décoller. Accédez au tableau de bord pour voir vos statistiques.</p>
                <button 
                    onClick={onComplete}
                    className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg"
                >
                    Aller au Tableau de Bord
                </button>
            </div>
        )}
      </div>

      {/* Demo Skip Link */}
      {currentStep < 3 && (
        <div className="mt-8 text-center">
            <button 
                onClick={handleSkipDemo}
                className="text-gray-400 hover:text-indigo-600 text-xs font-medium flex items-center justify-center mx-auto transition"
            >
                <Sparkles className="w-3 h-3 mr-1" />
                (Démo) Tout marquer comme terminé
            </button>
        </div>
      )}

    </div>
  );
};
