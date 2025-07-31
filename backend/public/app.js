document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector('input[type="text"]');
  const searchButton = document.querySelector('button');
  const resultsContainer = document.getElementById("resultsContainer");
  const resultsHeading = document.getElementById("resultsHeading");
  const favoritesContainer = document.getElementById("favoritesContainer");

  // Load favorites on page load
  displayFavorites();

  // Function to handle search
  function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) {
      resultsContainer.innerHTML = "<p>Please enter a search term.</p>";
      return;
    }

    resultsHeading.classList.remove('hidden');
    resultsContainer.innerHTML = "<p>Searching books...</p>";

    fetchBooks(query)
      .then(books => renderBooks(books))
      .catch(error => {
        console.error("Error fetching books:", error);
        resultsContainer.innerHTML = "<p>Oops! Something went wrong.</p>";
      });
  }

  // Search button click event
  searchButton.addEventListener("click", handleSearch);

  // Search input keypress event
  searchInput.addEventListener("keypress", (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  });

  // Fetch books from the backend API
  
  function fetchBooks(query) {
    const url = `/api/books?q=${encodeURIComponent(query)}`;

 // Call your backend endpoint

    return fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(data => {
        if (!data.items) return [];
        return data.items.map(item => ({
          title: item.volumeInfo.title,
          author: item.volumeInfo.authors?.join(", ") || "Unknown Author",
          cover: item.volumeInfo.imageLinks?.thumbnail || "https://via.placeholder.com/120x180?text=No+Cover",
          description: item.volumeInfo.description || "No description available.",
          link: item.volumeInfo.previewLink || "#"
        }));
      });
  }

  // Render books in the results container
  function renderBooks(books) {
    resultsContainer.innerHTML = "";
    if (books.length === 0) {
      resultsContainer.innerHTML = '<div class="spinner" aria-label="Loading"></div>';
      return;
    }

    const bookGrid = document.createElement("div");
    bookGrid.className = "book-grid";

    books.forEach(book => {
      const card = createBookCard(book);
      bookGrid.appendChild(card);
    });

    resultsContainer.appendChild(bookGrid);
  }

  // Create a book card
  function createBookCard(book) {
    const card = document.createElement("div");
    card.className = "book-card";

    const cover = document.createElement("div");
    cover.className = "book-cover";
    const coverImg = document.createElement("img");
    coverImg.src = book.cover;
    coverImg.alt = `${book.title} cover`;
    cover.appendChild(coverImg);

    const content = document.createElement("div");
    content.className = "book-content";

    const title = document.createElement("h3");
    title.className = "book-title";
    title.textContent = book.title;

    const author = document.createElement("p");
    author.className = "book-author";
    author.textContent = book.author;

    const description = document.createElement("p");
    description.className = "book-description";
    description.textContent = book.description;

    const learnMore = document.createElement("a");
    learnMore.className = "book-learn-more";
    learnMore.href = book.link;
    learnMore.target = "_blank";
    learnMore.rel = "noopener";
    learnMore.textContent = "Learn More";

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // prevent modal from opening
      saveToFavorites(book);
    });

    content.appendChild(title);
    content.appendChild(author);
    content.appendChild(description);
    content.appendChild(learnMore);
    content.appendChild(saveBtn);

    card.appendChild(cover);
    card.appendChild(content);

    return card;
  }

  // Save book to favorites
  function saveToFavorites(book) {
    let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (!favorites.some(fav => fav.title === book.title)) {
      favorites.push(book);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      alert(`Saved "${book.title}" to favorites.`);
      displayFavorites(); // Update favorites display
    } else {
      alert(`"${book.title}" is already in favorites.`);
    }
  }

  // Display favorites
  function displayFavorites() {
    favoritesContainer.innerHTML = "";
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

    if (favorites.length === 0) {
      favoritesContainer.innerHTML = "<p>No favorites yet.</p>";
      return;
    }

    favorites.forEach(book => {
      const card = createBookCard(book);
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // prevent modal from opening
        removeFromFavorites(book.title);
      });
      card.appendChild(removeBtn);
      favoritesContainer.appendChild(card);
    });
  }

  // Remove book from favorites
  function removeFromFavorites(title) {
    let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    favorites = favorites.filter(book => book.title !== title);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    displayFavorites(); // Update favorites display
    alert(`Removed "${title}" from favorites.`);
  }
});
