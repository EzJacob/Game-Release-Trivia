let games = [];
    let game1, game2;
    let score = 0;
    let bestScore = localStorage.getItem('bestScore') || 0;
    let canGuess = true;

    document.getElementById('best-score-display').innerText = `Best score: ${bestScore}`;

    async function fetchGames() {
      try {
        const response = await fetch('https://game-release-trivia.onrender.com/games');
        games = await response.json();
      } catch (error) {
        console.error('Error fetching games:', error);
      }
    }

    async function fetchReleaseDate(title) {
      try {
        const response = await fetch(`https://game-release-trivia.onrender.com/game-date?title=${encodeURIComponent(title)}`);
        const data = await response.json();
        return data.release_date || null;
      } catch (error) {
        console.error(`Error fetching date for ${title}:`, error);
        return null;
      }
    }

    async function startGame() {
      score = 0;
      document.getElementById('score').innerText = score;
      document.getElementById('start-screen').classList.add('hidden');
      document.getElementById('game-screen').classList.remove('hidden');
      document.getElementById('end-screen').classList.add('hidden');

      // 🔹 Clear old game data before fetching new games
      document.getElementById('game1-img').src = "";
      document.getElementById('game1-title').innerText = "";
      document.getElementById('game1-date').innerText = "";
      document.getElementById('game2-img').src = "";
      document.getElementById('game2-title').innerText = "";
      document.getElementById('game2-date').innerText = "";
      document.getElementById('result').innerText = "";

      canGuess = true;
      
      getRandomGames();
    }

async function getRandomGames() {
  await fetchGames();
  if (games.length < 2) return;

  let index1 = Math.floor(Math.random() * games.length);
  let index2;
  do {
    index2 = Math.floor(Math.random() * games.length);
  } while (index1 === index2);

  game1 = games[index1];
  game2 = games[index2];

  const game1Img = document.getElementById('game1-img');
  const game2Img = document.getElementById('game2-img');
  const game1Container = document.getElementById('game1');
  const game2Container = document.getElementById('game2');

  // Create temporary images for preloading
  let tempImg1 = new Image();
  let tempImg2 = new Image();

  tempImg1.src = game1.image_url;
  tempImg2.src = game2.image_url;

  tempImg1.onload = () => {
    game1Img.src = game1.image_url;
    document.getElementById('game1-title').innerText = game1.name;
    document.getElementById('game1-date').classList.add('hidden');

    // Fade in after image is fully loaded
    setTimeout(() => { game1Container.style.opacity = "1"; }, 500);
  };

  tempImg2.onload = () => {
    game2Img.src = game2.image_url;
    document.getElementById('game2-title').innerText = game2.name;
    document.getElementById('game2-date').classList.add('hidden');

    setTimeout(() => { game2Container.style.opacity = "1"; }, 500);
  };

  document.getElementById('result').innerText = '';
  canGuess = true;
}



    async function guess(isLeft) {
      if (canGuess == false) {return;}
      canGuess = false;
      const game1Date = await fetchReleaseDate(game1.name);
      const game2Date = await fetchReleaseDate(game2.name);

      document.getElementById('game1-date').innerText = `Released: ${game1Date}`;
      document.getElementById('game1-date').classList.remove('hidden');
      document.getElementById('game2-date').innerText = `Released: ${game2Date}`;
      document.getElementById('game2-date').classList.remove('hidden');

      const correct = (isLeft && game1Date <= game2Date) || (!isLeft && game2Date <= game1Date);
      const resultMessage = correct ? "Correct!" : "Incorrect!";
      const resultClass = correct ? "correct" : "incorrect";
      const resultContainer = document.getElementById('result');

      if (correct) {
        score++;
        document.getElementById('score').innerText = score;
        resultContainer.innerHTML = `<div class="correct-indicator">✔</div>`;

        const game1Container = document.getElementById('game1');
        const game2Container = document.getElementById('game2');
      
        // Add fade-out effect
        game1Container.style.opacity = "0";
        game2Container.style.opacity = "0";

      } else {
        resultContainer.innerHTML = `<div class="incorrect-indicator">✖</div>`;
      }

      // Show result
      resultContainer.classList.remove('hidden');

      // Grab elements for styling
      const game1Title = document.getElementById('game1-title');
      const game2Title = document.getElementById('game2-title');
      const game1DateElement = document.getElementById('game1-date');
      const game2DateElement = document.getElementById('game2-date');

      if (game1Date < game2Date) {
          game1Title.style.color = 'green'; // Correct answer (left)
          game1DateElement.style.color = 'green';
          game2Title.style.color = 'red'; // Incorrect answer (right)
          game2DateElement.style.color = 'red';
      }
      if (game1Date > game2Date) {
          game2Title.style.color = 'green'; // Correct answer (left)
          game2DateElement.style.color = 'green';
          game1Title.style.color = 'red'; // Incorrect answer (right)
          game1DateElement.style.color = 'red';
      }
      if (game1Date == game2Date) {
          game1Title.style.color = 'green'; // Correct answer (left)
          game1DateElement.style.color = 'green';
          game2Title.style.color = 'green'; // Incorrect answer (right)
          game2DateElement.style.color = 'green';
      }


      //document.getElementById('result').innerText = resultMessage;
      document.getElementById('result').classList.add(resultClass);

      setTimeout(() => {
        resultContainer.classList.add('hidden');
        
        document.getElementById('game1-date').classList.add('hidden');
        document.getElementById('game2-date').classList.add('hidden');
        document.getElementById('result').innerText = "";
        document.getElementById('result').classList.remove(resultClass);

        game1Title.style.color = ''; // Reset to default
        game2Title.style.color = ''; // Reset to default
        game1DateElement.style.color = ''; // Reset to default
        game2DateElement.style.color = ''; // Reset to default

        // Reset hover effect by removing and re-adding the class
        document.querySelectorAll('.game-item').forEach(item => {
        item.classList.remove('game-item'); // Remove the class
        void item.offsetWidth; // Force reflow (trick to apply changes)
        item.classList.add('game-item'); // Re-add the class
        });

        if (!correct) {
          endGame();
        } else {
          getRandomGames();
        }
      }, 2000);
    }

    function endGame() {
      if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore);
      }

      document.getElementById('final-score').innerText = score;
      document.getElementById('best-score').innerText = bestScore;

      document.getElementById('game-screen').classList.add('hidden');
      document.getElementById('end-screen').classList.remove('hidden');
    }