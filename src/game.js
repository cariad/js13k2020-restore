var canvas = document.getElementById("c");
var ctx = canvas.getContext("2d");


buttons = [];

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

var f = Math.floor;


// Thank you, David Braben!
var SEED_LEFT = 4;
var SEED_RIGHT = 7;
// `m` should be +1 over the maximum you want.
var nextRandom = (m = 10) => {
  var d = (SEED_LEFT + SEED_RIGHT) / 10;
  var r = f((d - f(d)) * 10);
  SEED_LEFT = SEED_RIGHT;
  SEED_RIGHT = r;
  return r % m;
}




var nextRandomBool = () => nextRandom() < 5;

var CHUNKS_PER_FILE = 8;

var makePartial = () => {
  var p = 0, PART_LENGTH = 2;
  for (var i = CHUNKS_PER_FILE / PART_LENGTH; i > 0; i--) {
    p = p + nextRandom(4); // 0, 1, 2 or 3
    if (i > 1) p = p << PART_LENGTH;
  }
  return p;
}


var showSailor = (s) => {
  for (var i=0; i<s.h.length; i++) {
    showHolding(s.h[i]);
  }
};

var showBits = (p) => console.info(`(${p.toString().padStart(3, ' ')}) ${p.toString(2).padStart(CHUNKS_PER_FILE, 0)}`);
var showHolding = (h) => console.info(`(fileid=${h.i.toString().padStart(2, '0')}) ${h.b.toString(2).padStart(CHUNKS_PER_FILE, 0)}`);

// var owned;

var newGame = () => {
  var me = makeSailor(true, 0);
  console.info('Me:');
  showSailor(me);
  // showBits(me.h[0].b);

  var sailor = makeSailor(true, 3);
  console.info('Theirs:');
  showSailor(sailor);

  generateOffer(sailor.h[0], me.h[0]);
};

// The primary client's data is a little more valuable than the usual.
var PRIMARY_VALUE_MULTIPLIER = 2;

var MAX_OTHER_FILES_IN_PLAY = 8;

var makeShuffled = (max, length) => {
  // max = maximum value (exclusive)
  // len = actual quantity to return.
  // e.g. makeShuffled(10, 3) == [7, 3, 9]
  var s = [];
  for(var i = 0; i<max; i++) {
    s.push(i);
  }
  console.info('ordered sequence', s);

  r = [];
  for(var i =0; i<length; i++) {
    // REMEMBER: Passing > 10 into nextRandom() makes no sense.
    r.push(s.splice(nextRandom(s.length),1)[0]);
  }

  console.info('randomised sequence', r);
  return r
}


var makeSailor = (hasPrimary, otherCount) => {
  // h: holding
  var sailor = { h: [] };

  if (hasPrimary) {
    // The first item in the array is always for the primary client we're
    // hunting for.
    sailor.h.push(
      {
        // v: value of this holding
        v: PRIMARY_VALUE_MULTIPLIER,
        // b: bits of this holding
        b: makePartial(),
        // i: file id, 0 is the primary file
        i: 0,
      });
  }

  makeShuffled(MAX_OTHER_FILES_IN_PLAY, otherCount).forEach(i => sailor.h.push(
    {
      // TODO: Randomise the value.
      v: 1,
      b: makePartial(),
      // Don't allow 0, that's special.
      i: i+1,
    })
  );

  return sailor;
};


var countSetBits = (p) => {
  var count = 0;
  while (p > 0) {
    p &= (p - 1);
    count++;
  }
  return count;
}

var generateOffer = (save, scam) => {
  // var currSailorValue = countSetBits(save.b) * save.v;
  // console.info(`The sailor's data is currently worth $${currSailorValue}.`)
  console.info('The sailor says, "I want..."');
  var want = (save.b ^ scam.b) & scam.b;
  showBits(want);
  takeCount = countSetBits(want);
  // console.info(`This transaction is worth $${set} to the sailor.`)

  console.info(`The sailor wants to take ${takeCount} parts.`);

  // The sailor will offer the same VALUE in return, but not necessarily for
  // the same file. They might offer some parts of a lower-value file.
  //
  // The sailor will only offer to let you complete a file if the value they
  // receive from the trade is 2x the value you will receive from your
  // completed file.

  var returnCount = f(takeCount * 0.8);

  console.info(`The sailor says, "I will offer you ${returnCount} parts in return:"`);


  // If we need 1 chunk then the sailor will offer it. The sailor code demands honor. And maybe he can continue selling the data to folks who don't know it's complete. Hah, maybe you're not even the first.

}

/*

states:

1. offer to trade

*/



canvas.addEventListener('click', onClick);


// makeButton(10, 10, 100, 50, 'test');
newGame();
