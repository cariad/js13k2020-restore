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


var baseChunkSquare = 10;
var baseFileWidth = CHUNKS_PER_FILE * baseChunkSquare + 1;

var drawFiles = (files, x, y, w) => {
  var drawChunkSquare = w / baseFileWidth * baseChunkSquare;

  var nextY = y;

  for (var i = 0; i < files.length; i++) {
    nextY = drawFile(files[i], x, nextY, w, drawChunkSquare);
  }
}


var drawFile = (file, x, y, w, drawChunkSquare) => {

  ctx.strokeStyle = 'red';
  ctx.strokeRect(x, y, w, 20);

  bottomY = y + 20;


  ctx.fillStyle = 'black';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = "left";
  ctx.fillText('README.md', x, y);


  return bottomY;























  // drawObject((offctx) => {
  //   offctx.fillStyle = R;
  //   offctx.fillRect(0, 0, baseFileWidth, baseChunkSquare);
  // },
  //   baseFileWidth,        // buffer width
  //   x, y, w, // x, y, width to draw on canvas
  //   [0, 0, 0], // color to paint reds as
  //   0,         // color deviation for greens and blues
  // );

  // for (var i = 0; i < CHUNKS_PER_FILE; i++) {
  //   drawObject((offctx) => {
  //     var thisPow = Math.pow(2, CHUNKS_PER_FILE - i - 1);
  //     offctx.fillStyle = (file.b & thisPow) == thisPow ? G : B;
  //     offctx.fillRect(1, 1, 9, 8);
  //   },
  //     baseChunkSquare,                // buffer width
  //     x + i * drawChunkSquare, y, drawChunkSquare, // x, y, width to draw on canvas
  //     [0, 255, 0],       // color to paint reds as
  //     160,                 // color deviation for greens and blues
  //   );
  // }

};


var draw = () => {
  var w = canvas.width = window.innerWidth;
  var h = canvas.height = window.innerHeight;

  // var pagePadding = 20;

  var pagePaddingX = w * 0.02;
  var pagePaddingY = h * 0.02;

  var pagePaddedWidth = w - (pagePaddingX * 2);
  var pagePaddedHeight = h - (pagePaddingY * 2);

  var cellDim = Math.min(pagePaddedWidth / 3, pagePaddedHeight / 2);

  var cellPadding = cellDim * 0.02;

  var cellPaddedDim = cellDim - (cellPadding * 2);

  var gridWidth = cellDim * 3;
  var gridHeight = cellDim * 2;

  var pageOriginX = (w / 2) - (gridWidth / 2);
  var pageOriginY = (h / 2) - (gridHeight / 2);

  ctx.fillStyle = 'yellow';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = 'black';
  ctx.font = 'bold 22px cursive';
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`${w} x ${h}`, 0, 0);

  var row1PaddedOriginY = pageOriginY + cellPadding;
  var row2PaddedOriginY = pageOriginY + cellDim + cellPadding;

  var col1PaddedOriginX = pageOriginX + cellPadding;
  var col2PaddedOriginX = pageOriginX + cellDim + cellPadding;
  var col3PaddedOriginX = pageOriginX + cellDim + cellDim + cellPadding;

  if (false) {
    ctx.strokeStyle = 'red';
    ctx.strokeRect(
      col1PaddedOriginX,
      row1PaddedOriginY,
      cellPaddedDim, cellPaddedDim
    );
    ctx.strokeRect(
      col2PaddedOriginX,
      row1PaddedOriginY,
      cellPaddedDim, cellPaddedDim
    );
    ctx.strokeRect(
      col3PaddedOriginX,
      row1PaddedOriginY,
      cellPaddedDim, cellPaddedDim
    );
    ctx.strokeRect(
      col1PaddedOriginX,
      row2PaddedOriginY,
      cellPaddedDim,
      cellPaddedDim
    );
    ctx.strokeRect(
      col2PaddedOriginX,
      row2PaddedOriginY,
      cellPaddedDim,
      cellPaddedDim
    );
    ctx.strokeRect(
      col3PaddedOriginX,
      row2PaddedOriginY,
      cellPaddedDim,
      cellPaddedDim
    );
  }

  if (opponent) {
    drawFiles(opponent.f, col2PaddedOriginX, row1PaddedOriginY, cellPaddedDim);
    drawSailor(opponent, col3PaddedOriginX, row1PaddedOriginY, cellPaddedDim);
  }

  drawSailor(player, col1PaddedOriginX, row2PaddedOriginY, cellPaddedDim, true);
  drawFiles(player.f, col2PaddedOriginX, row2PaddedOriginY, cellPaddedDim);

  // if (global_current_offer) {
  //   makeButton(50, 50, 100, 50, 'Accept');
  //   makeButton(200, 50, 100, 50, 'Counter');
  // }

  // ctx.font = 'bold 22px cursive';
  // ctx.textAlign = "center";
  // ctx.textBaseline = "middle";
  // ctx.fillStyle = '#000';
  // fe(buttons, b => {
  //   ctx.fillText(b.t, b.x + (b.w / 2), b.y + (b.h / 2), b.w, b.h);
  //   ctx.strokeRect(b.x, b.y, b.w, b.h);
  // });
};


