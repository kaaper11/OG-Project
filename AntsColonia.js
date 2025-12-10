class AntsColonia {
    constructor({antCount, evaporation, Q }) {
        this.antCount = antCount;
        this.evaporation = evaporation; // współczynnik parowania
        this.Q = Q;                    // ilość feromonu dodawanego przez mrówki


        this.bestSolution = null;
        this.bestValue = 0;
    }

    /**
     * Wykonuje pojedynczą iterację algorytmu:
     * 1. Każda mrówka konstruuje plecak
     * 2. Ocena rozwiązań
     * 3. Parowanie feromonów
     * 4. Aktualizacja feromonów
     */
    iterate() {

    }

    /** Paruje feromony: pheromone = pheromone * (1 - evaporation) */
    evaporatePheromones() {

    }

    /**
     * Dodaje feromony na podstawie jakości rozwiązań.
     * dobre rozwiązania -> tam gdzie więcej feromonu
     */
    updatePheromones(ants) {

    }
}

export default AntsColonia;