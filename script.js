document.getElementById("start-btn").addEventListener("click", generateScratchCards);

function generateScratchCards() {
  const cardCount = parseInt(document.getElementById("card-count").value);

  if (cardCount <= 0 || cardCount > 26) {
    alert("Please choose a valid number of scratch cards (1-26).");
    return;
  }

  const container = document.getElementById("scratch-cards-container");
  container.innerHTML = ""; // Clear the previous cards
  
  // Generate a shuffled array of letters
  const letters = generateShuffledLetters(cardCount);

  // Create scratch cards
  for (let i = 0; i < cardCount; i++) {
    const letter = letters[i]; // Get the shuffled letter
    const card = createScratchCard(letter);
    container.appendChild(card);
  }
}

function generateShuffledLetters(cardCount) {
  let lettersArray = [];
  for (let i = 0; i < cardCount; i++) {
    lettersArray.push(String.fromCharCode(65 + i)); // 65 is the ASCII code for 'A'
  }
  
  // Shuffle the array randomly
  for (let i = lettersArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [lettersArray[i], lettersArray[j]] = [lettersArray[j], lettersArray[i]]; // Swap elements
  }

  return lettersArray;
}

function createScratchCard(letter) {
  const card = document.createElement("div");
  card.classList.add("scratch-card", "col-6", "col-md-3");

  const cardInner = document.createElement("div");
  cardInner.classList.add("scratch-card-inner");

  // Create the front of the card with a silver surface for scratching
  const front = document.createElement("div");
  front.classList.add("scratch-card-front");

  const letterDiv = document.createElement("div");
  letterDiv.classList.add("code-letter");
  letterDiv.textContent = letter;

  const canvas = document.createElement("canvas");
  canvas.width = 150;
  canvas.height = 150;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ccc";
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Initial silver surface

  const silverSurface = document.createElement("div");
  silverSurface.classList.add("silver-surface");

  front.appendChild(letterDiv);
  front.appendChild(silverSurface);
  front.appendChild(canvas);

  // Create the back of the card (to show after flip)
  const back = document.createElement("div");
  back.classList.add("scratch-card-back");
  const backText = document.createElement("p");
  backText.textContent = letter; // Show the letter after scratching
  back.appendChild(backText);

  cardInner.appendChild(front);
  cardInner.appendChild(back);

  card.appendChild(cardInner);
  
  // Add click event to flip the card
  card.addEventListener("click", () => {
    card.classList.toggle("flipped");  // Toggle flipped class
  });

  // Make the scratchable surface interactive
  let isScratching = false;

  silverSurface.addEventListener("mousedown", startScratching);
  silverSurface.addEventListener("mousemove", scratch);
  silverSurface.addEventListener("mouseup", endScratching);
  silverSurface.addEventListener("mouseleave", endScratching);

  function startScratching(event) {
    isScratching = true;
    scratch(event);
  }

  function scratch(event) {
    if (!isScratching) return;

    const x = event.offsetX;
    const y = event.offsetY;
    const surfaceRect = silverSurface.getBoundingClientRect();
    
    const scratchX = event.clientX - surfaceRect.left;
    const scratchY = event.clientY - surfaceRect.top;

    // Scratch the surface by clearing a portion of the canvas
    const scratchSize = 40;  // size of the scratch effect
    ctx.clearRect(scratchX - scratchSize / 2, scratchY - scratchSize / 2, scratchSize, scratchSize);

    // If the scratch reaches a threshold, reveal the letter
    if (checkScratchedEnough()) {
      letterDiv.style.color = "black"; // Show the letter
      silverSurface.style.visibility = "hidden"; // Hide the silver surface
    }
  }

  function endScratching() {
    isScratching = false;
  }

  function checkScratchedEnough() {
    const scratchedArea = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let scratchedPixels = 0;

    for (let i = 0; i < scratchedArea.data.length; i += 4) {
      if (scratchedArea.data[i + 3] < 128) { // If alpha is below 128 (meaning it's scratched)
        scratchedPixels++;
      }
    }

    // If more than 40% of the area is scratched, consider it as enough
    return scratchedPixels / (canvas.width * canvas.height) > 0.4;
  }

  return card;
}
