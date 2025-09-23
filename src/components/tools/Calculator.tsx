import React, { useState } from 'react';
import { Calculator as CalcIcon, Delete, RotateCcw } from 'lucide-react';

export function Calculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const buttons = [
    ['C', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '=']
  ];

  const handleButtonClick = (value: string) => {
    switch (value) {
      case 'C':
        clear();
        break;
      case '±':
        setDisplay(String(parseFloat(display) * -1));
        break;
      case '%':
        setDisplay(String(parseFloat(display) / 100));
        break;
      case '=':
      case '+':
      case '-':
      case '×':
      case '÷':
        performOperation(value);
        break;
      case '.':
        inputDecimal();
        break;
      default:
        inputNumber(value);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <CalcIcon className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-slate-900">Calculator</h2>
        </div>
      </div>

      <div className="flex-1 p-6 max-w-md mx-auto w-full">
        <div className="bg-slate-900 rounded-xl p-6 mb-6">
          <div className="text-right text-3xl md:text-4xl font-mono text-white break-all">
            {display}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {buttons.flat().map((button, index) => (
            <button
              key={index}
              onClick={() => handleButtonClick(button)}
              className={`h-16 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 ${
                button === '=' 
                  ? 'col-span-2 bg-gradient-to-r from-purple-500 to-teal-500 text-white hover:from-purple-600 hover:to-teal-600'
                  : button === '0'
                  ? 'col-span-2 bg-slate-200 hover:bg-slate-300 text-slate-800'
                  : ['÷', '×', '-', '+'].includes(button)
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : ['C', '±', '%'].includes(button)
                  ? 'bg-slate-400 hover:bg-slate-500 text-white'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
              }`}
            >
              {button}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}