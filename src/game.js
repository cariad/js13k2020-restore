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

var fe = (a, f) => a.forEach(f);

var buttons = [];

var makeSurname = _ => {
  var x = ['Keyboard', 'Planet', 'Soul', 'Video', 'e', 'f', 'g', 'h', 'i', 'j'][nextRandom()];
  var y = ['jammer', 'crusher', 'juicer', 'b', 'e', 'f', 'g', 'h', 'i', 'j'][nextRandom()];
  return x + y;
}

var makeName = _ => {
  var x = [];
  x[0] = ['Astro', 'Captain', 'Enchanter', 'Pirate', 'Priest', 'Sales Manager', 'g', 'h', 'i', 'j'][nextRandom()];
  x[1] = ['Nigel', 'Fyodor', 'Jam', 'Jonas', 'Lucas', 'f', 'g', 'h', 'i', 'j'][nextRandom()];
  x[2] = makeSurname();
  return x.join(' ');
};




var draw = () => {
  var w = canvas.width = window.innerWidth;
  var h = canvas.height = window.innerHeight;


  // var w = canvas.width, h = canvas.height;

  ctx.fillStyle = 'yellow';
  ctx.fillRect(0, 0, w, h);
  // ctx.clearRect(0, 0, 800, 600);

  ctx.fillStyle = 'black';
  ctx.font = 'bold 22px cursive';
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`${w} x ${h}`, 0, 0);


  if (opponent) {
    drawOpponent(50, 100);
    drawOpponent(300, 100);
    drawOpponent(550, 100);

    drawOpponent(50, 350);
    drawOpponent(300, 350);
    drawOpponent(550, 350);

    drawOpponent(50, 600);
    drawOpponent(300, 600);
    drawOpponent(550, 600);
  }

  if (global_current_offer) {
    makeButton(50, 50, 100, 50, "Accept");
    makeButton(200, 50, 100, 50, "Counter");
  }
};

window.addEventListener('resize', draw, true);
window.addEventListener('orientationchange', draw, true);


var fi = (a, f) => a.find(f);


// Change red pixels to tone.
// Change green pixels to tone + 40
// Change blue pixels to tone - 40


// c: color [r, g, b]
// d: +/- for tones
var drawObject = (g, x, y, c, d) => {
  var offcanvas = document.createElement('canvas');
  var offctx = offcanvas.getContext("2d");
  var offWidth = offcanvas.width = 32, offHeight = offcanvas.height = 36;

  g(offctx);

  var image = offctx.getImageData(0, 0, offWidth, offHeight)
  var pixel = 0;

  while (pixel < (offWidth * offHeight) * 4) {
    var alphaIndex = pixel + 3;
    if (image.data[alphaIndex] < 128) {
      image.data[alphaIndex] = 0;
    } else {

      var z;
      if (image.data[pixel + 0] >= 128)
        z = c;
      else if (image.data[pixel + 1] >= 128)
        z = c.map(t => t + d);
      else
        z = c.map(t => t - d);

      image.data[pixel + 0] = z[0];
      image.data[pixel + 1] = z[1];
      image.data[pixel + 2] = z[2];
      image.data[alphaIndex] = 255
    }
    pixel += 4;
  }

  offctx.clearRect(0, 0, offWidth, offHeight);
  offctx.putImageData(image, 0, 0);

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(offcanvas, x, y, offWidth * 10, offHeight * 10);
  ctx.imageSmoothingEnabled = true;



};


