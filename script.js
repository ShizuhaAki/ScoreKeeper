const config = {
  player: [ "BLP", "CZY", "HBH", "SS", "ZXS", "LYW" ],
  groupSize: 3
};

function Player(name) {
  return {
    name, 
    matchHistory: [],
    score: 0
  };
}

const newGame = document.getElementById("newgame");
const result = document.getElementById("result");
let players = [];
let groups = [], groupSchedule = [];
let roundRobinSchedule = [];
let roundRobinMatchCount = 0;
let contestPhase = "normal"; // normal || postseason
let curPlayer1, curPlayer2;
let nRounds = 0;

newGame.addEventListener("click", e => {
  e.preventDefault();
  document.getElementById('result').innerHTML = '';
  players = [];
  groups = [];
  groupSchedule = [];
  roundRobinSchedule = [];
  roundRobinMatchCount = 0;
  contestPhase = "normal"; // normal || postseason
  nRounds = 0;
  const playerName = config.player, groupSize = config.groupSize;
  playerName.sort((a, b) => { return Math.random() > 0.5; });
  console.log(playerName);
  let ne = 'Player List: <br/>';
  for (let i = 0; i < playerName.length; i += groupSize) {
    ne += '&nbsp;['
    const curGroup = [];
    for (let j = i; j < i + groupSize; j++) {
      ne += playerName[j] + (j !== i + groupSize - 1 ? ', ' : '');
      const curPlayer = new Player(playerName[j]);
      curGroup.push(curPlayer);
      players.push(curPlayer);
    }
    groups.push(curGroup);
    ne += '] <br/>';
  }
  console.log(players);
  console.log(groups);
  writeMessage(ne);
  for (const group of groups) {
    groupSchedule.push(generateSingleRoundRobin(group));
  }
  console.log(groupSchedule);
  roundRobinSchedule = getRoundRobinMatches();
  roundRobinMatchCount = roundRobinSchedule.length;
  updatePlayer(curPlayer1 = roundRobinSchedule[0][0], curPlayer2 = roundRobinSchedule[0][1]);
  roundRobinSchedule.pop();
  
});

document.getElementById('clearmsg').addEventListener('click', e => { document.getElementById('result').innerHTML = ''; });

function updateContestPhase() {
  nRounds++;
  if (nRounds == 6) {
    countNormalPhaseScores();
    groups.forEach(group => {
      group.sort((p1, p2) => { return p1.score < p2.score; });
      group.forEach(player => {
        writeMessage(`Score of ${player.name}: ${player.score}`)
      })
    })
    contestPhase === "postseason";
  }
}


function countNormalPhaseScores() {
  function getScore(x, y) {
    if (x > y) return 2;
    else if (x === y) return 1;
    else return x / y;
  }
  groups.forEach(group => {
    group.forEach(player => {
      player.matchHistory.forEach(match => {
        player.score += getScore(...match.score);
      })
    })
  })
}

document.getElementById('submit').addEventListener("click", e => {
  e.preventDefault();
  if (contestPhase === "normal") { 
    try { 
      recordScore(curPlayer1, document.getElementById('player-one-score').value, curPlayer2, 
            document.getElementById('player-two-score').value);
    } catch (ex) { return; }
    console.log(roundRobinSchedule);
    updatePlayer(curPlayer1 = roundRobinSchedule.at(-1)[0], curPlayer2 = roundRobinSchedule.at(-1)[1]);
    roundRobinSchedule.pop();
    updateContestPhase();
  } else {
    alert("WTF");
  }
});

function getRoundRobinMatches() {
  const ret = [];
  let n = config.groupSize * (config.groupSize - 1) / 2;
  for (; n >= 0; n--) {
    groupSchedule.forEach(e => {
      ret.push(e.at(-1));
      e.pop();
    });
  }
  ret.pop(); // I don't know why, seriously
  console.log(ret);
  return ret;
}

function generateSingleRoundRobin(group) {
  let res = [];
  const n = group.length;
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      res.push([group[i], group[j]]);
  return res;
} 

function writeMessage(ne) {
  const neElement = document.createElement('li');
  neElement.innerHTML = ne;
  result.appendChild(neElement);
}

function updatePlayer(player1, player2) {
  document.getElementById('player-one-name').innerHTML = player1.name;
  document.getElementById('player-two-name').innerHTML = player2.name;
}

function recordScore(p1, p1Score, p2, p2Score) {
  if (!p1Score || !p2Score) { 
    alert("请输入比分！"); 
    throw "No Score"; 
  }
  p1.matchHistory.push({
    opponent: p2,
    score: [p1Score, p2Score]
  });
  p2.matchHistory.push({
    opponent: p1,
    score: [p2Score, p1Score]
  });
  writeMessage(`${p1.name} ${p1Score}:${p2Score} ${p2.name}`);
}