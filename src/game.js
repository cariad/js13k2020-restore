// The primary client's data is a little more valuable than the usual.
var PRIMARY_VALUE_MULTIPLIER = 2;

// The size of the pool of files that sailors could be carrying.
var MAX_OTHER_FILES_IN_PLAY = 8;

var CHUNKS_PER_FILE = 8;

// We use this a lot, so let's not repeat the whole thing every time.
var f = Math.floor;


var canvas = document.getElementById("c");
var ctx = canvas.getContext("2d");

var buttons = [];

var onClick = (e) => {
  var x = e.offsetX, y = e.offsetY;
  var button = buttons.reverse().find((i) => {
    return i.x < x && x < i.xa && i.y < y && y < i.ya;
  });
  if (button) console.log(button.t); else console.log('missed', x, y);
};

var makeButton = (x, y, w, h, t) => {
  console.info('makeButton', x, y, w, h);
  ctx.strokeStyle = "#666";
  ctx.strokeRect(x, y, w, h);
  buttons.push({ x: x, y: y, xa: x + w, ya: y + h, t: t });
  console.info('buttons', buttons);
};

// Thank you, David Braben!
// TODO: Randomise these seeds.
var SEED_LEFT = 4;
var SEED_RIGHT = 7;
var nextRandom = (m = 10) => {
  var d = (SEED_LEFT + SEED_RIGHT) / 10, r = f((d - f(d)) * 10);
  SEED_LEFT = SEED_RIGHT;
  SEED_RIGHT = r;
  return r % m;
}

var makePartial = () => [2, 2, 2, 0].reduce((acc, shift) => {
    acc += nextRandom(4);
    return acc <<= shift;
  }, 0);

var showSailor = (sailor) => {
  console.info(`Sailor: ${sailor.n}`);
  sailor.f.forEach(file => showHolding(file));
};

var toBinary = (b) => b.toString(2).padStart(CHUNKS_PER_FILE, 0);

var showBits = (p) => console.info(`(${p.toString().padStart(3, ' ')}) ${toBinary(p)}`);
var showHolding = (h) => console.info(`(fileid=${h.i.toString().padStart(2, '0')}) ${toBinary(h.b)}`);

var player;
var opponent;

var newGame = () => {
  player = makeSailor(true, 0, 'Bob');
  showSailor(player);

  opponent = makeSailor(true, 3, 'Weirdbeard');
  showSailor(opponent);

  generateOffer();
};

var makeShuffled = (max, length) => {
  var s = [], r = [];
  for (var i = 0; i < max; i++) s.push(i);
  for (var i = 0; i < length; i++) r.push(s.splice(nextRandom(s.length), 1)[0]);
  return r
}

var makeSailor = (hasPrimary, otherCount, name) => {
  // f: files
  var sailor = { f: [], n: name };

  if (hasPrimary) {
    // The first item in the array is always for the primary client we're
    // hunting for.
    sailor.f.push(
      {
        // m: value multiplier
        m: PRIMARY_VALUE_MULTIPLIER,
        // b: bits of this holding
        b: makePartial(),
        // i: file id, 0 is the primary file
        i: 0,
      });
  }

  makeShuffled(MAX_OTHER_FILES_IN_PLAY, otherCount).forEach(i => sailor.f.push(
    {
      // TODO: Randomise the value.
      m: 1,
      b: makePartial(),
      // Don't allow 0, that's special.
      i: i + 1,
    })
  );

  return sailor;
};

var countSetBits = p => {
  var count = 0;
  while (p > 0) {
    p &= (p - 1);
    count++;
  }
  return count;
}

// Returns the value of an offer ("01000010") given its multiplier (2),
var calcValue = (offer, multiplier) => countSetBits(offer) * multiplier;

// Sailor X, Sailor Y
var findCommonFiles = (sx, sy) => sx.f.map(f => f.i).filter(v => sy.f.map(f => f.i).includes(v));

var getSailorFile = (sailor, id) => sailor.f.find(f => f.i == id);

var findHighValueTransction = (fromSailor, toSailor) => {
  // Maximise value for `toSailor`.
  var highestValueTransaction = {v:0};

  findCommonFiles(fromSailor, toSailor).forEach(id => {
    var fromFile = getSailorFile(fromSailor, id);
    var toFile = getSailorFile(toSailor, id);
    var offer = (toFile.b ^ fromFile.b) & fromFile.b;
    var value = calcValue(offer, fromFile.m);
    // console.debug(`A transfer of ${toBinary(offer)} for file ${id} would be worth $${value}.`);
    if (value > highestValueTransaction.v) {
      highestValueTransaction.id = id;
      highestValueTransaction.b = offer;
      highestValueTransaction.v = value;
    }
  });

  return highestValueTransaction;
}