var drawOpponent = (x, y) => {
  // var offcanvas = document.createElement('canvas');
  // var offctx = offcanvas.getContext("2d");
  // var offWidth = offcanvas.width = 32, offHeight = offcanvas.height = 36;

  var tone = [
    [197, 140, 133],
    [236, 188, 180],
    [80, 51, 53],
    [89, 47, 42],
  ][nextRandom(4)];

  var c = tone.map(t => t + (nextRandom() - 4) * 1.5);

  drawObject((offctx) => {
    var radius = nextRandom(6) + 3;
    offctx.lineWidth = 1;
    offctx.strokeStyle = '#f00';
    offctx.fillStyle = '#0f0';
    roundRect(offctx, 5, 5, 20, 20, radius, true);
  }, x, y, c, 40);

  drawObject((offctx) => {
    var eyesY = 13 + (nextRandom(2) - 1);
    var eyesGap = 4 + (nextRandom(2) - 1);

    offctx.lineWidth = 1;
    offctx.fillStyle = '#f00';
    offctx.fillRect(8, eyesY, 4, 3);
    offctx.fillRect(11 + eyesGap, eyesY, 4, 3);

    offctx.fillStyle = '#00f';
    offctx.fillRect(9, eyesY + 1, 1, 1);
    offctx.fillRect(12 + eyesGap, eyesY + 1, 1, 1);
  }, x, y, [255, 255, 255], 255);

  drawObject((offctx) => {
    offctx.lineWidth = 1;
    offctx.fillStyle = '#00f';

    var mouthStyle = [
      // width. height, startX
      [10, 2, 8],
      [12, 4, 7],
    ][nextRandom(2)];

    var mouthWidth = mouthStyle[0];
    var mouthHeight = mouthStyle[1];

    var startX = mouthStyle[2];
    var startY = 19;

    var c1x = (mouthWidth / 3) + startX;
    var c1y = startY + mouthHeight;

    var c2x = ((mouthWidth / 3) * 2) + startX;
    var c2y = startY + mouthHeight;

    var endX = startX + mouthWidth;
    var endY = startY;

    offctx.beginPath();
    offctx.moveTo(startX, startY);
    offctx.bezierCurveTo(c1x, c1y, c2x, c2y, endX, endY);
    offctx.stroke();
  }, x, y, tone, 110);







  // var skinTone1 = [197, 140, 133]; // rgba
  // var image = offctx.getImageData(0, 0, offWidth, offHeight)
  // var pixel = 0;

  // while (pixel < (offWidth * offHeight) * 4) {
  //   var alphaIndex = pixel + 3;
  //   if (image.data[alphaIndex] < 128) {
  //     image.data[alphaIndex] = 0;
  //   } else {

  //     var c;
  //     if (image.data[pixel + 0] >= 128)
  //       c = skinTone1;
  //     else if (image.data[pixel + 1] >= 128)
  //       c = skinTone1.map(t => t + 40);
  //     else
  //       c = skinTone1.map(t => t - 40);

  //     image.data[pixel + 0] = c[0];
  //     image.data[pixel + 1] = c[1];
  //     image.data[pixel + 2] = c[2];
  //     image.data[alphaIndex] = 255
  //   }
  //   pixel += 4;
  // }



  // offctx.clearRect(0, 0, offWidth, offHeight);
  // offctx.putImageData(image, 0, 0);

  // ctx.imageSmoothingEnabled = false;
  // ctx.drawImage(offcanvas, 200, 200, offWidth * 10, offHeight * 10);
  // ctx.imageSmoothingEnabled = true;


  // roundRect(ctx, 300, 5, 200, 100, {
  //   tl: 50,
  //   br: 25
  // }, true);










}


/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} [radius = 5] The corner radius; It can also be an object
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] Top left
 * @param {Number} [radius.tr = 0] Top right
 * @param {Number} [radius.br = 0] Bottom right
 * @param {Number} [radius.bl = 0] Bottom left
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
 */
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke === 'undefined') {
    stroke = true;
  }
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  if (typeof radius === 'number') {
    radius = { tl: radius, tr: radius, br: radius, bl: radius };
  } else {
    var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }

}







