import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const Timer = ({
                   duration = 60, // seconds
                   autoStart = false,
                   onComplete,
                   showControls = true,
                   format = 'mm:ss',
                   className = ''
               }) => {
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isRunning, setIsRunning] = useState(autoStart);

    useEffect(() => {
        if (!isRunning || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setIsRunning(false);
                    onComplete && onComplete();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isRunning, timeLeft, onComplete]);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (format === 'hh:mm:ss') {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePlayPause = () => {
        setIsRunning(!isRunning);
    };

    const handleReset = () => {
        setTimeLeft(duration);
        setIsRunning(false);
    };

    const progress = ((duration - timeLeft) / duration) * 100;

    return (
        <div className={`flex flex-col items-center ${className}`}>
            {/* Circular Timer */}
            <div className="relative">
                <svg width="200" height="200" className="transform -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx="100"
                        cy="100"
                        r="90"
                        stroke="#e5e7eb"
                        strokeWidth="10"
                        fill="none"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="100"
                        cy="100"
                        r="90"
                        stroke="#06b6d4"
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 90}`}
                        strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                    />
                </svg>

                {/* Time display */}
                <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold text-gray-900">
            {formatTime(timeLeft)}
          </span>
                </div>
            </div>

            {/* Controls */}
            {showControls && (
                <div className="flex space-x-4 mt-6">
                    <button
                        onClick={handlePlayPause}
                        className="p-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full transition-colors"
                    >
                        {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>

                    <button
                        onClick={handleReset}
                        className="p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-full transition-colors"
                    >
                        <RotateCcw className="w-6 h-6" />
                    </button>
                </div>
            )}
        </div>
    );
};

// Countdown Component
export const Countdown = ({
                              targetDate,
                              onComplete,
                              labels = { days: 'Jours', hours: 'Heures', minutes: 'Minutes', seconds: 'Secondes' },
                              className = ''
                          }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(targetDate) - new Date();

            if (difference <= 0) {
                onComplete && onComplete();
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        setTimeLeft(calculateTimeLeft());

        return () => clearInterval(timer);
    }, [targetDate, onComplete]);

    return (
        <div className={`flex space-x-4 ${className}`}>
            {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} className="flex flex-col items-center bg-white rounded-lg shadow p-4 min-w-[80px]">
          <span className="text-3xl font-bold text-cyan-600">
            {value.toString().padStart(2, '0')}
          </span>
                    <span className="text-sm text-gray-600 mt-1">
            {labels[unit]}
          </span>
                </div>
            ))}
        </div>
    );
};

export default Timer;