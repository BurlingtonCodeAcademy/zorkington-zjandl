// I was trying to create a solution using a state machine but couldn't get it to work -- so I scraped it and followed a similar format to your solutions... 

const readline = require('readline');

const readlineInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(questionText) {
  return new Promise((resolve, reject) => {
    readlineInterface.question(questionText, resolve);
  });
};

//--------------------------

//player
const player = {
  currentScene: null,
  inventory: [],
  status: [],

  //move
  changeScene: (room) => {
    player.currentScene = room
  },

  //pick up
  pickUp: (item) => {
    if (item.takeable === true) {
      player.inventory.push(item);
      player.currentScene.inventory.pop(item)
      return `You pick up a ${item.name}`
    } else {
      return "You can't take that"
    }
  },

  //use items
  useItem: (item) => {
    item.action()
  }
}

//Scene Constructor
class Scene {
  constructor(name, description, inventory, forward, backward, right, left) {

    this.name = name;
    this.description = description;
    this.inventory = inventory || [];
    this.isLocked = false;
    this.forward = forward || null;
    this.backward = backward || null;
    this.right = right || null;
    this.left = left || null;

    this.takeItem = (item) => {
      this.inventory.pop(item)
    };

    this.examineItem = (item) => {
      return item.description
    };

    this.enterRoom = () => {
      return (this.name + '\n' + this.description)
    }
  }
}

//Items constructor 
class InventoryItem {
  constructor(name, desc, takeable, action) {
    this.name = name;
    this.description = desc;
    this.takeable = takeable;
    this.action = action
  }
}

//commands
const commands = {
  affirmative: ['yes', 'yup', 'yeah', ''],
  move: ['go', 'move', 'walk', 'enter', '05462'],
  examine: ['look', 'examine', 'check'],
  take: ['take', 'grab'],
  use: ['use', 'give', 'drink', 'ring', 'smell'],
}

//items definitions
const flower = new InventoryItem('flower', 'the flower appears to be a hydrangea piniculata', true, () => { console.log('The flower smells beautiful...'); player.inventory.pop(flower) });
const beer = new InventoryItem('beer', 'an ice cold beer... ', true, () => { console.log('Dang that is a tasty beer...'); player.inventory.pop(beer) });
const doorbell = new InventoryItem('doorbell', 'a golden glowing doorbell', false, () => {
  console.log("The doorbell sounds.\nYour wife comes to unlock the door -- but the door wasn't even locked.\n She is steaming pissed.\n You die.");
  process.exit()
});
const paper = new InventoryItem('paper', 'a folded piece of paper. It says 05462 right -- could this be the key code?', true, () => { console.log('I think you found the key code!...'); player.inventory.pop(paper) });

//room definitions
const driveway = new Scene('Driveway...', 'You are standing in the driveway.\nAll the inside lights are off in the house.\nThe road stretches behind and to the left of you.\nTo the right of you is the garden.\nIn front of you the loan light on the front porch beckons you...\n ', null, 'front porch', null, 'garden', null);
const frontPorch = new Scene('Front Porch...', 'You stand on the front porch.\nBehind you is driveway.\nDarkness to the right\nTo the left of you is the back patio.\nIn front of you the door has a key code -- If you knew the code you could enter it.\nYou see the doorbell which is an inticing option - but to ring it would mean certain death... it is too dangerous.\n', [doorbell], null, 'driveway', 'kitchen', 'patio');
const garden = new Scene('Garden...', 'You arrive in the garden to find a beautiful display of shrubs and hardy perenials.\nYou consider taking a flower.\nDarkness surrounds you.\nYour only chance of finding the key is going left back to the driveway...\n ', [flower], null, null, null, 'driveway');
const patio = new Scene('Patio...', 'You reach the back patio.\nIn front of you is the steep dropoff from retaining wall.\nBehind you is the front porch.\nYou see a folded piece of paper wedged next to the leg of the grill.\nCould this be the key code?...\n ', [paper], null, null, 'front porch', null);
const kitchen = new Scene('Kitchen...', "Success! You cracked the code.\nIn the refridgerator there is a beer waiting for you\nBehind you is the front porch....\n", [beer], null, 'front porch', null, null);

