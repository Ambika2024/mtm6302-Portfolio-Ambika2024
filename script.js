document.addEventListener('DOMContentLoaded', () => {
    const projectContent = document.getElementById('project-content');

    document.querySelectorAll('.project-button').forEach(button => {
        button.addEventListener('click', () => {
            const project = button.getAttribute('data-project');
            if (project === 'apod') {
                loadAPOD();
            } else if (project === 'pokedex') {
                loadPokedex();
            }
        });
    });

    async function loadAPOD() {
        const apiKey = 'DEMO_KEY'; // Replace 'DEMO_KEY' with your NASA API key
        const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            projectContent.innerHTML = `
                <h1>${data.title}</h1>
                <p>${data.date}</p>
                <img src="${data.url}" alt="${data.title}" style="max-width: 100%;">
                <p>${data.explanation}</p>
            `;
        } catch (error) {
            projectContent.innerHTML = `<p>Error loading Astronomy Picture of the Day: ${error.message}</p>`;
        }
    }

    async function loadPokedex() {
        projectContent.innerHTML = `
            <h1>Pokédex</h1>
            <div id="pokemon-gallery" class="gallery"></div>
            <button id="load-more">Load More Pokémon</button>
        `;
        const gallery = document.getElementById('pokemon-gallery');
        const loadMoreButton = document.getElementById('load-more');
        let nextUrl = 'https://pokeapi.co/api/v2/pokemon?limit=20';
        const caughtPokemon = JSON.parse(localStorage.getItem('caughtPokemon')) || [];

        async function loadPokemon(url) {
            const response = await fetch(url);
            const data = await response.json();
            nextUrl = data.next;
            data.results.forEach(pokemon => addPokemonToGallery(pokemon));
        }

        async function addPokemonToGallery(pokemon) {
            const response = await fetch(pokemon.url);
            const details = await response.json();
            const pokemonCard = document.createElement('div');
            pokemonCard.className = 'pokemon-card';
            pokemonCard.innerHTML = `
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${details.id}.png" alt="${pokemon.name}">
                <h5>${pokemon.name}</h5>
                <button class="btn btn-secondary btn-sm catch-release">${caughtPokemon.includes(details.id) ? 'Release' : 'Catch'}</button>
            `;

            pokemonCard.querySelector('img').addEventListener('click', () => showPokemonDetails(details));
            pokemonCard.querySelector('.catch-release').addEventListener('click', () => toggleCatchRelease(details.id, pokemonCard));

            if (caughtPokemon.includes(details.id)) {
                pokemonCard.classList.add('caught');
            }

            gallery.appendChild(pokemonCard);
        }

        function showPokemonDetails(details) {
            alert(`Name: ${details.name}\nAbilities: ${details.abilities.map(a => a.ability.name).join(', ')}\nTypes: ${details.types.map(t => t.type.name).join(', ')}`);
        }

        function toggleCatchRelease(id, card) {
            const index = caughtPokemon.indexOf(id);
            if (index > -1) {
                caughtPokemon.splice(index, 1);
                card.classList.remove('caught');
                card.querySelector('.catch-release').textContent = 'Catch';
            } else {
                caughtPokemon.push(id);
                card.classList.add('caught');
                card.querySelector('.catch-release').textContent = 'Release';
            }
            localStorage.setItem('caughtPokemon', JSON.stringify(caughtPokemon));
        }

        loadPokemon(nextUrl);
        loadMoreButton.addEventListener('click', () => loadPokemon(nextUrl));
    }
});
