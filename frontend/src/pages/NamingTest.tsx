import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import type { IdentificationTaskId } from '@moca/shared';

// Placeholder for images - User will add them to public/assets
const ANIMALS = [
    { id: 'NAMING_LION' as IdentificationTaskId, name: 'Lion', imgSrc: '/assets/lion.png' },
    { id: 'NAMING_RHINO' as IdentificationTaskId, name: 'Rhinoceros', imgSrc: '/assets/rhino.png' },
    { id: 'NAMING_CAMEL' as IdentificationTaskId, name: 'Camel', imgSrc: '/assets/camel.png' }
];

export default function NamingTest() {
    const { testId = 'demo-test' } = useParams();
    const navigate = useNavigate();

    const [answers, setAnswers] = useState<Record<string, string>>({
        NAMING_LION: '',
        NAMING_RHINO: '',
        NAMING_CAMEL: ''
    });

    const handleChange = (id: string, val: string) => {
        setAnswers(prev => ({ ...prev, [id]: val }));
    };

    // Puntúa localmente y guarda en localStorage (el paciente no ve el resultado)
    const handleEvaluate = () => {
        const ACCEPTED_ANSWERS: Record<string, string[]> = {
            NAMING_LION: ['leon', 'león', 'lion'],
            NAMING_RHINO: ['rinoceronte', 'rhino', 'rhinoceros'],
            NAMING_CAMEL: ['camello', 'camel', 'dromedario']
        };

        let score = 0;
        ANIMALS.forEach(animal => {
            const userVal = (answers[animal.id] || '').toLowerCase().trim();
            const correct = ACCEPTED_ANSWERS[animal.id].some(a => userVal.includes(a));
            if (correct) score++;
        });

        localStorage.setItem(`moca_${testId}_naming`, score.toString());
    };

    const handleContinue = () => {
        // Puntúa en silencio (sin mostrar resultado al paciente) y avanza al siguiente módulo
        handleEvaluate();
        navigate(`/tests/${testId}/memory`);
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-900">Identificación (Nominación)</h1>
                    <span className="text-sm font-medium text-slate-500">Paso 4</span>
                </div>

                <Card className="bg-white">
                    <h2 className="text-xl font-semibold text-brand-700 mb-6">Instrucciones: Escriba el nombre de cada animal debajo de su imagen.</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {ANIMALS.map((animal) => (
                            <div key={animal.id} className="flex flex-col items-center space-y-4">
                                <div className="w-full aspect-square bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200">
                                    <img
                                        src={animal.imgSrc}
                                        alt="Animal to identify"
                                        className="max-w-full max-h-full object-contain"
                                        onError={(e) => {
                                            // Fallback if image not found
                                            (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=' + animal.name;
                                        }}
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={answers[animal.id]}
                                    onChange={(e) => handleChange(animal.id, e.target.value)}
                                    placeholder="Nombre del animal..."
                                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-brand-500 outline-none text-center font-medium"
                                />
                            </div>
                        ))}
                    </div>
                </Card>

                <div className="flex justify-between border-t border-slate-200 pt-6">
                    <Button
                        variant="secondary"
                        onClick={() => navigate(`/tests/${testId}/visuospatial`)} // Go back to prev module
                    >
                        ← Anterior (Visuoespacial)
                    </Button>

                    <Button onClick={handleContinue} variant="primary">
                        Continuar →
                    </Button>
                </div>
            </div>
        </div>
    );
}
