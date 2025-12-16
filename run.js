import fs from 'fs';
import path from 'path';
import AntsColonia from './RepresenativeCalsses/AntsColonia.js';

// Parametry (dostosuj jeśli chcesz)
const MAX_WIELKOSC = 10;     // pojemność plecaka mrówek
const EVAPORATION = 0.1;     // współczynnik parowania
const Q = 2;                 // ilość feromonu (zgodnie z wymaganiem)
const ANTS_PER_ITER = 10;    // 10 mrówek na iterację
const P_ELITE = 0.1;         // 10% elita
const ITERATIONS = 20;       // ile iteracji uruchomić

async function main() {
    console.log(`Params: max=${MAX_WIELKOSC}, evap=${EVAPORATION}, Q=${Q}, antsPerIter=${ANTS_PER_ITER}, p=${P_ELITE}, iterations=${ITERATIONS}\n`);

    // Upewnij się, że ścieżka do klasy AntsColonia jest poprawna (./RepresenativeCalsses/AntsColonia.js)
    const colony = new AntsColonia({
        maxWielkosc: MAX_WIELKOSC,
        evaporation: EVAPORATION,
        Q: Q,
        antsPerIter: ANTS_PER_ITER,
        p: P_ELITE
    });

    // prosty raport początkowy
    console.log('Initial pheromone sum:', colony.pheromones.reduce((a,b) => a+b, 0).toFixed(6));
    console.log('');

    const history = [];

    for (let it = 1; it <= ITERATIONS; it++) {
        const summary = colony.iterate();

        // policz sumę feromonów i top-3 przedmioty wg feromonu
        const pherSum = summary.pheromones.reduce((a,b) => a + b, 0);
        const pherTop = summary.pheromones
            .map((v, idx) => ({ idx, v }))
            .sort((a,b) => b.v - a.v)
            .slice(0, 3);

        // krótka reprezentacja najlepszego rozwiązania
        const best = summary.bestSolution;
        const bestVal = summary.bestValue;
        const bestItemsStr = best ? best.przedmioty.map(x => x.name).join(', ') : '(none)';

        console.log(`Iter ${it.toString().padStart(2,'0')}: bestValue=${bestVal}  pherSum=${pherSum.toFixed(4)}  topPher=${pherTop.map(x => `${x.idx}:${x.v.toFixed(3)}`).join(' | ')}  bestItems=[${bestItemsStr}]`);

        history.push({
            iter: it,
            bestValue: bestVal,
            pheromoneSum: pherSum
        });
    }

    // wyniki końcowe
    console.log('\n=== FINAL RESULT ===');
    console.log('Best value found:', colony.bestValue);
    if (colony.bestSolution) {
        console.log('Best packing (items):', colony.bestSolution.przedmioty.map(i => `${i.name} (w:${i.weight}, v:${i.value})`).join(' ; '));
        console.log('Best weight:', colony.bestSolution.waga, 'Best value:', colony.bestSolution.wartosc);
    } else {
        console.log('No best solution recorded.');
    }

    // zapisz best solution i historię do pliku
    const out = {
        bestSolution: colony.bestSolution,
        bestValue: colony.bestValue,
        pheromones: colony.pheromones,
        history
    };
    fs.writeFileSync(path.resolve('./best_solution.json'), JSON.stringify(out, null, 2));
    console.log('\nSaved final results to best_solution.json');

    process.exit(0);
}

main().catch(err => {
    console.error('ERROR running ACO:', err);
    process.exit(1);
});
