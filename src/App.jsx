import { useState, useMemo, useRef } from 'react';
import './index.css';

const LEVELS = Array.from({ length: 10 }, (_, i) => i + 2); // 2-11

// Official Brawl Stars Wiki upgrade table
// https://brawlstars.fandom.com/wiki/Power_Points
const LEVEL_DATA = [
  { pp: 0, coins: 0 },    // 1 (not used)
  { pp: 20, coins: 20 },  // 2
  { pp: 30, coins: 35 },  // 3
  { pp: 50, coins: 75 },  // 4
  { pp: 80, coins: 140 }, // 5
  { pp: 130, coins: 290 },// 6
  { pp: 210, coins: 480 },// 7
  { pp: 340, coins: 800 },// 8
  { pp: 550, coins: 1250 },// 9
  { pp: 890, coins: 1875 },// 10
  { pp: 1440, coins: 2800 },// 11
];

const CUMULATIVE = LEVEL_DATA.reduce(
  (acc, cur, i) => {
    acc.pp[i] = (acc.pp[i - 1] || 0) + cur.pp;
    acc.coins[i] = (acc.coins[i - 1] || 0) + cur.coins;
    return acc;
  },
  { pp: [], coins: [] }
);

function formatNumber(n, decimals = 0) {
  if (typeof n !== 'number' || isNaN(n)) return n;
  return n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export default function App() {
  const [mode, setMode] = useState('max'); // 'max' or 'cost'
  const [coins, setCoins] = useState(0);
  const [powerPoints, setPowerPoints] = useState(0);
  const [level, setLevel] = useState(11);
  const [gadgets, setGadgets] = useState(0); // 0-2 for level 7+
  const [gears, setGears] = useState(0); // 0-8 for level 8+
  const [starPowers, setStarPowers] = useState(0); // 0-2 for level 9+
  const [hypercharge, setHypercharge] = useState(false); // for level 11
  const [numBrawlers, setNumBrawlers] = useState(1); // for cost mode
  const [numBrawlersInput, setNumBrawlersInput] = useState('1'); // string for input field
  const numBrawlersInputRef = useRef(null);

  // Track focus for input fields
  const [coinsFocused, setCoinsFocused] = useState(false);
  const [ppFocused, setPPFocused] = useState(false);

  const showGadgets = level >= 7;
  const showGears = level >= 8;
  const showStarPowers = level >= 9;
  const showHypercharge = level === 11;

  const GADGET_COST = 1000;
  const GEAR_COST = 1000;
  const STARPOWER_COST = 2000;
  const HYPERCHARGE_COST = 5000;

  // Calculate total cost to reach selected level
  const { totalCoins, totalPP } = useMemo(() => {
    const totalCoins = CUMULATIVE.coins[level - 1]
      + (showGadgets ? gadgets * GADGET_COST : 0)
      + (showGears ? gears * GEAR_COST : 0)
      + (showStarPowers ? starPowers * STARPOWER_COST : 0)
      + (showHypercharge && hypercharge ? HYPERCHARGE_COST : 0);
    const totalPP = CUMULATIVE.pp[level - 1];
    return { totalCoins, totalPP };
  }, [level, gadgets, gears, starPowers, hypercharge, showGadgets, showGears, showStarPowers, showHypercharge]);

  // Show up to 2 decimals for outputs
  const brawlersByCoins = totalCoins > 0 ? coins / totalCoins : '-';
  const brawlersByPowerPoints = totalPP > 0 ? powerPoints / totalPP : '-';

  // Toggle button label
  const toggleLabel = mode === 'max' ? 'How much to max one brawler?' : 'How many brawlers can I max?';
  const modeTitle = mode === 'max' ? 'How many brawlers can I max?' : `How much to upgrade ${numBrawlers > 1 ? numBrawlers + ' brawlers' : 'one brawler'}?`;

  // Cost for multiple brawlers in cost mode
  const totalCoinsAll = totalCoins * numBrawlers;
  const totalPPAll = totalPP * numBrawlers;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex flex-col items-center p-4">
      <div className="bg-white/10 backdrop-blur rounded-xl shadow-lg p-8 w-full max-w-md mt-8">
        <h1 className="text-3xl font-bold text-center mb-4 text-white">Brawl Max Resource Calculator</h1>
        {/* Toggle Button */}
        <div className="flex items-center justify-center mb-2">
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow transition-colors duration-150"
            onClick={() => setMode(mode === 'max' ? 'cost' : 'max')}
          >
            {toggleLabel}
          </button>
        </div>
        {/* Mode Title */}
        <div className="text-xl font-bold text-center text-white mb-6">{modeTitle}</div>
        {/* Resource Inputs (only in max mode) */}
        {mode === 'max' && (
          <>
            <div className="mb-4">
              <label className="block text-white font-semibold mb-1">Coins</label>
              <input
                type="range"
                min={0}
                max={200000}
                value={coins}
                onChange={e => setCoins(Number(e.target.value))}
                className="w-full"
                onFocus={() => setCoinsFocused(true)}
                onBlur={() => setCoinsFocused(false)}
              />
              <input
                type="text"
                min={0}
                max={200000}
                value={coinsFocused ? coins : formatNumber(coins)}
                onChange={e => {
                  // Remove commas for parsing
                  const val = e.target.value.replace(/,/g, '');
                  setCoins(Number(val));
                }}
                className="w-full mt-1 p-1 rounded"
                onFocus={() => setCoinsFocused(true)}
                onBlur={() => setCoinsFocused(false)}
                inputMode="numeric"
                pattern="[0-9,]*"
              />
            </div>
            <div className="mb-4">
              <label className="block text-white font-semibold mb-1">Power Points</label>
              <input
                type="range"
                min={0}
                max={40000}
                value={powerPoints}
                onChange={e => setPowerPoints(Number(e.target.value))}
                className="w-full"
                onFocus={() => setPPFocused(true)}
                onBlur={() => setPPFocused(false)}
              />
              <input
                type="text"
                min={0}
                max={40000}
                value={ppFocused ? powerPoints : formatNumber(powerPoints)}
                onChange={e => {
                  const val = e.target.value.replace(/,/g, '');
                  setPowerPoints(Number(val));
                }}
                className="w-full mt-1 p-1 rounded"
                onFocus={() => setPPFocused(true)}
                onBlur={() => setPPFocused(false)}
                inputMode="numeric"
                pattern="[0-9,]*"
              />
            </div>
          </>
        )}
        {/* Number of brawlers slider in cost mode */}
        {mode === 'cost' && (
          <div className="mb-4">
            <label className="block text-white font-semibold mb-1">Number of Brawlers</label>
            <input
              type="range"
              min={1}
              max={150}
              value={numBrawlers}
              onChange={e => {
                setNumBrawlers(Number(e.target.value));
                setNumBrawlersInput(String(e.target.value));
              }}
              className="w-full"
            />
            <input
              type="number"
              min={1}
              max={150}
              value={numBrawlersInput}
              ref={numBrawlersInputRef}
              onChange={e => {
                // Allow empty string for typing
                const val = e.target.value.replace(/^0+/, '');
                if (val === '') {
                  setNumBrawlersInput('');
                } else {
                  // Only update numeric state if valid
                  const num = Number(val);
                  if (!isNaN(num) && num >= 1 && num <= 150) {
                    setNumBrawlers(num);
                    setNumBrawlersInput(val);
                  } else {
                    setNumBrawlersInput(val);
                  }
                }
              }}
              onBlur={() => {
                // On blur, default to 1 if empty or invalid
                if (numBrawlersInput === '' || isNaN(Number(numBrawlersInput)) || Number(numBrawlersInput) < 1) {
                  setNumBrawlers(1);
                  setNumBrawlersInput('1');
                }
              }}
              className="w-full mt-1 p-1 rounded"
            />
          </div>
        )}
        {/* Level and options (always shown) */}
        <div className="mb-4">
          <label className="block text-white font-semibold mb-1">Target Level</label>
          <select value={level} onChange={e => setLevel(Number(e.target.value))} className="w-full p-2 rounded">
            {LEVELS.map(lvl => (
              <option key={lvl} value={lvl}>Level {lvl}</option>
            ))}
          </select>
        </div>
        {showGadgets && (
          <div className="mb-4">
            <label className="block text-white font-semibold mb-1">Gadgets</label>
            <div className="flex gap-2">
              {[0, 1, 2].map(val => (
                <button
                  key={val}
                  onClick={() => setGadgets(val)}
                  className={`px-3 py-1 rounded border transition-all duration-150 flex items-center justify-center gap-1 ${gadgets === val ? 'bg-blue-500 text-white font-bold border-2 border-yellow-300 shadow-lg' : 'bg-white/20 text-white border border-white/30'}`}
                >
                  {val}
                  {gadgets === val && <span className="ml-1">✔️</span>}
                </button>
              ))}
            </div>
          </div>
        )}
        {showGears && (
          <div className="mb-4">
            <label className="block text-white font-semibold mb-1">Gears</label>
            <div className="flex gap-2 flex-wrap">
              {[0,1,2,3,4,5,6,7,8].map(val => (
                <button
                  key={val}
                  onClick={() => setGears(val)}
                  className={`px-3 py-1 rounded border transition-all duration-150 flex items-center justify-center gap-1 ${gears === val ? 'bg-blue-500 text-white font-bold border-2 border-yellow-300 shadow-lg' : 'bg-white/20 text-white border border-white/30'}`}
                >
                  {val}
                  {gears === val && <span className="ml-1">✔️</span>}
                </button>
              ))}
            </div>
          </div>
        )}
        {showStarPowers && (
          <div className="mb-4">
            <label className="block text-white font-semibold mb-1">Star Powers</label>
            <div className="flex gap-2">
              {[0, 1, 2].map(val => (
                <button
                  key={val}
                  onClick={() => setStarPowers(val)}
                  className={`px-3 py-1 rounded border transition-all duration-150 flex items-center justify-center gap-1 ${starPowers === val ? 'bg-blue-500 text-white font-bold border-2 border-yellow-300 shadow-lg' : 'bg-white/20 text-white border border-white/30'}`}
                >
                  {val}
                  {starPowers === val && <span className="ml-1">✔️</span>}
                </button>
              ))}
            </div>
      </div>
        )}
        {showHypercharge && (
          <div className="mb-4">
            <label className="block text-white font-semibold mb-1">Hypercharge</label>
            <button
              onClick={() => setHypercharge(h => !h)}
              className={`px-3 py-1 rounded border transition-all duration-150 flex items-center justify-center gap-1 ${hypercharge ? 'bg-blue-500 text-white font-bold border-2 border-yellow-300 shadow-lg' : 'bg-white/20 text-white border border-white/30'}`}
            >
              {hypercharge ? 'Yes' : 'No'}
              {hypercharge && <span className="ml-1">✔️</span>}
        </button>
          </div>
        )}
        {/* Output */}
        <div className="mt-6 bg-white/20 rounded p-4 text-center text-white">
          {mode === 'max' ? (
            <>
              <div className="text-lg font-semibold mb-2">Brawlers you can max:</div>
              <div className="flex flex-col gap-2">
                <span>By Coins: <span className="font-mono">{typeof brawlersByCoins === 'number' ? formatNumber(brawlersByCoins, 2) : brawlersByCoins}</span></span>
                <span>By Power Points: <span className="font-mono">{typeof brawlersByPowerPoints === 'number' ? formatNumber(brawlersByPowerPoints, 2) : brawlersByPowerPoints}</span></span>
              </div>
            </>
          ) : (
            <>
              <div className="text-lg font-semibold mb-2">Cost for {numBrawlers > 1 ? numBrawlers + ' brawlers' : '1 brawler'}:</div>
              <div className="flex flex-col gap-2">
                <span>Coins: <span className="font-mono">{formatNumber(totalCoinsAll)}</span></span>
                <span>Power Points: <span className="font-mono">{formatNumber(totalPPAll)}</span></span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
