const artistContainer = document.getElementById("artistContainer");
const resultSearchInput = document.getElementById("resultSearchInput");
const resultSearchButton = document.getElementById("resultSearchButton");
const wikibandLink = document.getElementById("wikibandLink");

const params = new URLSearchParams(window.location.search);
const artistQuery = params.get("artist");

resultSearchButton.addEventListener("click", searchAgain);

resultSearchInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        searchAgain();
    }
});

function searchAgain() {
    const query = resultSearchInput.value.trim();

    if (query === "") {
        return;
    }

    window.location.href = `result.html?artist=${encodeURIComponent(query)}`;
}

if (!artistQuery) {
    artistContainer.innerHTML = `
        <p class="empty-message">Nenhum artista foi pesquisado.</p>
    `;
} else {
    resultSearchInput.value = artistQuery;
    loadArtistData(artistQuery);
}

async function loadArtistData(query) {
    artistContainer.innerHTML = `
        <p class="empty-message">Buscando informações sobre "${query}"...</p>
    `;

    try {
        const musicBrainzResponse = await fetch(
            `https://musicbrainz.org/ws/2/artist/?query=${encodeURIComponent(query)}&fmt=json`
        );

        if (!musicBrainzResponse.ok) {
            throw new Error("Erro ao buscar dados no MusicBrainz.");
        }

        const musicBrainzData = await musicBrainzResponse.json();
        const artist = musicBrainzData.artists[0];

        if (!artist) {
            artistContainer.innerHTML = `
                <p class="empty-message">Nenhum resultado encontrado para "${query}".</p>
            `;
            return;
        }

        let wikiData = null;

        try {
            const wikiResponse = await fetch(
                `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(artist.name)}`
            );

            if (wikiResponse.ok) {
                wikiData = await wikiResponse.json();
            }
        } catch (error) {
            wikiData = null;
        }

        renderArtistPage(artist, wikiData);

    } catch (error) {
        console.error(error);

        artistContainer.innerHTML = `
            <p class="empty-message">Erro ao carregar informações. Tente novamente.</p>
        `;
    }
}

function renderArtistPage(artist, wiki) {
    const name = artist.name || "Nome desconhecido";
    const type = artist.type || "Não informado";
    const country = artist.country || "Não informado";
    const area = artist.area?.name || "Não informado";
    const beginDate = artist["life-span"]?.begin || "Não informado";
    const endDate = artist["life-span"]?.end || "Ativo ou não informado";
    const disambiguation = artist.disambiguation || "Artista encontrado no banco de dados musical.";
    const mbid = artist.id || "Não informado";

    const image = wiki?.thumbnail?.source || "";
    const bio = wiki?.extract || "Ainda não há uma biografia completa disponível para este artista dentro do Wikiband Search.";

    wikibandLink.href = `https://wikiband.vercel.app/?q=${encodeURIComponent(name).replaceAll("%20", "+")}&type=album`;

    artistContainer.innerHTML = `
        <article class="artist-page">
            <div class="artist-content">
                <div class="article-top">
                    <p class="article-label">Wikiband Search</p>
                    <h1>${name}</h1>
                    <p class="article-subtitle">${disambiguation}</p>
                </div>

                <div class="article-tabs">
                    <button class="active">Visão geral</button>
                    <button>Discografia</button>
                    <button>Músicas</button>
                    <button>Curiosidades</button>
                </div>

                <div class="article-text">
                    <p>${bio}</p>
                </div>

                <div class="article-section">
                    <h2>Resumo</h2>

                    <p>
                        ${name} é um resultado musical encontrado pelo Wikiband Search.
                        As informações abaixo foram organizadas automaticamente a partir de bases abertas
                        de dados musicais.
                    </p>
                </div>

                <div class="article-section">
                    <h2>Dados musicais</h2>

                    <div class="data-grid">
                        <div>
                            <strong>Tipo</strong>
                            <span>${type}</span>
                        </div>

                        <div>
                            <strong>País</strong>
                            <span>${country}</span>
                        </div>

                        <div>
                            <strong>Área</strong>
                            <span>${area}</span>
                        </div>

                        <div>
                            <strong>Início</strong>
                            <span>${beginDate}</span>
                        </div>

                        <div>
                            <strong>Fim</strong>
                            <span>${endDate}</span>
                        </div>

                        <div>
                            <strong>ID MusicBrainz</strong>
                            <span>${mbid}</span>
                        </div>
                    </div>
                </div>

                <div class="wikiband-action">
                    <a href="${wikibandLink.href}">
                        Ver ${name} na Wikiband
                    </a>
                </div>
            </div>

            <aside class="artist-card">
                <h3>${name}</h3>

                ${
                    image 
                    ? `<img src="${image}" alt="${name}">`
                    : `<div class="no-image">Sem imagem disponível</div>`
                }

                <div class="info-list">
                    <p><strong>Tipo:</strong> ${type}</p>
                    <p><strong>País:</strong> ${country}</p>
                    <p><strong>Área:</strong> ${area}</p>
                    <p><strong>Início:</strong> ${beginDate}</p>
                    <p><strong>Fim:</strong> ${endDate}</p>
                </div>
            </aside>
        </article>
    `;
}