//-----------lookup tables-----------

//items table
const itemsTable = {
  'flower': flower,
  'beer': beer,
  'paper': paper,
  'doorbell': doorbell
}

//rooms table
const scenesTable = {
  'driveway': driveway,
  'front porch': frontPorch,
  'garden': garden,
  'patio': patio,
  'kitchen': kitchen
}
//------------Game------------------

async function startGame() {
  let init = await ask(`Welcome.\nYou've just arrived home from a long night of coding to discover your front door in locked.\nIf you ring the doorbell you'll wakeup your wife -- which would mean certain death.\nThis is a text based adventure game to find the secret key code, enter the kitchen, and drink a beer!\nPlease type your actions in the format [action] [item].\nTo move to a new area use [move] [direction].\nTo view your inventory type 'inventory' to view the room's items type 'items'\nAre you ready to begin?\n>_ `);
  if (commands.affirmative.includes(init.toLowerCase())) {
    console.log(driveway.enterRoom());
    player.currentScene = driveway
    play()
  }
  else {
    console.log('Goodbye...');
    process.exit()
  }

}

async function play() {
  let input = await ask('>_')
  let lowerInput = input.toLowerCase()
  let inputArray = lowerInput.split(' ');
  let thisAction = inputArray[0];
  let stash = inputArray[inputArray.length - 1]

  if (lowerInput === 'exit') {
    process.exit()
  }

  //scene inventory
  else if (lowerInput === 'items') {
    if (player.currentScene.inventory.length === 0) {
      console.log("There is nothing here...")
      play();
    } else {
      player.currentScene.inventory.forEach(item => console.log(item.name))
      play();
    }
  }

  //player inventory
  else if (lowerInput === 'inventory') {
    if (player.inventory.length === 0) {
      console.log("You don't have anything...")
      play();
    } else {
      player.inventory.forEach(item => console.log(item.name));
      play();
    }
  }

  //move
  else if (commands.move.includes(thisAction)) {
    if (inputArray.length === 1) {
      console.log('maybe you should just sleep in the car');
      play()
    }
    else {
      let direction = stash;
      if (player.currentScene[direction]) {
        console.log(`Moving ${direction}...`);
        player.changeScene(scenesTable[player.currentScene[direction]]);
        console.log(player.currentScene.enterRoom())
        play();
      }
      else if (direction !== 'forward' && direction !== 'backward' && direction !== 'right' && direction !== 'left') {
        console.log("That's not a valid command\nPlease choose forward, backward, right, or left");
        play()
      }
      else {
        console.log("You can't go that way...")
        play()
      }
    }
  }

  //examine items
  else if (commands.examine.includes(thisAction) && player.currentScene.inventory.includes(itemsTable[stash])) {
    let item = stash;
    console.log(itemsTable[item].description)
    play();
  }
  else if (commands.examine.includes(thisAction) && player.inventory.includes(itemsTable[stash])) {
    let item = stash;
    console.log(itemsTable[item].description)
    play();
  }

  //take item
  else if (commands.take.includes(thisAction)) {
    let item = itemsTable[stash]
    if (player.currentScene.inventory.includes(item)) {
      console.log(player.pickUp(item));
      play();
    }
    else {
      console.log(`there are no ${stash}s here...`)
      play()
    }
  }

  //use item
  else if (commands.use.includes(thisAction)) {
    let item = itemsTable[stash]
    if (player.inventory.includes(item) || player.currentScene.inventory.includes(item)) {
      item.action()
      play();
    } else {
      console.log("There is nothing here to " + thisAction);
      play()
    }
  }

  //catch all
  else {
    console.log("I don't what you mean by " + thisAction);
    play();
  }
}

startGame();