var onClick = (e) => {
  var x = e.offsetX, y = e.offsetY;
  var button = buttons.reverse().find(i => i.x < x && x < i.xa && i.y < y && y < i.ya);
  if (!button) return;

  if (button.t == 'Accept') {
    buttons = [];
    acceptOffer();
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
var ORIGINAL_LEFT = SEED_LEFT = new Date().getMinutes();
var ORIGINAL_RIGHT = SEED_RIGHT = new Date().getSeconds();

var nextRandom = (m = 10) => {
  // l = 85
  // r = 60
  //   = 145
  var d = (SEED_LEFT + SEED_RIGHT) / 100, r = f((d - f(d)) * 100);
  console.debug('SEED_LEFT', SEED_LEFT, 'SEED_RIGHT', SEED_RIGHT, 'd', d, 'r', r);

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
  // sailor.f.forEach(file => console.info(`> (file ID: ${file.i.toString().padStart(2, '0')}) ${toBinary(file.b)}`));
  fe(sailor.f, file => console.info(`> (file ID: ${file.i.toString().padStart(2, '0')}) ${toBinary(file.b)}`));
};

var toBinary = (b) => b.toString(2).padStart(CHUNKS_PER_FILE, 0);

var showBits = (p) => console.info(`(${p.toString().padStart(3, ' ')}) ${toBinary(p)}`);

var player;
var opponent;

var newGame = () => {
  player = makeSailor(true, 3, 'Bob');
  newOpponent();
};

var newOpponent = () => {
  showSailor(player);
  opponent = makeSailor(true, 3, makeName());
  showSailor(opponent);
  generateOffer();
}

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

  fe(makeShuffled(MAX_OTHER_FILES_IN_PLAY, otherCount), i => sailor.f.push(
    {
      // TODO: Randomise the value.
      m: 1,
      b: makePartial(),
      // Don't allow 0, that's special.
      i: i + 1,
    }));



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

  fe(findCommonFiles(fromSailor, toSailor), id => {
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
  return (highestValueTransaction.v > 0) ? highestValueTransaction : null;
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
  transactions = fromSailor.f.map(file => findFullTransaction(fromSailor, toSailor, file.i)).filter(t => t.b > 0);
  transactions.sort((x, y) => x.v > y.v);

  var transactionsToOffer = [];
  var transactionsToOfferTotal = 0;

  // transactions.forEach(t => {
  //   var totalIfIncluded = t.v + transactionsToOfferTotal;
  //   var over = totalIfIncluded - matchValue;

  //   if (over > 0) {
  //     var maxValueFromThisTransaction = matchValue - transactionsToOfferTotal;
  //     var keep = f(maxValueFromThisTransaction / t.e);
  //     if (!keep) return;
  //     var subtractors = makeShuffled(8, 8).map(i => Math.pow(2, i));

  //     while (countSetBits(t.b) > keep) {
  //       var subtractor = subtractors.pop();
  //       if ((t.b & subtractor) == subtractor) t.b -= subtractor;
  //     }
  //     t.v = calcValue(t.b, t.e);
  //   }

  //   transactionsToOffer.push(t);
  //   transactionsToOfferTotal += t.v;
  // });


  fe(transactions, t => {
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


var applyTransaction = (s, t) => { if (g = s.f.find(h => h.i == t.i)) g.b += t.b; };

var MAX_FILE_B = 255;
var global_winner = null;

var acceptOffer = _ => {
  // Apply the opponent's transactions.
  // global_current_offer.o.forEach(t => applyTransaction(opponent, t));
  fe(global_current_offer.o, t => applyTransaction(opponent, t));


  // Apply the player's transactions
  // global_current_offer.p.forEach(t => applyTransaction(player, t));
  fe(global_current_offer.p, t => applyTransaction(player, t));

  global_current_offer = null;

  var playerWon = getSailorFile(player, 0).b == MAX_FILE_B;
  var opponentWon = getSailorFile(opponent, 0).b == MAX_FILE_B;

  if (playerWon && opponentWon) {
    // TODO: Special descriptive ending.
  }

  if (playerWon) {
    global_winner = player;
    console.warn(`You won! :)`);
    showSailor(player);
  }
  else if (opponentWon) {
    global_winner = opponent;
    console.warn(`${opponent.n} won! :(`);
    showSailor(opponent);
  }
  else {
    console.info(`${opponent.n} walks away with:`);
    showSailor(opponent);
    newOpponent();
  }

  requestAnimationFrame(draw);
};

var logOffer = o => {
  console.info(`There's an offer on the table!`);
  console.info(`${opponent.n} will take:`);
  fe(o.o, t => logTransaction(t));
  console.info(`In return, ${opponent.n} will offer:`);
  fe(o.p, t => logTransaction(t));
}

var generateOffer = () => {
  var highTransaction = findHighValueTransction(player, opponent);

  if (!highTransaction) {
    console.warn('No offers.');
    newOpponent();
  }

  var lowTransactions = findLowValueTransaction(opponent, player, highTransaction.v);

  global_current_offer = {
    // o: apply to opponent
    o: [highTransaction],
    // p: apply to player
    p: lowTransactions
  };

  logOffer(global_current_offer);

  requestAnimationFrame(draw);

  // TODO: If the lowTransactions are < 80% of the highTransactions then the
  //       opponent should feel bad and recalcuate the highTransaction to no
  //       more than 80% over the lowTransaction.

}

canvas.addEventListener('click', onClick);
newGame();
