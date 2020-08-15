// The primary client's data is a little more valuable than the usual.
var PRIMARY_VALUE_MULTIPLIER = 2;

// The size of the pool of files that sailors could be carrying.
var MAX_OTHER_FILES_IN_PLAY = 8;

var CHUNKS_PER_FILE = 8;

// We use this a lot, so let's not repeat the whole thing every time.
var f = Math.floor;

var global_current_offer;

var canvas = document.getElementById("c");
var ctx = canvas.getContext("2d");

var buttons = [];

var draw = () => {
  ctx.clearRect(0, 0, 800, 600);

  if (global_current_offer) {
    makeButton(50, 50, 100, 50, "Accept");
    makeButton(200, 50, 100, 50, "Counter");
  }
};

var onClick = (e) => {
  var x = e.offsetX, y = e.offsetY;
  var button = buttons.reverse().find(i => i.x < x && x < i.xa && i.y < y && y < i.ya);
  if (!button) return;

  if (button.t == 'Accept') {

  } else {
    console.log(button.t);
  }
};

var makeButton = (x, y, w, h, t) => {
  // ctx.strokeStyle = "#666";
  // ctx.strokeRect(x, y, w, h);
  ctx.font = 'bold 22px cursive';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(t, x + w / 2, y + h / 2, w);
  buttons.push({ x: x, y: y, xa: x + w, ya: y + h, t: t });
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
  console.info(`${sailor.n} holds:`);
  sailor.f.forEach(file => console.info(`> (file ID: ${file.i.toString().padStart(2, '0')}) ${toBinary(file.b)}`));
};

var toBinary = (b) => b.toString(2).padStart(CHUNKS_PER_FILE, 0);

var showBits = (p) => console.info(`(${p.toString().padStart(3, ' ')}) ${toBinary(p)}`);

var player;
var opponent;

var newGame = () => {
  player = makeSailor(true, 3, 'Bob');
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
  var highestValueTransaction = { v: 0 };

  findCommonFiles(fromSailor, toSailor).forEach(id => {
    var fromFile = getSailorFile(fromSailor, id);
    var toFile = getSailorFile(toSailor, id);
    var offer = (toFile.b ^ fromFile.b) & fromFile.b;
    var value = calcValue(offer, fromFile.m);
    if (value > highestValueTransaction.v) {
      highestValueTransaction.i = id;
      highestValueTransaction.b = offer;
      highestValueTransaction.v = value;
    }
  });

  return highestValueTransaction;
}

var findFullTransaction = (fromSailor, toSailor, id) => {
  var r = { i: id };
  var fromFile = getSailorFile(fromSailor, id);
  var toFile = getSailorFile(toSailor, id);
  r.b = ((toFile ? toFile.b : 0) ^ fromFile.b) & fromFile.b;
  r.v = calcValue(r.b, fromFile.m);
  // e = value of each
  r.e = fromFile.m;
  return r;
}

var findLowValueTransaction = (fromSailor, toSailor, matchValue) => {
  // Minimise value for `toSailor`.
  var transactions = [];
  transactions = fromSailor.f.map(file => findFullTransaction(fromSailor, toSailor, file.i));
  transactions.sort((x, y) => x.v > y.v);

  var transactionsToOffer = [];
  var transactionsToOfferTotal = 0;

  transactions.forEach(t => {
    var totalIfIncluded = t.v + transactionsToOfferTotal;
    var over = totalIfIncluded - matchValue;

    if (over > 0) {
      var maxValueFromThisTransaction = matchValue - transactionsToOfferTotal;
      var keep = f(maxValueFromThisTransaction / t.e);
      if (!keep) return;
      var subtractors = makeShuffled(8, 8).map(i => Math.pow(2, i));

      while (countSetBits(t.b) > keep) {
        var subtractor = subtractors.pop();
        if ((t.b & subtractor) == subtractor) t.b -= subtractor;
      }
      t.v = calcValue(t.b, t.e);
    }

    transactionsToOffer.push(t);
    transactionsToOfferTotal += t.v;
  });

  return transactionsToOffer;
};

var logTransaction = t => console.debug(`> "${toBinary(t.b)}" of file (${t.i}) worth $${t.v}.`);

var logOffer = o => {
  console.info(`${o.a.n} has an offer on the table!`);
  console.info(`${o.a.n} will take:`);
  o.t.forEach(t => logTransaction(t));
  console.info(`In return, ${o.a.n} will offer:`);
  o.r.forEach(t => logTransaction(t));
}

var generateOffer = () => {
  var highTransaction = findHighValueTransction(player, opponent);
  var lowTransactions = findLowValueTransaction(opponent, player, highTransaction.v);

  global_current_offer = {
    // a: from sailor
    a: opponent,
    // b: to sailor
    b: player,
    // t: from sailor will take
    t: [highTransaction],
    // r: from sailor offers in return
    r: lowTransactions
  };

  logOffer(global_current_offer);

  requestAnimationFrame(draw);

  // TODO: If the lowTransactions are < 80% of the highTransactions then the
  //       opponent should feel bad and recalcuate the highTransaction to no
  //       more than 80% over the lowTransaction.

}

canvas.addEventListener('click', onClick);
newGame();
