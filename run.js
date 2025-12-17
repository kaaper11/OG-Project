import fs from 'fs';
import path from 'path';
import KoloniaMrowek from './RepresenativeCalsses/AntsColonia.js';

const MAKSYMALNA_WIELKOSC = 10;
const PAROWANIE = 0.1;
const Q = 2;
const MROWKI_NA_ITERACJE = 10;
const PROCENT_ELITY = 0.1;
const LICZBA_ITERACJI = 20;

async function uruchom() {
    console.log(
        `Parametry: max=${MAKSYMALNA_WIELKOSC}, ` +
        `parowanie=${PAROWANIE}, Q=${Q}, ` +
        `mrówki/iter=${MROWKI_NA_ITERACJE}, ` +
        `elita=${PROCENT_ELITY}, ` +
        `iteracje=${LICZBA_ITERACJI}\n`
    );

    const kolonia = new KoloniaMrowek({
        maksymalnaWielkoscPlecaka: MAKSYMALNA_WIELKOSC,
        parowanie: PAROWANIE,
        Q: Q,
        liczbaMrowek: MROWKI_NA_ITERACJE,
        procentElity: PROCENT_ELITY
    });

    console.log(
        'Początkowa suma feromonów:',
        kolonia.feromony.reduce((a, b) => a + b, 0).toFixed(6)
    );
    console.log('');

    const historia = [];

    for (let iteracja = 1; iteracja <= LICZBA_ITERACJI; iteracja++) {
        const podsumowanie = kolonia.wykonajIteracje();

        const sumaFeromonow = podsumowanie.feromony
            .reduce((a, b) => a + b, 0);

        const najlepszeRozwiazanie = podsumowanie.najlepszeRozwiazanie;
        const najlepszaWartosc = podsumowanie.najlepszaWartosc;

        const najlepszePrzedmioty = najlepszeRozwiazanie
            ? [...najlepszeRozwiazanie.przedmioty]
                .sort((a, b) => a.index - b.index)
            : [];

        const najlepszePrzedmiotyTekst = najlepszePrzedmioty.length
            ? najlepszePrzedmioty.map(p => p.name).join(', ')
            : '(brak)';

        const feromonyNajlepszych = najlepszePrzedmioty.map(p => ({
            index: p.index,
            name: p.name,
            feromon: podsumowanie.feromony[p.index]
        }));

        console.log(
            `Iteracja ${iteracja.toString().padStart(2, '0')}: ` +
            `najlepszaWartosc=${najlepszaWartosc}  ` +
            `sumaFeromonow=${sumaFeromonow.toFixed(4)}  ` +
            `feromonyNajlepszych=${feromonyNajlepszych
                .map(f => `${f.name}[${f.index}]:${f.feromon.toFixed(3)}`)
                .join(' | ')}  ` +
            `najlepszePrzedmioty=[${najlepszePrzedmiotyTekst}]`
        );

        historia.push({
            iteracja: iteracja,
            najlepszaWartosc: najlepszaWartosc,
            sumaFeromonow: sumaFeromonow
        });
    }

    console.log('\n=== WYNIK KOŃCOWY ===');
    console.log('Najlepsza znaleziona wartość:', kolonia.najlepszaWartosc);

    if (kolonia.najlepszeRozwiazanie) {
        const posortowaneKoncowe = [...kolonia.najlepszeRozwiazanie.przedmioty]
            .sort((a, b) => a.index - b.index);

        console.log(
            'Najlepsze upakowanie (przedmioty):',
            posortowaneKoncowe
                .map(p => `${p.name} (w:${p.weight}, v:${p.value})`)
                .join(' ; ')
        );

        console.log(
            'Łączna waga:',
            kolonia.najlepszeRozwiazanie.waga,
            'Łączna wartość:',
            kolonia.najlepszeRozwiazanie.wartosc
        );
    } else {
        console.log('Nie znaleziono najlepszego rozwiązania.');
    }

    const posortowaneRozwiazanie = kolonia.najlepszeRozwiazanie
        ? {
            ...kolonia.najlepszeRozwiazanie,
            przedmioty: [...kolonia.najlepszeRozwiazanie.przedmioty]
                .sort((a, b) => a.index - b.index)
        }
        : null;

    const wynik = {
        najlepszeRozwiazanie: posortowaneRozwiazanie,
        najlepszaWartosc: kolonia.najlepszaWartosc,
        feromony: kolonia.feromony,
        historia
    };

    fs.writeFileSync(
        path.resolve('./best_solution.json'),
        JSON.stringify(wynik, null, 2)
    );

    console.log('\nZapisano wyniki końcowe do pliku best_solution.json');
    process.exit(0);
}

uruchom().catch(err => {
    console.error('BŁĄD PODCZAS URUCHAMIANIA ACO:', err);
    process.exit(1);
});
