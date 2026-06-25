const form = document.getElementById("collectionForm");
const container = document.getElementById("collectionContainer");
const searchInput = document.getElementById("search");
const filterRating = document.getElementById("filterRating");
const gridBtn = document.getElementById("gridBtn");
const listBtn = document.getElementById("listBtn");

let collection = JSON.parse(localStorage.getItem("collection")) || [];

// Display Items
function displayItems(items) {
  container.innerHTML = "";

  if (items.length === 0) {
    container.innerHTML = "<h2>No items found.</h2>";
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <h3>${item.title}</h3>
      <p><strong>Type:</strong> ${item.type}</p>
      <p><strong>Rating:</strong> ${"⭐".repeat(item.rating)}</p>
      <p><strong>Status:</strong> ${item.status}</p>
      <p><strong>Notes:</strong> ${item.notes}</p>

      <button
        class="delete-btn"
        onclick="deleteItem(${item.id})">
        Delete
      </button>
    `;

    container.appendChild(card);
  });
}

// Add Item
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const item = {
    id: Date.now(),
    title: document.getElementById("title").value,
    type: document.getElementById("type").value,
    rating: Number(document.getElementById("rating").value),
    status: document.getElementById("status").value,
    notes: document.getElementById("notes").value,
  };

  collection.push(item);

  localStorage.setItem("collection", JSON.stringify(collection));

  displayItems(collection);

  form.reset();
});

// Delete Item
function deleteItem(id) {
  collection = collection.filter((item) => item.id !== id);

  localStorage.setItem("collection", JSON.stringify(collection));

  displayItems(collection);
}

// Search
searchInput.addEventListener("input", () => {
  filterAndSearch();
});

// Filter Rating
filterRating.addEventListener("change", () => {
  filterAndSearch();
});

function filterAndSearch() {
  const searchValue = searchInput.value.toLowerCase();

  const ratingValue = filterRating.value;

  let filtered = collection.filter((item) =>
    item.title.toLowerCase().includes(searchValue),
  );

  if (ratingValue !== "all") {
    filtered = filtered.filter((item) => item.rating == ratingValue);
  }

  displayItems(filtered);
}

// Grid View
gridBtn.addEventListener("click", () => {
  container.classList.remove("list-view");
});

// List View
listBtn.addEventListener("click", () => {
  container.classList.add("list-view");
});

// Initial Display
displayItems(collection);
