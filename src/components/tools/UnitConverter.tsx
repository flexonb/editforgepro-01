import React, { useState } from 'react';
import { Compass, ArrowRightLeft } from 'lucide-react';

const conversions = {
  length: {
    name: 'Length',
    units: {
      mm: { name: 'Millimeter', factor: 1 },
      cm: { name: 'Centimeter', factor: 10 },
      m: { name: 'Meter', factor: 1000 },
      km: { name: 'Kilometer', factor: 1000000 },
      in: { name: 'Inch', factor: 25.4 },
      ft: { name: 'Foot', factor: 304.8 },
      yd: { name: 'Yard', factor: 914.4 },
      mi: { name: 'Mile', factor: 1609344 },
    }
  },
  weight: {
    name: 'Weight',
    units: {
      mg: { name: 'Milligram', factor: 1 },
      g: { name: 'Gram', factor: 1000 },
      kg: { name: 'Kilogram', factor: 1000000 },
      oz: { name: 'Ounce', factor: 28349.5 },
      lb: { name: 'Pound', factor: 453592 },
      ton: { name: 'Ton', factor: 1000000000 },
    }
  },
  temperature: {
    name: 'Temperature',
    units: {
      c: { name: 'Celsius', factor: 1 },
      f: { name: 'Fahrenheit', factor: 1 },
      k: { name: 'Kelvin', factor: 1 },
    }
  },
  volume: {
    name: 'Volume',
    units: {
      ml: { name: 'Milliliter', factor: 1 },
      l: { name: 'Liter', factor: 1000 },
      cup: { name: 'Cup', factor: 236.588 },
      pt: { name: 'Pint', factor: 473.176 },
      qt: { name: 'Quart', factor: 946.353 },
      gal: { name: 'Gallon', factor: 3785.41 },
    }
  }
};

export function UnitConverter() {
  const [category, setCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('ft');
  const [fromValue, setFromValue] = useState('1');
  const [toValue, setToValue] = useState('');

  const convertValue = (value: string, from: string, to: string, cat: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '';

    const categoryData = conversions[cat as keyof typeof conversions];
    
    if (cat === 'temperature') {
      // Special handling for temperature
      let celsius = num;
      if (from === 'f') celsius = (num - 32) * 5/9;
      if (from === 'k') celsius = num - 273.15;
      
      if (to === 'c') return celsius.toFixed(6);
      if (to === 'f') return (celsius * 9/5 + 32).toFixed(6);
      if (to === 'k') return (celsius + 273.15).toFixed(6);
    } else {
      // Standard unit conversion
      const fromFactor = categoryData.units[from as keyof typeof categoryData.units].factor;
      const toFactor = categoryData.units[to as keyof typeof categoryData.units].factor;
      const result = (num * fromFactor) / toFactor;
      return result.toFixed(6).replace(/\.?0+$/, '');
    }
    
    return '';
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setFromValue(toValue);
  };

  React.useEffect(() => {
    const currentCategory = conversions[category as keyof typeof conversions];
    const units = Object.keys(currentCategory.units);
    
    if (!units.includes(fromUnit)) setFromUnit(units[0]);
    if (!units.includes(toUnit)) setToUnit(units[1] || units[0]);
  }, [category]);

  React.useEffect(() => {
    const result = convertValue(fromValue, fromUnit, toUnit, category);
    setToValue(result);
  }, [fromValue, fromUnit, toUnit, category]);

  const currentCategory = conversions[category as keyof typeof conversions];

  return (
    <div className="h-full flex flex-col bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <Compass className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-slate-900">Unit Converter</h2>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-slate-100 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {Object.entries(conversions).map(([key, cat]) => (
                <option key={key} value={key}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Conversion */}
          <div className="space-y-4">
            {/* From */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">From</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={fromValue}
                  onChange={(e) => setFromValue(e.target.value)}
                  className="px-4 py-3 bg-slate-100 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter value"
                />
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="px-4 py-3 bg-slate-100 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {Object.entries(currentCategory.units).map(([key, unit]) => (
                    <option key={key} value={key}>{unit.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <button
                onClick={swapUnits}
                className="p-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-colors"
              >
                <ArrowRightLeft className="w-5 h-5" />
              </button>
            </div>

            {/* To */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">To</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={toValue}
                  readOnly
                  className="px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg"
                  placeholder="Result"
                />
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="px-4 py-3 bg-slate-100 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {Object.entries(currentCategory.units).map(([key, unit]) => (
                    <option key={key} value={key}>{unit.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Conversions */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-medium text-slate-900 mb-3">Quick Reference</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {Object.entries(currentCategory.units).slice(0, 6).map(([key, unit]) => {
                const converted = convertValue('1', fromUnit, key, category);
                return (
                  <div key={key} className="flex justify-between">
                    <span>1 {currentCategory.units[fromUnit as keyof typeof currentCategory.units].name} =</span>
                    <span className="font-mono">{converted} {unit.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}