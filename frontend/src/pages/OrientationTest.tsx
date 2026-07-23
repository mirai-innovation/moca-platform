import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useTTS } from '../hooks/useTTS';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const OrientationTest: React.FC = () => {
    const { testId } = useParams<{ testId: string }>();
    const navigate = useNavigate();
    const { speak } = useTTS();

    // Fields
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [dow, setDow] = useState('');
    const [place, setPlace] = useState('');
    const [city, setCity] = useState('');

    // Manual Scoring toggles for Place/City
    const [placeCorrect, setPlaceCorrect] = useState<boolean | null>(null);
    const [cityCorrect, setCityCorrect] = useState<boolean | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Initial simplified instruction
        speak("Ahora dígame, ¿cuál es la fecha de hoy? Dígame el día, el mes, el año y el día de la semana. Y dígame, ¿cómo se llama este lugar y en qué localidad estamos?");
    }, [speak]);

    const handleSubmit = async () => {
        if (!day || !month || !year || !dow || !place || !city) {
            alert("Por favor complete todos los campos de texto.");
            return;
        }

        if (placeCorrect === null || cityCorrect === null) {
            alert("El evaluador debe marcar si el Lugar y la Localidad son correctos.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axios.post(`${API_URL}/orientation/submit`, {
                testId,
                taskId: "DATE_FULL", // Combined task key
                data: {
                    date: {
                        day: parseInt(day),
                        month: parseInt(month),
                        year: parseInt(year),
                        dayOfWeek: dow
                    },
                    place: { value: place, isCorrect: placeCorrect },
                    city: { value: city, isCorrect: cityCorrect }
                },
                metadata: { timestamp: Date.now() }
            });

            // Save Score
            const result = (response as any).data;
            if (result && typeof result.score === 'number') {
                localStorage.setItem(`moca_${testId}_orientation`, result.score.toString());
            }
            alert("¡Evaluación MoCA completada!");
            navigate(`/tests/${testId}/report`);
        } catch (error) {
            console.error(error);
            alert("Error al enviar resultados.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-3xl mx-auto space-y-8">
                <h1 className="text-2xl font-bold text-slate-900">Orientación</h1>

                <Card className="p-8 space-y-6">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-slate-800">Fecha</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Día del Mes (número)</label>
                                <input type="number" value={day} onChange={e => setDay(e.target.value)} className="w-full border p-2 rounded" placeholder="Ej: 15" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Mes (número 1-12)</label>
                                <input type="number" value={month} onChange={e => setMonth(e.target.value)} className="w-full border p-2 rounded" placeholder="Ej: 5" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Año (4 dígitos)</label>
                                <input type="number" value={year} onChange={e => setYear(e.target.value)} className="w-full border p-2 rounded" placeholder="Ej: 2024" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Día de la Semana</label>
                                <input type="text" value={dow} onChange={e => setDow(e.target.value)} className="w-full border p-2 rounded" placeholder="Ej: Lunes" />
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4 space-y-4">
                        <h3 className="font-semibold text-lg text-slate-800">Lugar y Localidad</h3>

                        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">¿Cómo se llama este lugar?</label>
                                <div className="flex gap-4 items-center mt-1">
                                    <input type="text" value={place} onChange={e => setPlace(e.target.value)} className="flex-1 border p-2 rounded" placeholder="Respuesta del paciente" />

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setPlaceCorrect(true)}
                                            className={`px-3 py-1 rounded text-sm border ${placeCorrect === true ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}
                                        >Correcto</button>
                                        <button
                                            onClick={() => setPlaceCorrect(false)}
                                            className={`px-3 py-1 rounded text-sm border ${placeCorrect === false ? 'bg-red-600 text-white' : 'bg-white text-gray-700'}`}
                                        >Incorrecto</button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">¿En qué localidad estamos?</label>
                                <div className="flex gap-4 items-center mt-1">
                                    <input type="text" value={city} onChange={e => setCity(e.target.value)} className="flex-1 border p-2 rounded" placeholder="Respuesta del paciente" />

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCityCorrect(true)}
                                            className={`px-3 py-1 rounded text-sm border ${cityCorrect === true ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}
                                        >Correcto</button>
                                        <button
                                            onClick={() => setCityCorrect(false)}
                                            className={`px-3 py-1 rounded text-sm border ${cityCorrect === false ? 'bg-red-600 text-white' : 'bg-white text-gray-700'}`}
                                        >Incorrecto</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 italic">* El evaluador debe marcar manualmente si el Lugar y la Localidad son correctos.</p>
                    </div>

                    <div className="flex justify-center pt-6">
                        <Button size="lg" onClick={handleSubmit} disabled={isSubmitting} className="bg-indigo-600 text-white min-w-[200px]">
                            Finalizar Test MoCA
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default OrientationTest;