var fi = (a, f) => a.find(f);


// Change red pixels to tone.
// Change green pixels to tone + 40
// Change blue pixels to tone - 40


// c: color [r, g, b]
// d: +/- for tones
// cw: (hidden) canvas width

// dx: draw x (on visible canvas)
// dy: draw y (on visible canvas)
// dw: draw width (on visible canvas)
var drawObject = (g, cw, dx, dy, dw, c, d, mirror) => {
  var offcanvas = document.createElement('canvas');
  var offctx = offcanvas.getContext('2d');

  offcanvas.width = offcanvas.height = cw;

  offctx.lineWidth = 1;

  g(offctx);

  var image = offctx.getImageData(0, 0, cw, cw)

  var buffer = [];

  for (var row = 0; row < cw; row++)
    for (var vcolumn = 0; vcolumn < cw; vcolumn++) {

      var column = mirror ? cw - vcolumn - 1 : vcolumn;

      var pixel = row * (cw * 4) + (column * 4);
      var alphaIndex = pixel + 3;
      if (image.data[alphaIndex] < 128) {
        buffer.push(0);
        buffer.push(0);
        buffer.push(0);
        buffer.push(0);
      } else {

        var z;
        if (image.data[pixel + 0] >= 128)
          z = c;
        else if (image.data[pixel + 1] >= 128)
          z = c.map(t => t + d);
        else
          z = c.map(t => t - d);

        buffer.push(z[0]);
        buffer.push(z[1]);
        buffer.push(z[2]);
        buffer.push(255);
      }
    }

  for (var b = 0; b < buffer.length; b++)
    image.data[b] = buffer[b];



  // Redraw the buffer with the pixellated image.
  offctx.clearRect(0, 0, cw, cw);
  offctx.putImageData(image, 0, 0);


  // Now copy the buffer into the visible canvas in a beautiful, pixelly way.
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(offcanvas, dx, dy, dw, dw);
  ctx.imageSmoothingEnabled = true;
};

var R = '#f00';
var G = '#0f0';
var B = '#00f';

var drawSailor = (s, x, y, w, mirror) => {
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

  var a = s.a, eyesX = 7, eyeWidth = 4, bufferWidth = 31;


  // s.a.hs[0] = behind head
  // s.a.hs[1] = in front of head
  drawObject((offctx) => drawHair(offctx, a.hs[0]),
    bufferWidth, // buffer width
    x, y, w,     // x, y, width to draw on canvas
    a.ht,        // color to paint reds as
    64,          // color deviation for greens and blues
    mirror,      // mirror
  );


  drawObject((offctx) => {
    offctx.strokeStyle = R;
    offctx.fillStyle = G;
    drawRectangle(offctx, 5, 5, 20, 20, a.hr);
  },
    bufferWidth, // buffer width
    x, y, w,     // x, y, width to draw on canvas
    a.s,        // color to paint reds as
    40,          // color deviation for greens and blues
    mirror,      // mirror
  );

  drawObject((offctx) => {
    offctx.fillStyle = R;
    offctx.fillRect(eyesX, a.ey, eyeWidth, a.eh);
    offctx.fillRect(eyesX + eyeWidth + a.eg, a.ey, eyeWidth, a.eh);
    offctx.fillStyle = B;
    offctx.fillRect(eyesX + 1, a.ey + 1, 1, 1);
    offctx.fillRect(eyesX + eyeWidth + a.eg + 1, a.ey + 1, 1, 1);
  },
    bufferWidth, // buffer width
    x, y, w,     // x, y, width to draw on canvas
    [255, 255, 255],        // color to paint reds as
    255,          // color deviation for greens and blues
    mirror,      // mirror
  );

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
  },
    bufferWidth, // buffer width
    x, y, w,     // x, y, width to draw on canvas
    a.s,        // color to paint reds as
    110,          // color deviation for greens and blues
    mirror,      // mirror
  );

  drawObject((offctx) => drawHair(offctx, a.hs[1]),
    bufferWidth, // buffer width
    x, y, w,     // x, y, width to draw on canvas
    a.ht,        // color to paint reds as
    64,          // color deviation for greens and blues
    mirror,      // mirror
  );
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
var SEED_LEFT = new Date().getMinutes(), SEED_RIGHT = new Date().getSeconds();

var nextRandom = (m = 10) => {
  var d = (SEED_LEFT + SEED_RIGHT) / 100, r = f((d - f(d)) * 100);
  SEED_LEFT = SEED_RIGHT;
  SEED_RIGHT = r;
  return r % m;
}

var makePartial = () => [4, 0].reduce((acc, shift) => {
  acc += nextRandom(14) + 1;
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


  if (sailor.f.filter(t => t.b == 0) == sailor.f.length) {
    console.error(`All zeroes?!`);
    return null;
  }


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

window.addEventListener('resize', draw, true);
window.addEventListener('orientationchange', draw, true);


newGame();
