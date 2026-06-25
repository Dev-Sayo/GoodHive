const collectionParent = document.querySelector(".collection-grid");

// Displaying collection

function displayitems(collectionCard) {
  collectionParent.innerHTML = "";

  if (collectionCard.length === 0) {
    collectionParent.innerHTML =
      "<div class='no-items'><h2>No items found</h2></div>";
    return;
  }

  collectionCard.forEach((items) => {
    const collectionFrame = document.createElement("div");
    collectionFrame.classList.add("collection-frame");
    collectionParent.appendChild(collectionFrame);

    collectionFrame.createElement("div");
  });
  displayitems();
}