// var MAX_FILE_VALUE = 255;


var findFullTransaction = (fromSailor, toSailor, id) => {
  var r = {i: id};
  var fromFile = getSailorFile(fromSailor, id);
  var toFile = getSailorFile(toSailor, id);
  r.b = ((toFile ? toFile.b : 0) ^ fromFile.b) & fromFile.b;
  r.v = calcValue(r.b, fromFile.m);
  // console.debug(`${fromSailor.n} could copy $${r.v} of chunks of file ${id} to ${toSailor.n}.`);
  return r;
}

var showTransaction = t => console.debug(`[transaction] "${toBinary(t.b)}" of file (${t.i}) worth $${t.v}.`);


var findLowValueTransaction = (fromSailor, toSailor, matchValue) => {
  // Minimise value for `toSailor`.
  var transactions = [];
  // var total = 0;

  // console.debug(`Looking for chunks worth $${matchValue} to copy from ${fromSailor.n} -> ${toSailor.n}.`);

  // var lowestOffer = {v: 99}; // Assume max multipler of 3, 3*8 bits = 24, may as go for 99 if we need double digits anyway

  // Don't just look in the common files; `fromnSailor` might decide to offer `toSailor` a new file.

  // Get a sorted (lowest to highest value) list of possible transactions.

  transactions = fromSailor.f.map(file => findFullTransaction(fromSailor, toSailor, file.i));
  transactions.sort((x,y) => x.v > y.v);

  console.debug('Transactions to consider (in order):');
  transactions.forEach(t => showTransaction(t));

  console.info(`${fromSailor.n} started thinking about the lowest-value chunks to offer for $${matchValue}...`)

  var transactionsToOffer = [];
  var transactionsToOfferTotal = 0;

  transactions.forEach(t => {
    var over = t.v + transactionsToOfferTotal - matchValue;

    // console.debug(`${fromSailor.n} could offer chunks of file ${id} worth $${value}...`);

    if (over <= 0) {
      transactionsToOffer.push(t);
      transactionsToOfferTotal += t.v;
      console.debug('Will offer in entirety:');
      showTransaction(t);
    } else {
      console.debug('Will offer in part:');
      showTransaction(t);
      // console.info('The sailor cannot give you all of these because the value is too high.');
      // var remove = f(over/fromFile.m);
      // console.info(`The sailor must remove ${remove} chunks.`);
    }



  });


      // var fromFile = getSailorFile(fromSailor, id);
    // var toFile = getSailorFile(toSailor, id);
    // var offer = (toFile.b ^ fromFile.b) & fromFile.b;
    // var value = calcValue(offer, fromFile.m);




    // console.debug(`A transfer of ${toBinary(offer)} for file ${id} would be worth $${value}.`);
    // if (value > highestOffer.v) {
    //   highestOffer.i = id;
    //   highestOffer.b = offer;
    //   highestOffer.v = value;
    // }


  return null;
};


// var showOffer = offer => console.debug(`An offer to copy file ${offer.i} chunks "${toBinary(offer.b)}" from ${offer.f.n} to ${offer.t.n}.`);

// var global_current_offer;

var generateOffer = () => {
  // var currSailorValue = countSetBits(save.b) * save.v;
  // console.info(`The sailor's data is currently worth $${currSailorValue}.`)
  console.info(`${opponent.n} thinks for a moment before making an offer.`);

  var highTransaction = findHighValueTransction(player, opponent);
  // showTransaction(highTransaction);

  var lowTransaction = findLowValueTransaction(opponent, player, highTransaction.v);
  // if (lowTransaction) showTransaction(lowTransaction);

  // var want = (save.b ^ scam.b) & scam.b;
  // showBits(want);
  // var takeValue = calcValue(want, save.m);
  // console.info(`This transaction is worth $${takeValue}.`)

  // // The sailor will offer 80% value in return.
  // var returnValue = f(takeValue * 0.8);
  // console.info(`The sailor will offer $${returnValue} in return.`);

  // The sailor will offer the same VALUE in return, but not necessarily for
  // the same file. They might offer some parts of a lower-value file.
  //
  // The sailor will only offer to let you complete a file if the value they
  // receive from the trade is 2x the value you will receive from your
  // completed file.


  // console.info(`The sailor says, "I will offer you ${returnCount} parts in return:"`);


  // If we need 1 chunk then the sailor will offer it. The sailor code demands honor. And maybe he can continue selling the data to folks who don't know it's complete. Hah, maybe you're not even the first.

}




canvas.addEventListener('click', onClick);


// makeButton(10, 10, 100, 50, 'test');
newGame();
