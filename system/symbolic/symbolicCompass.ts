import { generateSymbolMap } from './symbolMap';

interface CompassData {
  topSymbols: string[];
  stagnantSymbols: string[];
}

export async function runSymbolicCompass(): Promise<CompassData> {
  const map = await generateSymbolMap();

  const ranked = Object.entries(map)
    .sort(([, a], [, b]) => b.frequency - a.frequency)
    .map(([symbol, data]) => ({
      symbol,
      frequency: data.frequency,
      moduleCount: data.modules.length,
      relatedTerms: data.related
    }));

  const top = ranked.slice(0, 5);
  const stagnant = ranked.filter(item => item.frequency === 1);

  console.log('\n🧭 Symbolic Compass Activated');
  console.log('\n🧩 Top 5 Influential Symbols:\n');
  top.forEach(entry => {
    console.log(`• ${entry.symbol} (${entry.frequency} occurrences across ${entry.moduleCount} modules)`);
  });

  console.log('\n🕳️ Stagnant Symbols (unreinforced):\n');
  stagnant.forEach(entry => {
    console.log(`• ${entry.symbol}`);
  });

  return {
    topSymbols: top.map(t => t.symbol),
    stagnantSymbols: stagnant.map(s => s.symbol)
  };
} 