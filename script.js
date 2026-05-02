const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("SearchButton");

searchButton.addEventListener("click", searchArtist);

searchInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        searchArtist();
    }
});

function searchArtist() {
    const query = searchInput.value.trim();

    if (query === "") {
        alert("Digite o nome de uma banda, artista ou música.");
        return;
    }

    window.location.href = `result.html?artist=${encodeURIComponent(query)}`;
}