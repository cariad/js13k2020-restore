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
  var margin = 20;

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
    var hw = f(w / 2)
    var maxWidth = hw - margin;
    var maxHeight = h - (margin * 2);
    var dim = (maxWidth > maxHeight) ? maxHeight : maxWidth;
    var oppX = (w * 0.75) - (dim / 2);
    var oppY = (h / 2) - (dim / 2);
    drawOpponent(oppX, oppY, dim);
  }

  if (global_current_offer) {
    makeButton(50, 50, 100, 50, 'Accept');
    makeButton(200, 50, 100, 50, 'Counter');
  }

  ctx.font = 'bold 22px cursive';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = '#000';
  fe(buttons, b => {
    ctx.fillText(b.t, b.x + (b.w / 2), b.y + (b.h / 2), b.w, b.h);
    ctx.strokeRect(b.x, b.y, b.w, b.h);
  });

};

window.addEventListener('resize', draw, true);
window.addEventListener('orientationchange', draw, true);


var fi = (a, f) => a.find(f);


// Change red pixels to tone.
// Change green pixels to tone + 40
// Change blue pixels to tone - 40


// c: color [r, g, b]
// d: +/- for tones
var drawObject = (g, x, y, c, d, w) => {
  var offcanvas = document.createElement('canvas');
  var offctx = offcanvas.getContext("2d");
  var offWidth = offcanvas.width = 31, offHeight = offcanvas.height = 31;

  offctx.lineWidth = 1;

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
  ctx.drawImage(offcanvas, x, y, w, (w / offWidth) * offHeight);
  ctx.imageSmoothingEnabled = true;
};

var R = '#f00';
var G = '#0f0';
var B = '#00f';

var drawOpponent = (x, y, w) => {
  var drawHair = (toctx, paths) => {
    toctx.strokeStyle = R;
    toctx.fillStyle = G;
    fe(paths, p => {
      toctx.beginPath();
      toctx.moveTo(p[0], p[1]);
      toctx.bezierCurveTo(p[2], p[3], p[4], p[5], p[6], p[7]);
      toctx.fill();
      toctx.stroke();
    })
  }

  var a = opponent.a, eyesX = 7, eyeWidth = 4;

  // opponent.a.hs[0] = behind head
  // opponent.a.hs[1] = in front of head
  drawObject((offctx) => drawHair(offctx, a.hs[0]), x, y, a.ht, 64, w);

  drawObject((offctx) => {
    offctx.strokeStyle = R;
    offctx.fillStyle = G;
    drawRectangle(offctx, 5, 5, 20, 20, opponent.a.hr);
  }, x, y, a.s, 40, w);

  drawObject((offctx) => {
    offctx.fillStyle = R;
    offctx.fillRect(eyesX, a.ey, eyeWidth, a.eh);
    offctx.fillRect(eyesX + eyeWidth + a.eg, a.ey, eyeWidth, a.eh);
    offctx.fillStyle = B;
    offctx.fillRect(eyesX + 1, a.ey + 1, 1, 1);
    offctx.fillRect(eyesX + eyeWidth + a.eg + 1, a.ey + 1, 1, 1);
  }, x, y, [255, 255, 255], 255, w);

  drawObject((offctx) => {
    offctx.fillStyle = B;

    var c1x = (a.m[0] / 3) + a.m[2];
    var c1y = 19 + a.m[1];

    var c2x = ((a.m[0] / 3) * 2) + a.m[2];
    var c2y = 19 + a.m[1];

    var endX = a.m[2] + a.m[0];
    var endY = 19;

    offctx.beginPath();
    offctx.moveTo(a.m[2], 19);
    offctx.bezierCurveTo(c1x, c1y, c2x, c2y, endX, endY);
    offctx.stroke();
  }, x, y, a.s, 110, w);

  drawObject((offctx) => drawHair(offctx, a.hs[1]), x, y, a.ht, 64, w);
}

