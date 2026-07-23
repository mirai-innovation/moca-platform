import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useTTS } from '../hooks/useTTS';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AbstractionTest: React.FC = () => {
    const { testId } = useParams<{ testId: string }>();
    const navigate = useNavigate();
    const { speak, isSpeaking } = useTTS();

    // 0 = Introduction/Practice (Orange-Apple)
    // 1 = Pair 1 (Train-Bicycle)
    // 2 = Pair 2 (Watch-Ruler)
    // 3 = Finished
    const [step, setStep] = useState(0);
    const [inputValue, setInputValue] = useState('');
    const [practiceFeedbackGiven, setPracticeFeedbackGiven] = useState(false);

    // Initial instruction
    useEffect(() => {
        if (step === 0 && !practiceFeedbackGiven) {
            speak("Ahora le pediré que me diga en qué se parecen dos objetos. Por ejemplo: ¿en qué se parecen una naranja y una manzana?");
        } else if (step === 1) {
            speak("Ahora, ¿en qué se parecen un tren y una bicicleta?");
        } else if (step === 2) {
            speak("Ahora, ¿en qué se parecen un reloj y una regla?");
        }
    }, [step, speak, practiceFeedbackGiven]);


    const handleNext = async () => {
        if (!inputValue.trim()) {
            alert("Por favor escriba una respuesta.");
            return;
        }

        try {
            if (step === 0) {
                // Practice Trial Logic
                const normalized = inputValue.toLowerCase();
                if (normalized.includes('fruta')) {
                    setStep(1);
                    setInputValue('');
                } else {
                    if (!practiceFeedbackGiven) {
                        speak("Sí, y también en que las dos son frutas.");
                        setPracticeFeedbackGiven(true);
                    } else {
                        setStep(1);
                        setInputValue('');
                        setPracticeFeedbackGiven(false);
                    }
                }
                // Train - Bicycle
                const res1 = await axios.post(`${API_URL}/abstraction/submit`, {
                    testId,
                    taskId: "ABSTRACTION_TRAIN",
                    data: { response: inputValue },
                    metadata: { timestamp: Date.now() }
                });
                // Accumulate score (resetting if it's the first step usually, but for simplicity just add)
                // We should probably reset score at start of module, but here we just overwrite or add.
                // Let's reset at step 0? No, step 0 is practice.
                // We'll trust user follows flow.
                const s1 = (res1.data as any).score || 0;
                localStorage.setItem(`moca_${testId}_abstraction`, s1.toString());

                setStep(2);
                setInputValue('');
            } else if (step === 2) {
                // Watch - Ruler
                const res2 = await axios.post(`${API_URL}/abstraction/submit`, {
                    testId,
                    taskId: "ABSTRACTION_WATCH",
                    data: { response: inputValue },
                    metadata: { timestamp: Date.now() }
                });
                const s2 = (res2.data as any).score || 0;

                // Add to existing
                const prev = parseInt(localStorage.getItem(`moca_${testId}_abstraction`) || '0', 10);
                localStorage.setItem(`moca_${testId}_abstraction`, (prev + s2).toString());

                setStep(3); // Finish
            }
        } catch (error) {
            console.error("Submission failed", error);
            alert("Error saving response. Please try again.");
        }
    };

    const handleFinish = () => {
        console.log("Abstraction Module Completed");
        // Navigate to Delayed Recall (next module)
        navigate(`/tests/${testId}/delayed-recall`);
    };

    if (step === 3) {
        handleFinish();
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-900">Abstracción</h1>
                    <span className="text-sm font-medium text-slate-500">Paso {step + 1} de 3</span>
                </div>

                <Card className="p-8 space-y-8 shadow-sm">
                    <div className="text-center space-y-4">
                        <h2 className="text-xl font-medium text-slate-800">
                            {step === 0 && "¿En qué se parecen una naranja y una manzana?"}
                            {step === 1 && "¿En qué se parecen un tren y una bicicleta?"}
                            {step === 2 && "¿En qué se parecen un reloj y una regla?"}
                        </h2>

                        {step === 0 && practiceFeedbackGiven && (
                            <div className="bg-blue-50 p-4 rounded-lg text-blue-700">
                                <p>Explicación: "Sí, y también en que las dos son frutas."</p>
                            </div>
                        )}

                        <div className="max-w-md mx-auto">
                            <input
                                value={inputValue}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                                placeholder="Escriba su respuesta aquí..."
                                className="w-full text-lg py-3 px-4 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                    if (e.key === 'Enter') handleNext();
                                }}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="flex justify-center pt-4">
                        <Button
                            size="lg"
                            onClick={handleNext}
                            disabled={isSpeaking}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[200px]"
                        >
                            {step === 0 && practiceFeedbackGiven ? "Entendido, Continuar" : "Siguiente"}
                        </Button>
                    </div>
                </Card>

                <div className="text-center text-sm text-slate-400">
                    <p>MoCA Test - Módulo 6</p>
                </div>
            </div>
        </div>
    );
};

export default AbstractionTest;
