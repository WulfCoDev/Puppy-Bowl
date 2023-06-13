const playerContainer = document.getElementById('all-players-container');
const newPlayerFormContainer = document.getElementById('new-player-form');

// Add your cohort name to the cohortName variable below, replacing the 'COHORT-NAME' placeholder
const cohortName = '2302-ACC-ET-WEB-PT-D';
// Use the APIURL variable for fetch requests
const APIURL = `https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}/`;

/**
 * It fetches all players from the API and returns them
 * @returns An array of objects.
 */
const fetchAllPlayers = async () => {
    try {
        const response = await fetch (APIURL + 'players');
        if (!response.ok){
            throw new Error ('Failed to fetch players');
        }

        const data = await response.json();
        return data;

    } catch (err) {
        console.error('Uh oh, trouble fetching players!', err);
    }
};


const fetchSinglePlayer = async (playerId) => {
    try {
        const response = await fetch (APIURL + `players/${playerId}`);
        if (!response.ok){
            throw new Error ('Failed to fetch player #${playerId}');
        }

        const data = await response.json();
        return data;
    } catch (err) {
        console.error(`Oh no, trouble fetching player #${playerId}!`, err);
    }
};

const addNewPlayer = async (playerObj) => {
    try {
        const response = await fetch (APIURL + 'players', {
            method: 'POST',
            headers: {
                'Content-Type':'application/json',
            },
            body: JSON.stringify (playerObj),
        });
        if (!response.ok) {
            throw new Error ('Failed to add player');
        }
        const data = await response.json();
        return data;
    } catch (err) {
        console.error('Oops, something went wrong with adding that player!', err);
    }
};

const removePlayer = async (playerId) => {
    try {
        const response = await fetch (APIURL + 'players/' + playerId, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error ('Failed to remove player #${playerId}');
        }
        const data = await response.json();
        return data;
    } catch (err) {
        console.error(
            `Whoops, trouble removing player #${playerId} from the roster!`,
            err
        );
    }
};

/**
 * It takes an array of player objects, loops through them, and creates a string of HTML for each
 * player, then adds that string to a larger string of HTML that represents all the players. 
 * 
 * Then it takes that larger string of HTML and adds it to the DOM. 
 * 
 * It also adds event listeners to the buttons in each player card. 
 * 
 * The event listeners are for the "See details" and "Remove from roster" buttons. 
 * 
 * The "See details" button calls the `fetchSinglePlayer` function, which makes a fetch request to the
 * API to get the details for a single player. 
 * 
 * The "Remove from roster" button calls the `removePlayer` function, which makes a fetch request to
 * the API to remove a player from the roster. 
 * 
 * The `fetchSinglePlayer` and `removePlayer` functions are defined in the
 * @param playerList - an array of player objects
 * @returns the playerContainerHTML variable.
 */
const renderAllPlayers = (playerList) => {
    try {
      if (!Array.isArray(playerList)) {
        throw new Error('Invalid player list');
      }
  
      let playerContainerHTML = '';
  
      playerList.forEach((player) => {
        const playerCardHTML = `
          <div class="player-card">
            <h3>${player.name}</h3>
            <p>Age: ${player.age}</p>
            <p>Breed: ${player.breed}</p>
            <button class="details-btn" data-player-id="${player.id}">See Details</button>
            <button class="remove-btn" data-player-id="${player.id}">Remove from Roster</button>
          </div>
        `;
        playerContainerHTML += playerCardHTML;
      });
  
      playerContainer.innerHTML = playerContainerHTML;
  
      // Add event listeners to the buttons
      const detailsButtons = document.querySelectorAll('.details-btn');
      detailsButtons.forEach((button) => {
        button.addEventListener('click', () => {
          const playerId = button.dataset.playerId;
          fetchSinglePlayer(playerId)
            .then((player) => {
              renderPlayerDetails(player);
            })
            .catch((err) => console.error(err));
        });
      });
  
      const removeButtons = document.querySelectorAll('.remove-btn');
      removeButtons.forEach((button) => {
        button.addEventListener('click', () => {
          const playerId = button.dataset.playerId;
          removePlayer(playerId)
            .then(() => {
              button.parentElement.remove();
            })
            .catch((err) => console.error(err));
        });
      });
    } catch (err) {
      console.error('Uh oh, trouble rendering players!', err);
    }
  };


/**
 * It renders a form to the DOM, and when the form is submitted, it adds a new player to the database,
 * fetches all players from the database, and renders them to the DOM.
 */
const renderNewPlayerForm = () => {
    try {
        const formHTML = `
      <form id="add-player-form">
        <h2>Add New Player</h2>
        <div>
          <label for="name">Name:</label>
          <input type="text" id="name" name="name" required>
        </div>
        <div>
          <label for="age">Age:</label>
          <input type="number" id="age" name="age" required>
        </div>
        <div>
          <label for="breed">Breed:</label>
          <input type="text" id="breed" name="breed" required>
        </div>
        <button type="submit">Add Player</button>
      </form>
    `;
    newPlayerFormContainer.innerHTML = formHTML;

    const addPlayerForm = document.getElementById('add-player-form');
    addPlayerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('name');
      const ageInput = document.getElementById('age');
      const breedInput = document.getElementById('breed');

      const newPlayer = {
        name: nameInput.value,
        age: parseInt(ageInput.value),
        breed: breedInput.value,
      };

      addNewPlayer(newPlayer)
        .then(() => {
          // Clear form inputs
          nameInput.value = '';
          ageInput.value = '';
          breedInput.value = '';

          // Fetch all players and render them again
          fetchAllPlayers()
            .then((players) => {
              renderAllPlayers(players);
            })
            .catch((err) => console.error(err));
        })
        .catch((err) => console.error(err));
    });
    } catch (err) {
        console.error('Uh oh, trouble rendering the new player form!', err);
    }
};

const renderPlayerDetails = (player) => {
    try {
      const detailsHTML = `
        <div class="player-details">
          <h3>${player.name}</h3>
          <p>Age: ${player.age}</p>
          <p>Breed: ${player.breed}</p>
        </div>
      `;
      playerContainer.innerHTML = detailsHTML;
    } catch (err) {
      console.error('Uh oh, trouble rendering player details!', err);
    }
  };
  

const init = async () => {
    const players = await fetchAllPlayers();
    renderAllPlayers(players.data.players);

    renderNewPlayerForm();
}

init();