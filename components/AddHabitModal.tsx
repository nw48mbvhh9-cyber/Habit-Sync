
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Habit, DayOfWeek } from '../types';

interface AddHabitModalProps {
  onClose: () => void;
  onSave: (habit: Habit) => void;
  initialHabit?: Habit;
}

const DAYS: { label: string; value: DayOfWeek }[] = [
  { label: 'M', value: 1 },
  { label: 'T', value: 2 },
  { label: 'W', value: 3 },
  { label: 'T', value: 4 },
  { label: 'F', value: 5 },
  { label: 'S', value: 6 },
  { label: 'S', value: 0 },
];

const COLORS = ['#4B53BC', '#2D88FF', '#FF4D4D', '#27AE60', '#F2994A', '#9B51E0'];

const AddHabitModal: React.FC<AddHabitModalProps> = ({ onClose, onSave, initialHabit }) => {
  const [name, setName] = useState(initialHabit?.name || '');
  const [frequency, setFrequency] = useState(initialHabit?.frequency || 1);
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(initialHabit?.repeatDays || [0, 1, 2, 3, 4, 5, 6]);
  const [color, setColor] = useState(initialHabit?.color || COLORS[0]);

  const toggleDay = (day: DayOfWeek) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const newHabit: Habit = {
      id: initialHabit?.id || Date.now().toString(),
      name,
      frequency,
      repeatDays: selectedDays,
      color,
      createdAt: initialHabit?.createdAt || Date.now(),
    };
    onSave(newHabit);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 px-4 pb-8 sm:pb-0">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">{initialHabit ? 'Edit Habit' : 'New Habit'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Habit Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning Run"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6264A7] focus:border-transparent transition-all outline-none"
              autoFocus={!initialHabit}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">How many times a day?</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={frequency}
                onChange={(e) => setFrequency(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#6264A7]"
              />
              <span className="text-lg font-bold text-[#6264A7] w-8 text-center">{frequency}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Repeat on</label>
            <div className="flex justify-between">
              {DAYS.map((day) => {
                const isSelected = selectedDays.includes(day.value);
                return (
                  <button
                    key={day.value}
                    onClick={() => toggleDay(day.value)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      isSelected ? 'bg-[#6264A7] text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Accent Color</label>
            <div className="flex justify-between">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-full border-4 transition-transform ${
                    color === c ? 'border-white scale-125 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 pt-0">
          <button
            onClick={handleSave}
            className="w-full py-4 bg-[#6264A7] text-white font-bold rounded-xl shadow-lg hover:bg-[#505290] active:scale-[0.98] transition-all text-lg"
          >
            {initialHabit ? 'Save Changes' : 'Create Habit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddHabitModal;