var drawRectangle = (cc, x, y, width, height, radius) => {
  cc.beginPath();
  cc.moveTo(x + radius, y);
  cc.lineTo(x + width - radius, y);
  cc.quadraticCurveTo(x + width, y, x + width, y + radius);
  cc.lineTo(x + width, y + height - radius);
  cc.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  cc.lineTo(x + radius, y + height);
  cc.quadraticCurveTo(x, y + height, x, y + height - radius);
  cc.lineTo(x, y + radius);
  cc.quadraticCurveTo(x, y, x + radius, y);
  cc.closePath();
  cc.fill();
  cc.stroke();
}

var onClick = (e) => {
  var x = e.offsetX, y = e.offsetY;
  var button = buttons.reverse().find(i => i.x < x && x < i.xa && i.y < y && y < i.ya);
  if (!button) {
    console.log('missed', x, y);
    return;
  }

  console.log('hit', x, y);

  if (button.t == 'Accept') {
    buttons = [];
    acceptOffer();
  } else if (button.t == 'Again') {
    buttons = [];
    newGame();
  }
  else {
    console.log(button.t);
  }
};

var makeButton = (x, y, w, h, t) => {
  buttons.push({ x: x, y: y, xa: x + w, ya: y + h, t: t, w: w, h: h });
};

// Thank you, David Braben!
var SEED_LEFT = new Date().getMinutes();
var SEED_RIGHT = new Date().getSeconds();

var nextRandom = (m = 10) => {
  var d = (SEED_LEFT + SEED_RIGHT) / 100, r = f((d - f(d)) * 100);
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
  var sailor = {
    f: [],
    n: name,
    // a: avatar
    a: {
      // s: skin tone
      s: [
        [197, 140, 133],
        [236, 188, 180],
        [80, 51, 53],
        [89, 47, 42],
      ][nextRandom(4)].map(t => t + (nextRandom() - 4) * 1.5),
      // ht: hair tone
      ht: [128 * nextRandom(2), 128 * nextRandom(2), 128 * nextRandom(2)],
      // hs: hair style
      hs: [
        [[], []],
        [
          // moveX, moveY, c1x, c1y, c2x, c2y, endX, endY
          // Behind head
          [[22 - 18, 10 - 2, 12 - 18, 36 - 2, 38 - 18, 36 - 2, 26 - 18, 3 - 2]],
          // IN front of head
          [[22, 10, 12, 36, 38, 36, 26, 3], [26, 3, -9, -6, -3, 18, 25, 9]],
        ],
        [
          // Behind head
          [],
          // IN front of head
          [[26 - 4, 7 - 1, 10 - 4, -6 - 1, -3 - 4, 18 - 1, 25 - 4, 9 - 1]],
        ],
      ][nextRandom(3)],
      // hr: head radius
      hr: nextRandom(6) + 3,
      // ey: eyes y
      ey: nextRandom(3) + 12,
      // eg: eyes gap
      eg: nextRandom(2) + 2,
      // eh: eyes height
      eh: nextRandom(2) + 2,
      // m: mouth stylw
      m: [
        // width. height, startX
        [10, 2, 8],
        [12, 4, 7],
      ][nextRandom(2)],
    }
  };

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


var applyTransaction = (s, t) => {
  if (g = s.f.find(h => h.i == t.i)) g.b += t.b; else {
    s.f.push({



      m: 1,
      b: t.b,
      // Don't allow 0, that's special.
      i: t.i,




    })
  }
};

var MAX_FILE_B = 255;
var global_winner;

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
    global_winner = player;
    console.warn(`You won! :)`);
    showSailor(player);
    makeButton(50, 50, 100, 50, 'Again');
  } else if (playerWon) {
    global_winner = player;
    console.warn(`You won! :)`);
    showSailor(player);
    makeButton(50, 50, 100, 50, 'Again');
  }
  else if (opponentWon) {
    global_winner = opponent;
    console.warn(`${opponent.n} won! :(`);
    showSailor(opponent);
    makeButton(50, 50, 100, 50, 'Again');
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
    console.warn(`You have nothing of value to ${opponent.n}.`);
    newOpponent();
    return;
  }

  var lowTransactions = findLowValueTransaction(opponent, player, highTransaction.v);

  console.debug('lowTransactions', lowTransactions);

  if (lowTransactions.length == 0) {
    console.warn(`${opponent.n} has nothing of value to you.`);
    newOpponent();
    return;
  }

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
