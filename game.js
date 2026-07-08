const {
  useState,
  useEffect,
  useCallback,
  useRef
} = React;
const GW = 12,
  GH = 8,
  NEED = 4;
const TRASH = [{
  id: 'cap',
  e: '🪙',
  name: 'Bottle Cap',
  arm: 4,
  atk: 3,
  sp: 'block',
  sn: '🛡 Block',
  sd: 'Absorb next attack completely'
}, {
  id: 'clip',
  e: '📎',
  name: 'Paperclip',
  arm: 1,
  atk: 7,
  sp: 'pierce',
  sn: '⚡ Pierce',
  sd: 'Attack for double damage'
}, {
  id: 'band',
  e: '🔴',
  name: 'Rubber Band',
  arm: 2,
  atk: 4,
  sp: 'stun',
  sn: '💥 Snap!',
  sd: 'Stun boss, they lose next turn'
}, {
  id: 'foil',
  e: '✨',
  name: 'Tin Foil',
  arm: 7,
  atk: 1,
  sp: 'reflect',
  sn: '↩ Reflect',
  sd: "Reflect boss's next attack (75%)"
}, {
  id: 'aid',
  e: '🩹',
  name: 'Band-Aid',
  arm: 2,
  atk: 2,
  sp: 'heal',
  sn: '💚 Heal',
  sd: 'Restore 25 HP and cure poison'
}, {
  id: 'tack',
  e: '📌',
  name: 'Thumbtack',
  arm: 1,
  atk: 9,
  sp: 'bleed',
  sn: '🩸 Bleed',
  sd: 'Boss takes 6 dmg/turn for 3 turns'
}, {
  id: 'btn',
  e: '🔵',
  name: 'Button',
  arm: 5,
  atk: 3,
  sp: 'taunt',
  sn: '😤 Taunt',
  sd: "Boss's next attack halved"
}, {
  id: 'cndy',
  e: '🍬',
  name: 'Candy Wrap',
  arm: 3,
  atk: 3,
  sp: 'confuse',
  sn: '🌀 Confuse',
  sd: 'Boss attacks itself for 15 dmg'
}, {
  id: 'strw',
  e: '🥤',
  name: 'Straw',
  arm: 1,
  atk: 7,
  sp: 'shoot',
  sn: '🎯 Shoot',
  sd: 'Deal 20 fixed piercing damage'
}, {
  id: 'str',
  e: '🧵',
  name: 'String',
  arm: 3,
  atk: 4,
  sp: 'bind',
  sn: '🪢 Bind',
  sd: 'Permanently reduce boss attack by 5'
}];
const BOSSES = [{
  name: 'THE OLD BOOT',
  emoji: '🥾',
  subtitle: 'Level 1 Boss',
  hp: 80,
  enrageHp: null,
  chargeChance: 0,
  heavyDmg: 0,
  moves: [{
    n: '🥾 Stomp',
    d: 13,
    f: 'The boot stamps down!'
  }, {
    n: '👟 Kick',
    d: 10,
    f: 'A heavy kick swings out!'
  }, {
    n: '🦶 Crush',
    d: 15,
    f: 'Full weight bears down!'
  }, {
    n: '🥾 Shuffle',
    d: 9,
    f: 'A clumsy shuffle hits you!'
  }]
}, {
  name: 'THE SPRAYER',
  emoji: '🧪',
  subtitle: 'Level 2 Boss',
  hp: 120,
  enrageHp: null,
  chargeChance: 0,
  heavyDmg: 0,
  moves: [{
    n: '💨 Blast',
    d: 16,
    f: 'Chemicals blast everywhere!'
  }, {
    n: '🌿 Fumigate',
    d: 10,
    f: 'Toxic fumes seep in!',
    poison: 3,
    poisonDmg: 4
  }, {
    n: '💧 Pressure Wash',
    d: 20,
    f: 'High-pressure stream hits hard!'
  }, {
    n: '😶‍🌫️ Toxic Mist',
    d: 13,
    f: 'A fine toxic mist settles!',
    poison: 2,
    poisonDmg: 3
  }]
}, {
  name: 'THE EXTERMINATOR',
  emoji: '🚐',
  subtitle: 'Final Boss',
  hp: 140,
  enrageHp: 70,
  chargeChance: 0.22,
  heavyDmg: 30,
  moves: [{
    n: '🚐 Ram',
    d: 20,
    f: 'The van slams into you!'
  }, {
    n: '☠️ Toxic Dump',
    d: 14,
    f: 'Chemicals pour out!',
    poison: 3,
    poisonDmg: 5
  }, {
    n: '🔊 Siren',
    d: 8,
    f: 'Deafening siren stuns you!',
    stunPlayer: 1
  }, {
    n: '💨 Mega Spray',
    d: 23,
    f: 'Full-power pesticide blast!'
  }]
}];
const LEVEL_CFG = [{
  timer: 40,
  spiderCount: 1
}, {
  timer: 35,
  spiderCount: 1
}, {
  timer: 30,
  spiderCount: 2
}];
const R = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const SHUF = a => [...a].sort(() => Math.random() - .5);
const START = {
  x: 6,
  y: 4
};
function makeWalls() {
  const w = new Set();
  const avoid = new Set([`${START.x},${START.y}`, '0,0', `${GW - 1},0`, `0,${GH - 1}`, `${GW - 1},${GH - 1}`]);
  while (w.size < 7) {
    const x = R(1, GW - 2),
      y = R(1, GH - 2),
      k = `${x},${y}`;
    if (!avoid.has(k)) {
      w.add(k);
      avoid.add(k);
    }
  }
  return w;
}
function makeMapItems(walls) {
  const items = SHUF(TRASH).slice(0, 6);
  const avoid = new Set([`${START.x},${START.y}`, '0,0', ...walls]);
  return items.map(t => {
    let x, y;
    do {
      x = R(0, GW - 1);
      y = R(0, GH - 1);
    } while (avoid.has(`${x},${y}`));
    avoid.add(`${x},${y}`);
    return {
      ...t,
      uid: `${t.id}${x}${y}`,
      x,
      y
    };
  });
}
function makeSpiders(count) {
  return [{
    x: 0,
    y: 0
  }, {
    x: GW - 1,
    y: GH - 1
  }, {
    x: GW - 1,
    y: 0
  }].slice(0, count);
}
function stepToward(from, to, walls) {
  const dx = to.x - from.x,
    dy = to.y - from.y;
  const cands = Math.abs(dx) >= Math.abs(dy) ? [{
    x: from.x + Math.sign(dx),
    y: from.y
  }, {
    x: from.x,
    y: from.y + Math.sign(dy)
  }] : [{
    x: from.x,
    y: from.y + Math.sign(dy)
  }, {
    x: from.x + Math.sign(dx),
    y: from.y
  }];
  for (const c of cands) if (c.x >= 0 && c.x < GW && c.y >= 0 && c.y < GH && !walls.has(`${c.x},${c.y}`)) return c;
  return from;
}
function findEmpty(walls, items, excl) {
  const taken = new Set([...walls, ...excl.map(p => `${p.x},${p.y}`), ...items.map(i => `${i.x},${i.y}`)]);
  for (let t = 0; t < 300; t++) {
    const x = R(0, GW - 1),
      y = R(0, GH - 1);
    if (!taken.has(`${x},${y}`)) return {
      x,
      y
    };
  }
  return {
    x: R(0, GW - 1),
    y: R(0, GH - 1)
  };
}
function gDeco(x, y) {
  const v = (x * 17 + y * 13 + x * y) % 16;
  return v < 2 ? '·' : v < 4 ? '˙' : '';
}
function makeFightState(nc, boss) {
  return {
    playerHp: 100,
    bossHp: boss.hp,
    atkMod: 0,
    boss,
    bossEnraged: false,
    bossCharging: false,
    playerPoisoned: 0,
    playerPoisonDmg: 0,
    playerStunned: 0,
    specials: nc.map(t => ({
      ...t,
      used: false
    })),
    log: [`⚔️ ${boss.name} appears!`, '🪲 You stand armored and ready!'],
    turn: 'player',
    fx: {
      block: false,
      reflect: false,
      stun: false,
      taunt: false,
      defend: false,
      bleed: 0
    }
  };
}
const col = {
  bg: '#0d0805',
  border: '#3a2010',
  text: '#c8b090',
  dim: '#7a5830',
  faint: '#3a2818',
  accent: '#ffb347',
  green: '#70c840',
  red: '#d03020',
  yellow: '#e8a020'
};
const etag = {
  display: 'inline-block',
  background: '#0a180a',
  border: '1px solid #3a6010',
  borderRadius: 3,
  padding: '2px 7px',
  fontSize: '0.65rem',
  color: '#90d050'
};
const rtag = {
  display: 'inline-block',
  background: '#1a0808',
  border: '1px solid #6a1010',
  borderRadius: 3,
  padding: '2px 7px',
  fontSize: '0.65rem',
  color: '#ff7070'
};
function HPBar({
  pct,
  color
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#1a0808',
      borderRadius: 3,
      overflow: 'hidden',
      height: 8,
      border: '1px solid #2a1010'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: `${Math.max(0, Math.min(1, pct)) * 100}%`,
      background: color,
      transition: 'width 0.35s ease',
      borderRadius: 3
    }
  }));
}
function App() {
  const [level, setLevel] = useState(1);
  const [phase, setPhase] = useState('collect'); // collect|fight|levelComplete|defeat
  const [bugPos, setBugPos] = useState(START);
  const [walls, setWalls] = useState(makeWalls);
  const [mapItems, setMapItems] = useState(() => makeMapItems(walls));
  const [spiders, setSpiders] = useState(() => makeSpiders(LEVEL_CFG[0].spiderCount));
  const [collected, setCollected] = useState([]);
  const [timer, setTimer] = useState(LEVEL_CFG[0].timer);
  const [flash, setFlash] = useState('');
  const [fight, setFight] = useState(null);
  const [hoverSp, setHoverSp] = useState(null);
  const [vw, setVw] = useState(window.innerWidth);
  const [shake, setShake] = useState({
    who: null,
    k: 0
  });
  const touchRef = useRef(null);
  const totalArm = collected.reduce((s, t) => s + t.arm, 0);
  const totalAtk = collected.reduce((s, t) => s + t.atk, 0);
  const sr = useRef({});
  sr.current = {
    mapItems,
    collected,
    phase,
    spiders,
    walls,
    bugPos
  };
  const showFlash = msg => {
    setFlash(msg);
    setTimeout(() => setFlash(''), 1400);
  };

  // Keep grid sized correctly on rotate / resize
  useEffect(() => {
    const h = () => setVw(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  // Timer tick
  useEffect(() => {
    if (phase !== 'collect' || timer <= 0) return;
    const id = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, timer]);

  // Timer expired → fight with what you have
  useEffect(() => {
    if (phase !== 'collect' || timer !== 0) return;
    const cur = sr.current.collected;
    const fw = cur.length > 0 ? cur : [{
      ...TRASH[R(0, TRASH.length - 1)],
      uid: 'mercy'
    }];
    if (cur.length === 0) setCollected(fw);
    setFight(makeFightState(fw, BOSSES[level - 1]));
    setPhase('fight');
  }, [timer, phase]);
  const moveBug = useCallback((dx, dy) => {
    const {
      phase,
      bugPos: prev,
      walls,
      mapItems,
      collected,
      spiders
    } = sr.current;
    if (phase !== 'collect') return;
    const nx = Math.max(0, Math.min(GW - 1, prev.x + dx));
    const ny = Math.max(0, Math.min(GH - 1, prev.y + dy));
    if (walls.has(`${nx},${ny}`)) return;
    const newPos = {
      x: nx,
      y: ny
    };
    setBugPos(newPos);
    const hit = mapItems.find(i => i.x === nx && i.y === ny);
    let curColl = collected,
      curMap = mapItems;
    if (hit) {
      curMap = mapItems.filter(i => i.uid !== hit.uid);
      curColl = [...collected, hit];
      setMapItems(curMap);
      setCollected(curColl);
      if (curColl.length >= NEED) {
        setTimeout(() => {
          setFight(makeFightState(curColl, BOSSES[sr.current.level - 1]));
          setPhase('fight');
        }, 100);
        return;
      }
    }
    const newSpiders = spiders.map(s => stepToward(s, newPos, walls));
    const caught = newSpiders.findIndex(s => s.x === newPos.x && s.y === newPos.y);
    if (caught >= 0) {
      if (curColl.length > 0) {
        const dropped = curColl[curColl.length - 1];
        const pos = findEmpty(walls, curMap, [newPos]);
        setCollected(curColl.slice(0, -1));
        setMapItems([...curMap, {
          ...dropped,
          uid: `r${Date.now()}`,
          x: pos.x,
          y: pos.y
        }]);
        showFlash(`🕷️ Stolen! Lost ${dropped.e} ${dropped.name}!`);
      } else {
        showFlash('🕷️ Caught! (nothing to steal)');
      }
      const reset = newPos.x < GW / 2 ? {
        x: GW - 1,
        y: GH - 1
      } : {
        x: 0,
        y: 0
      };
      setSpiders(newSpiders.map((s, i) => i === caught ? reset : s));
    } else {
      setSpiders(newSpiders);
    }
  }, []);

  // Store level in ref so moveBug can access it
  sr.current.level = level;
  useEffect(() => {
    const h = e => {
      const M = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        w: [0, -1],
        s: [0, 1],
        a: [-1, 0],
        d: [1, 0]
      };
      const v = M[e.key] || M[e.key.toLowerCase()];
      if (!v) return;
      if (e.key.startsWith('Arrow')) e.preventDefault();
      moveBug(v[0], v[1]);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [moveBug]);

  // Swipe controls for the collect grid
  const onGridTouchStart = e => {
    const t = e.touches[0];
    touchRef.current = {
      x: t.clientX,
      y: t.clientY
    };
  };
  const onGridTouchEnd = e => {
    const s = touchRef.current;
    if (!s) return;
    touchRef.current = null;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x,
      dy = t.clientY - s.y;
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) moveBug(Math.sign(dx), 0);else moveBug(0, Math.sign(dy));
  };

  // ===== FIGHT LOGIC =====

  function checkEnrage(nf, msgs) {
    const boss = nf.boss;
    if (boss.enrageHp && !nf.bossEnraged && nf.bossHp <= boss.enrageHp && nf.bossHp > 0) {
      nf.bossEnraged = true;
      msgs.push(`🔥 ${boss.name} ENRAGES! All attacks supercharged!`);
    }
  }
  function applyHit(nf, msgs, dmg, arm) {
    if (nf.fx.reflect) {
      const ref = Math.floor(dmg * 0.75);
      nf.bossHp = Math.max(0, nf.bossHp - ref);
      msgs.push(`↩ Reflected! Boss takes ${ref} dmg!`);
      nf.fx = {
        ...nf.fx,
        reflect: false
      };
      setShake({
        who: 'boss',
        k: Date.now()
      });
      return 'reflected';
    } else if (nf.fx.block) {
      msgs.push('🛡 Block absorbs the attack!');
      nf.fx = {
        ...nf.fx,
        block: false
      };
      return 'blocked';
    } else {
      const ab = Math.floor(arm / 2);
      let fd = Math.max(1, dmg - ab);
      if (nf.fx.defend) {
        fd = Math.floor(fd / 2);
        nf.playerHp = Math.max(0, nf.playerHp - fd);
        msgs.push(`🛡 Defended! Only ${fd} dmg, status effects blocked!`);
        nf.fx = {
          ...nf.fx,
          defend: false
        };
        setShake({
          who: 'player',
          k: Date.now()
        });
        return 'defended';
      }
      msgs.push(`💥 You take ${fd} dmg (${dmg}−${ab} armor)`);
      nf.playerHp = Math.max(0, nf.playerHp - fd);
      setShake({
        who: 'player',
        k: Date.now()
      });
      return 'hit';
    }
  }

  // Runs at the end of every boss turn: enrage check, poison tick,
  // stun handling, then hands the turn back to the player.
  function endBossTurn(nf, msgs, arm) {
    checkEnrage(nf, msgs);
    if (nf.playerPoisoned > 0) {
      const dmg = nf.playerPoisonDmg || 4;
      nf.playerHp = Math.max(0, nf.playerHp - dmg);
      nf.playerPoisoned = nf.playerPoisoned - 1;
      msgs.push(`☠️ Poison ticks! −${dmg} HP (${nf.playerPoisoned} turn${nf.playerPoisoned === 1 ? '' : 's'} left)`);
      setShake({
        who: 'player',
        k: Date.now()
      });
      if (nf.playerHp <= 0) {
        nf.log = [...msgs, ...nf.log].slice(0, 12);
        setFight(nf);
        setTimeout(() => setPhase('defeat'), 300);
        return;
      }
    }
    if (nf.playerStunned > 0) {
      nf.playerStunned = nf.playerStunned - 1;
      msgs.push('🔊 You are stunned! Your turn is skipped!');
      nf.turn = 'boss';
      nf.log = [...msgs, ...nf.log].slice(0, 12);
      setFight({
        ...nf
      });
      setTimeout(() => execBossTurn(nf, arm), 900);
      return;
    }
    nf.turn = 'player';
    nf.log = [...msgs, ...nf.log].slice(0, 12);
    setFight(nf);
  }
  function execBossTurn(f, arm) {
    let nf = {
      ...f,
      fx: {
        ...f.fx
      }
    };
    const msgs = [];
    const boss = nf.boss;

    // Bleed tick
    if (nf.fx.bleed > 0) {
      nf.bossHp = Math.max(0, nf.bossHp - 6);
      msgs.push(`🩸 Bleed! Boss −6 HP (${nf.fx.bleed - 1} left)`);
      nf.fx = {
        ...nf.fx,
        bleed: nf.fx.bleed - 1
      };
      if (nf.bossHp <= 0) {
        checkEnrage(nf, msgs);
        nf.log = [...msgs, ...nf.log].slice(0, 12);
        setFight(nf);
        setTimeout(() => setPhase('levelComplete'), 300);
        return;
      }
    }

    // Boss stun
    if (nf.fx.stun) {
      msgs.push('💫 Boss is stunned! Loses their turn!');
      nf.fx = {
        ...nf.fx,
        stun: false
      };
      endBossTurn(nf, msgs, arm);
      return;
    }

    // Charging → fire heavy attack
    if (nf.bossCharging) {
      let dmg = Math.max(1, boss.heavyDmg - nf.atkMod + R(-3, 4));
      if (nf.bossEnraged) dmg = Math.floor(dmg * 1.25);
      msgs.push(`⚡ CHARGED SLAM!${nf.bossEnraged ? ' (ENRAGED)' : ''} ${dmg} base damage!`);
      if (nf.fx.taunt) {
        dmg = Math.floor(dmg / 2);
        msgs.push(`😤 Taunt cuts to ${dmg}`);
        nf.fx = {
          ...nf.fx,
          taunt: false
        };
      }
      const res = applyHit(nf, msgs, dmg, arm);
      nf.bossCharging = false;
      if (res === 'reflected' && nf.bossHp <= 0) {
        nf.log = [...msgs, ...nf.log].slice(0, 12);
        setFight(nf);
        setTimeout(() => setPhase('levelComplete'), 300);
        return;
      }
      if (nf.playerHp <= 0) {
        nf.log = [...msgs, ...nf.log].slice(0, 12);
        setFight(nf);
        setTimeout(() => setPhase('defeat'), 300);
        return;
      }
    } else if (boss.chargeChance > 0 && Math.random() < boss.chargeChance) {
      // Start charging
      nf.bossCharging = true;
      msgs.push(`⚡ ${boss.name} is CHARGING UP a devastating attack!`);
      const chip = Math.max(0, 5 - Math.floor(arm / 4));
      if (chip > 0) {
        nf.playerHp = Math.max(0, nf.playerHp - chip);
        msgs.push(`...deals ${chip} chip damage while charging`);
      }
      if (nf.playerHp <= 0) {
        nf.log = [...msgs, ...nf.log].slice(0, 12);
        setFight(nf);
        setTimeout(() => setPhase('defeat'), 300);
        return;
      }
    } else {
      // Normal attack
      const move = boss.moves[R(0, boss.moves.length - 1)];
      let dmg = Math.max(1, move.d - nf.atkMod + R(-2, 3));
      if (nf.bossEnraged) dmg = Math.floor(dmg * 1.2);
      msgs.push(`${move.n} — ${move.f}${nf.bossEnraged ? ' 🔥' : ''}`);
      if (nf.fx.taunt) {
        dmg = Math.floor(dmg / 2);
        msgs.push(`😤 Taunt reduces to ${dmg} dmg`);
        nf.fx = {
          ...nf.fx,
          taunt: false
        };
      }
      const res = applyHit(nf, msgs, dmg, arm);
      if (res === 'reflected' && nf.bossHp <= 0) {
        checkEnrage(nf, msgs);
        nf.log = [...msgs, ...nf.log].slice(0, 12);
        setFight(nf);
        setTimeout(() => setPhase('levelComplete'), 300);
        return;
      }
      if (res === 'hit' && nf.playerHp > 0 && move.poison) {
        nf.playerPoisoned = move.poison;
        nf.playerPoisonDmg = move.poisonDmg;
        msgs.push(`☠️ POISONED! ${move.poisonDmg} dmg/turn for ${move.poison} turns!`);
      }
      if (res === 'hit' && nf.playerHp > 0 && move.stunPlayer) {
        nf.playerStunned = move.stunPlayer;
        msgs.push(`🔊 You are STUNNED for ${move.stunPlayer} turn(s)!`);
      }
      if (nf.playerHp <= 0) {
        nf.log = [...msgs, ...nf.log].slice(0, 12);
        setFight(nf);
        setTimeout(() => setPhase('defeat'), 300);
        return;
      }
    }
    endBossTurn(nf, msgs, arm);
  }
  function afterPlayerAct(nf, arm) {
    checkEnrage(nf, []);
    if (nf.bossHp <= 0) {
      setFight(nf);
      setTimeout(() => setPhase('levelComplete'), 300);
      return;
    }
    nf.turn = 'boss';
    setFight(nf);
    setTimeout(() => execBossTurn(nf, arm), 700);
  }
  const doAttack = () => {
    if (!fight || fight.turn !== 'player') return;
    const d = Math.max(1, totalAtk + R(0, 4) - 2);
    setShake({
      who: 'boss',
      k: Date.now()
    });
    const nf = {
      ...fight,
      bossHp: Math.max(0, fight.bossHp - d),
      log: [`🪲 You strike for ${d} damage!`, ...fight.log].slice(0, 12)
    };
    afterPlayerAct(nf, totalArm);
  };
  const doDefend = () => {
    if (!fight || fight.turn !== 'player') return;
    const nf = {
      ...fight,
      fx: {
        ...fight.fx,
        defend: true
      },
      log: ['🛡 You brace! Next hit halved, poison/stun blocked!', ...fight.log].slice(0, 12)
    };
    afterPlayerAct(nf, totalArm);
  };
  const doSpecial = idx => {
    if (!fight || fight.turn !== 'player') return;
    const sp = fight.specials[idx];
    if (!sp || sp.used) return;
    let nf = {
      ...fight,
      fx: {
        ...fight.fx
      },
      specials: fight.specials.map((s, i) => i === idx ? {
        ...s,
        used: true
      } : s)
    };
    const msgs = [];
    switch (sp.sp) {
      case 'block':
        nf.fx = {
          ...nf.fx,
          block: true
        };
        msgs.push('🛡 Block active! Next attack absorbed!');
        break;
      case 'pierce':
        {
          const d = totalAtk * 2;
          nf.bossHp = Math.max(0, nf.bossHp - d);
          msgs.push(`⚡ Pierce! ${d} damage, ignores armor!`);
          setShake({
            who: 'boss',
            k: Date.now()
          });
        }
        break;
      case 'stun':
        nf.fx = {
          ...nf.fx,
          stun: true
        };
        msgs.push('💫 Boss is stunned and loses next turn!');
        break;
      case 'reflect':
        nf.fx = {
          ...nf.fx,
          reflect: true
        };
        msgs.push('↩ Reflect ready! Next attack bounces back!');
        break;
      case 'heal':
        nf.playerHp = Math.min(100, nf.playerHp + 25);
        nf.playerPoisoned = 0;
        msgs.push(`💚 Healed! +25 HP & poison cured → ${nf.playerHp} HP`);
        break;
      case 'bleed':
        nf.fx = {
          ...nf.fx,
          bleed: 3
        };
        msgs.push('🩸 Bleed inflicted! 6 dmg × 3 turns!');
        break;
      case 'taunt':
        nf.fx = {
          ...nf.fx,
          taunt: true
        };
        msgs.push("😤 Boss's next attack is halved!");
        break;
      case 'confuse':
        nf.bossHp = Math.max(0, nf.bossHp - 15);
        msgs.push('🌀 Boss attacks itself for 15 damage!');
        setShake({
          who: 'boss',
          k: Date.now()
        });
        break;
      case 'shoot':
        nf.bossHp = Math.max(0, nf.bossHp - 20);
        msgs.push('🎯 Shoot! 20 piercing damage!');
        setShake({
          who: 'boss',
          k: Date.now()
        });
        break;
      case 'bind':
        nf.atkMod = (nf.atkMod || 0) + 5;
        msgs.push('🪢 Boss ATK permanently −5!');
        break;
    }
    nf.log = [`✨ ${sp.sn}!`, ...msgs, ...nf.log].slice(0, 12);
    setHoverSp(null);
    afterPlayerAct(nf, totalArm);
  };
  const startNextLevel = () => {
    const nextLvl = level + 1;
    const cfg = LEVEL_CFG[nextLvl - 1];
    const newWalls = makeWalls();
    setLevel(nextLvl);
    setWalls(newWalls);
    setMapItems(makeMapItems(newWalls));
    setSpiders(makeSpiders(cfg.spiderCount));
    setBugPos(START);
    setCollected([]);
    setTimer(cfg.timer);
    setFlash('');
    setFight(null);
    setHoverSp(null);
    setShake({
      who: null,
      k: 0
    });
    setPhase('collect');
  };
  const restart = () => {
    const newWalls = makeWalls();
    setLevel(1);
    setWalls(newWalls);
    setMapItems(makeMapItems(newWalls));
    setSpiders(makeSpiders(LEVEL_CFG[0].spiderCount));
    setBugPos(START);
    setCollected([]);
    setTimer(LEVEL_CFG[0].timer);
    setFlash('');
    setFight(null);
    setHoverSp(null);
    setShake({
      who: null,
      k: 0
    });
    setPhase('collect');
  };
  const cpx = Math.min(44, Math.floor(Math.min(vw * 0.96, 560) / GW));
  const canAct = fight?.turn === 'player';
  const cfg = LEVEL_CFG[level - 1];
  const boss = BOSSES[level - 1];

  // ===== RENDER =====
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: col.bg,
      minHeight: '100vh',
      color: col.text,
      fontFamily: "'Courier New',monospace",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '10px 8px',
      boxSizing: 'border-box',
      userSelect: 'none'
    }
  }, phase === 'collect' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      marginBottom: 2
    }
  }, [1, 2, 3].map(n => /*#__PURE__*/React.createElement("div", {
    key: n,
    style: {
      fontSize: '0.65rem',
      padding: '2px 8px',
      borderRadius: 3,
      background: n === level ? '#2a1808' : n < level ? '#1a2808' : '#130d08',
      border: `1px solid ${n === level ? col.accent : n < level ? col.green : col.border}`,
      color: n === level ? col.accent : n < level ? col.green : col.dim
    }
  }, n < level ? '✓' : '', " LVL ", n))), /*#__PURE__*/React.createElement("h1", {
    style: {
      color: col.accent,
      fontSize: 'clamp(1rem,4vw,1.4rem)',
      fontWeight: 'bold',
      margin: '0 0 2px',
      textShadow: '0 0 12px #e08800',
      letterSpacing: 3
    }
  }, "🪲 TRASH ARMOUR"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: col.dim,
      fontSize: '0.68rem',
      margin: '0 0 6px'
    }
  }, "Collect ", NEED, " items · Fight ", boss.emoji, " ", boss.name, level === 3 ? ' — FINAL LEVEL!' : ''), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: cpx * GW + 4,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.65rem',
      color: col.dim
    }
  }, "⏱ TIME LEFT"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.9rem',
      fontWeight: 'bold',
      color: timer <= 10 ? col.red : timer <= 20 ? col.yellow : col.accent,
      textShadow: timer <= 10 ? `0 0 8px ${col.red}` : 'none'
    }
  }, timer, "s")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#1a0808',
      borderRadius: 3,
      overflow: 'hidden',
      height: 6,
      border: '1px solid #2a1010'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: `${timer / cfg.timer * 100}%`,
      background: timer <= 10 ? col.red : timer <= 20 ? col.yellow : col.green,
      transition: 'width 1s linear',
      borderRadius: 3
    }
  }))), flash && /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#3a0808',
      border: '1px solid #aa2020',
      borderRadius: 4,
      padding: '4px 12px',
      fontSize: '0.8rem',
      color: '#ff8080',
      marginBottom: 6,
      fontWeight: 'bold'
    }
  }, flash), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginBottom: 4,
      alignItems: 'center'
    }
  }, Array.from({
    length: NEED
  }).map((_, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      width: 38,
      height: 38,
      borderRadius: 5,
      background: collected[i] ? '#182008' : '#130d08',
      border: `2px solid ${collected[i] ? '#5a8020' : '#2a1808'}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.4rem',
      transition: 'all 0.15s',
      boxShadow: collected[i] ? '0 0 6px #3a6010' : 'none'
    }
  }, collected[i] ? collected[i].e : /*#__PURE__*/React.createElement("span", {
    style: {
      color: col.faint,
      fontSize: '0.8rem'
    }
  }, "?"))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.65rem',
      color: col.dim,
      marginLeft: 4
    }
  }, collected.length, "/", NEED)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      fontSize: '0.6rem',
      color: col.dim,
      marginBottom: 6,
      flexWrap: 'wrap',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", null, "🪲 You"), /*#__PURE__*/React.createElement("span", null, "🕷️ Spider×", cfg.spiderCount, " (avoid!)"), /*#__PURE__*/React.createElement("span", null, "🪨 Wall"), /*#__PURE__*/React.createElement("span", null, "Swipe grid or use keys/buttons")), /*#__PURE__*/React.createElement("div", {
    onTouchStart: onGridTouchStart,
    onTouchEnd: onGridTouchEnd,
    style: {
      display: 'grid',
      gridTemplateColumns: `repeat(${GW},${cpx}px)`,
      gridTemplateRows: `repeat(${GH},${cpx}px)`,
      gap: 1,
      background: '#2a1808',
      border: '2px solid #3a2010',
      borderRadius: 4,
      overflow: 'hidden',
      touchAction: 'none'
    }
  }, Array.from({
    length: GH
  }).flatMap((_, y) => Array.from({
    length: GW
  }).map((_, x) => {
    const isB = bugPos.x === x && bugPos.y === y;
    const isSp = spiders.some(s => s.x === x && s.y === y);
    const isW = walls.has(`${x},${y}`);
    const tr = mapItems.find(i => i.x === x && i.y === y);
    let bg = '#0e0a04';
    if (isW) bg = '#2a1a0a';
    if (tr) bg = '#1c1a06';
    if (isSp) bg = '#200a0a';
    if (isB) bg = '#0a2208';
    return /*#__PURE__*/React.createElement("div", {
      key: `${x},${y}`,
      style: {
        width: cpx,
        height: cpx,
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: cpx > 32 ? '1.1rem' : '0.85rem'
      }
    }, isB ? '🪲' : isSp ? '🕷️' : isW ? '🪨' : tr ? tr.e : /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.5rem',
        color: col.faint,
        opacity: 0.35
      }
    }, gDeco(x, y)));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateAreas: `". u ." "l . r" ". d ."`,
      gridTemplateColumns: '38px 38px 38px',
      gap: 4,
      marginTop: 8
    }
  }, [['u', 0, -1, '▲'], ['l', -1, 0, '◄'], ['r', 1, 0, '►'], ['d', 0, 1, '▼']].map(([a, dx, dy, lbl]) => /*#__PURE__*/React.createElement("button", {
    key: a,
    onClick: () => moveBug(dx, dy),
    style: {
      gridArea: a,
      background: '#2a1808',
      border: '1px solid #5a3010',
      color: col.accent,
      borderRadius: 4,
      cursor: 'pointer',
      fontFamily: 'inherit',
      padding: '7px',
      fontSize: '1rem'
    }
  }, lbl))), collected.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      display: 'flex',
      flexWrap: 'wrap',
      gap: 4,
      justifyContent: 'center',
      maxWidth: 520
    }
  }, collected.map(t => /*#__PURE__*/React.createElement("div", {
    key: t.uid,
    style: {
      background: '#130d08',
      border: '1px solid #3a2010',
      borderRadius: 4,
      padding: '3px 8px',
      fontSize: '0.7rem'
    }
  }, t.e, " ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: col.text
    }
  }, t.name), /*#__PURE__*/React.createElement("span", {
    style: {
      color: col.green,
      marginLeft: 4
    }
  }, "🛡", t.arm), /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#e07030',
      marginLeft: 4
    }
  }, "⚔️", t.atk), /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#80a0e0',
      marginLeft: 4
    }
  }, t.sn))))), phase === 'fight' && fight && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center',
      marginBottom: 4
    }
  }, [1, 2, 3].map(n => /*#__PURE__*/React.createElement("div", {
    key: n,
    style: {
      fontSize: '0.62rem',
      padding: '2px 7px',
      borderRadius: 3,
      background: n === level ? '#2a1808' : n < level ? '#1a2808' : '#130d08',
      border: `1px solid ${n === level ? col.accent : n < level ? col.green : col.border}`,
      color: n === level ? col.accent : n < level ? col.green : col.dim
    }
  }, n < level ? '✓' : '', "LVL", n))), /*#__PURE__*/React.createElement("h1", {
    style: {
      color: col.accent,
      fontSize: 'clamp(0.9rem,3.5vw,1.3rem)',
      fontWeight: 'bold',
      margin: '0 0 6px',
      textShadow: '0 0 10px #e08800',
      letterSpacing: 2
    }
  }, "⚔️ ", fight.boss.subtitle.toUpperCase()), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      width: '100%',
      maxWidth: 500,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    key: 'p' + (shake.who === 'player' ? shake.k : 0),
    className: shake.who === 'player' ? 'shake' : '',
    style: {
      flex: 1,
      background: '#130d08',
      border: '1px solid #3a2010',
      borderRadius: 8,
      padding: '8px 6px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.6rem',
      color: col.dim,
      letterSpacing: 1
    }
  }, "YOU"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '2.8rem',
      lineHeight: 1.2,
      margin: '4px 0',
      filter: fight.playerHp < 30 ? 'drop-shadow(0 0 5px #ff4444)' : fight.playerStunned > 0 ? 'grayscale(0.8)' : 'none'
    }
  }, "🪲"), /*#__PURE__*/React.createElement(HPBar, {
    pct: fight.playerHp / 100,
    color: fight.playerHp > 50 ? col.green : fight.playerHp > 25 ? col.yellow : col.red
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.65rem',
      color: col.dim,
      marginTop: 2
    }
  }, fight.playerHp, "/100 HP"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.78rem',
      color: '#e8c080',
      fontWeight: 'bold',
      marginTop: 3
    }
  }, "🛡", totalArm, " · ⚔️", totalAtk)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      color: '#cc3020',
      fontWeight: 'bold',
      fontSize: '0.9rem',
      flexShrink: 0
    }
  }, "VS"), /*#__PURE__*/React.createElement("div", {
    key: 'b' + (shake.who === 'boss' ? shake.k : 0),
    className: shake.who === 'boss' ? 'shake' : '',
    style: {
      flex: 1,
      background: '#150808',
      border: `1px solid ${fight.bossEnraged ? '#aa2010' : '#5a1010'}`,
      borderRadius: 8,
      padding: '8px 6px',
      textAlign: 'center',
      transition: 'border-color 0.3s'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.58rem',
      color: fight.bossEnraged ? '#ff6040' : '#8a3020',
      letterSpacing: 1,
      fontWeight: fight.bossEnraged ? 'bold' : 'normal'
    }
  }, fight.bossEnraged ? '🔥 ENRAGED — ' : '', fight.boss.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '2.8rem',
      lineHeight: 1.2,
      margin: '4px 0',
      filter: fight.fx.stun ? 'grayscale(1) drop-shadow(0 0 5px #8888ff)' : fight.bossEnraged ? 'drop-shadow(0 0 6px #ff4400) saturate(1.5)' : 'none'
    }
  }, fight.boss.emoji), /*#__PURE__*/React.createElement(HPBar, {
    pct: fight.bossHp / fight.boss.hp,
    color: fight.bossHp > fight.boss.hp / 2 ? '#d04020' : fight.bossHp > fight.boss.hp / 4 ? col.yellow : col.green
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.65rem',
      color: '#7a4030',
      marginTop: 2
    }
  }, fight.bossHp, "/", fight.boss.hp, " HP"), fight.atkMod > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.58rem',
      color: col.green,
      marginTop: 1
    }
  }, "ATK −", fight.atkMod), fight.bossCharging && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.6rem',
      color: '#ffcc00',
      marginTop: 1,
      fontWeight: 'bold'
    }
  }, "⚡ CHARGING..."))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 4,
      justifyContent: 'center',
      marginBottom: 6
    }
  }, fight.fx.block && /*#__PURE__*/React.createElement("span", {
    style: etag
  }, "🛡 Blocking"), fight.fx.reflect && /*#__PURE__*/React.createElement("span", {
    style: etag
  }, "↩ Reflecting"), fight.fx.stun && /*#__PURE__*/React.createElement("span", {
    style: etag
  }, "💫 Boss Stunned"), fight.fx.taunt && /*#__PURE__*/React.createElement("span", {
    style: etag
  }, "😤 Boss Taunted"), fight.fx.bleed > 0 && /*#__PURE__*/React.createElement("span", {
    style: etag
  }, "🩸 Bleed ×", fight.fx.bleed), fight.playerPoisoned > 0 && /*#__PURE__*/React.createElement("span", {
    style: rtag
  }, "☠️ Poison ×", fight.playerPoisoned), fight.playerStunned > 0 && /*#__PURE__*/React.createElement("span", {
    style: rtag
  }, "🔊 Stunned!")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#080604',
      border: '1px solid #2a1608',
      borderRadius: 4,
      padding: '6px 8px',
      width: '100%',
      maxWidth: 500,
      boxSizing: 'border-box',
      maxHeight: 95,
      overflowY: 'auto',
      marginBottom: 6
    }
  }, fight.log.map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      fontSize: '0.7rem',
      lineHeight: 1.75,
      color: `rgba(200,175,130,${Math.max(0.12, 1 - i * 0.09)})`
    }
  }, m))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.7rem',
      marginBottom: 6,
      fontStyle: 'italic',
      color: canAct ? col.green : col.dim
    }
  }, fight.turn === 'player' ? '▶ YOUR TURN' : '⏳ Boss is responding...'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      width: '100%',
      maxWidth: 500,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    disabled: !canAct,
    onClick: doAttack,
    style: {
      flex: 2,
      padding: '8px 6px',
      fontSize: '0.82rem',
      background: canAct ? '#1a2808' : '#100d08',
      border: `1px solid ${canAct ? '#4a7010' : '#2a2010'}`,
      color: canAct ? '#a0e050' : '#3a4028',
      borderRadius: 4,
      cursor: canAct ? 'pointer' : 'default',
      fontFamily: 'inherit'
    }
  }, "⚔️ Attack (", totalAtk, " ATK)"), /*#__PURE__*/React.createElement("button", {
    disabled: !canAct,
    onClick: doDefend,
    style: {
      flex: 1,
      padding: '8px 6px',
      fontSize: '0.82rem',
      background: canAct ? '#181808' : '#100d08',
      border: `1px solid ${canAct ? '#4a4010' : '#2a2010'}`,
      color: canAct ? '#c0a040' : '#3a3820',
      borderRadius: 4,
      cursor: canAct ? 'pointer' : 'default',
      fontFamily: 'inherit'
    }
  }, "🛡 Defend (½ dmg · blocks status)")), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: 500
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.62rem',
      color: col.dim,
      marginBottom: 4,
      letterSpacing: 1
    }
  }, "SPECIALS (one use · tap once to preview, again to use):"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 4
    }
  }, fight.specials.map((sp, i) => /*#__PURE__*/React.createElement("button", {
    key: sp.uid,
    disabled: !canAct || sp.used,
    onMouseEnter: () => setHoverSp(i),
    onMouseLeave: () => setHoverSp(null),
    onClick: () => {
      if (hoverSp === i) {
        doSpecial(i);
      } else {
        setHoverSp(i);
      }
    },
    style: {
      flexGrow: 1,
      padding: '5px 6px',
      fontSize: '0.7rem',
      background: sp.used ? '#0d0908' : hoverSp === i && canAct ? '#12280a' : canAct ? '#0a1a06' : '#0d0908',
      border: `1px solid ${sp.used ? '#2a2010' : hoverSp === i && canAct ? '#5a9020' : canAct ? '#3a7010' : '#252010'}`,
      color: sp.used ? '#3a3020' : canAct ? '#80b040' : '#4a6030',
      borderRadius: 4,
      cursor: sp.used || !canAct ? 'default' : 'pointer',
      fontFamily: 'inherit',
      opacity: sp.used ? 0.4 : 1
    }
  }, sp.e, " ", sp.sn))), hoverSp !== null && fight.specials[hoverSp] && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4,
      padding: '3px 8px',
      background: '#0a180a',
      border: '1px solid #3a6010',
      borderRadius: 3,
      fontSize: '0.65rem',
      color: '#90d050'
    }
  }, fight.specials[hoverSp].sd, !fight.specials[hoverSp].used && canAct ? ' — tap again to use' : ''))), phase === 'levelComplete' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '3rem',
      margin: '16px 0 6px',
      textShadow: `0 0 20px ${level === 3 ? '#ffdd00' : '#80ff20'}`
    }
  }, level === 3 ? '🏆' : '⭐'), /*#__PURE__*/React.createElement("h1", {
    style: {
      color: level === 3 ? col.accent : col.green,
      fontSize: 'clamp(1.3rem,5vw,2rem)',
      fontWeight: 'bold',
      margin: '0 0 4px',
      letterSpacing: 3,
      textShadow: `0 0 12px ${level === 3 ? '#e08800' : '#40a010'}`
    }
  }, level === 3 ? 'YOU WIN!' : 'LEVEL ' + level + ' CLEAR!'), /*#__PURE__*/React.createElement("p", {
    style: {
      color: col.dim,
      fontSize: '0.8rem',
      marginBottom: 4
    }
  }, BOSSES[level - 1].emoji, " ", BOSSES[level - 1].name, " defeated!"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: col.dim,
      fontSize: '0.75rem',
      marginBottom: 14
    }
  }, "HP remaining: ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: fight?.playerHp > 50 ? col.green : fight?.playerHp > 25 ? col.yellow : col.red,
      fontWeight: 'bold'
    }
  }, fight?.playerHp || 0, "/100")), level < 3 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#130d08',
      border: '1px solid #2a3a10',
      borderRadius: 8,
      padding: '10px 14px',
      marginBottom: 14,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.65rem',
      color: col.dim,
      marginBottom: 6
    }
  }, "NEXT UP:"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '2rem'
    }
  }, BOSSES[level].emoji), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.85rem',
      color: col.accent,
      marginTop: 4
    }
  }, BOSSES[level].name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.65rem',
      color: col.dim,
      marginTop: 2
    }
  }, BOSSES[level].subtitle, " · ", BOSSES[level].hp, " HP", BOSSES[level].enrageHp ? ' · Enrages!' : '', BOSSES[level].chargeChance > 0 ? ' · Charges!' : '', BOSSES[level].moves.some(m => m.poison) ? ' · Poisons!' : '', BOSSES[level].moves.some(m => m.stunPlayer) ? ' · Stuns!' : ''), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.6rem',
      color: '#6a5030',
      marginTop: 3
    }
  }, LEVEL_CFG[level].spiderCount === 2 ? '⚠️ Two spiders this level!' : '', ' ', "Timer: ", LEVEL_CFG[level].timer, "s")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#130d08',
      border: '1px solid #3a2010',
      borderRadius: 8,
      padding: 10,
      marginBottom: 14,
      width: '100%',
      maxWidth: 420
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.62rem',
      color: col.dim,
      marginBottom: 6
    }
  }, "YOUR ARMOUR THIS LEVEL:"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 5,
      justifyContent: 'center'
    }
  }, collected.map(t => /*#__PURE__*/React.createElement("div", {
    key: t.uid,
    style: {
      background: '#1a1208',
      border: '1px solid #3a2010',
      borderRadius: 4,
      padding: '3px 8px',
      fontSize: '0.72rem'
    }
  }, t.e, " ", /*#__PURE__*/React.createElement("b", null, t.name), /*#__PURE__*/React.createElement("span", {
    style: {
      color: col.green,
      marginLeft: 3
    }
  }, "🛡", t.arm), /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#e07030',
      marginLeft: 3
    }
  }, "⚔️", t.atk))))), level < 3 ? /*#__PURE__*/React.createElement("button", {
    onClick: startNextLevel,
    style: {
      background: '#1a2808',
      border: '1px solid #5a8010',
      color: '#a0e050',
      borderRadius: 6,
      cursor: 'pointer',
      fontFamily: 'inherit',
      fontSize: '0.95rem',
      padding: '10px 28px',
      letterSpacing: 1
    }
  }, "LEVEL ", level + 1, " → ", BOSSES[level].emoji) : /*#__PURE__*/React.createElement("button", {
    onClick: restart,
    style: {
      background: '#2a1808',
      border: '1px solid #6a4020',
      color: col.accent,
      borderRadius: 6,
      cursor: 'pointer',
      fontFamily: 'inherit',
      fontSize: '0.95rem',
      padding: '10px 28px',
      letterSpacing: 1
    }
  }, "🔄 Play Again")), phase === 'defeat' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '3.5rem',
      margin: '20px 0 8px',
      textShadow: `0 0 24px #ff3020`
    }
  }, "💀"), /*#__PURE__*/React.createElement("h1", {
    style: {
      color: col.red,
      fontSize: 'clamp(1.4rem,5vw,2.2rem)',
      fontWeight: 'bold',
      textShadow: '0 0 12px #a01008',
      margin: '0 0 6px',
      letterSpacing: 4
    }
  }, "DEFEATED!"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: col.dim,
      fontSize: '0.8rem',
      textAlign: 'center',
      maxWidth: 360,
      margin: '0 0 4px'
    }
  }, "Killed by ", fight?.boss?.emoji, " ", fight?.boss?.name, " on Level ", level), /*#__PURE__*/React.createElement("p", {
    style: {
      color: col.dim,
      fontSize: '0.75rem',
      margin: '0 0 16px'
    }
  }, "Boss had ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: col.red,
      fontWeight: 'bold'
    }
  }, fight?.bossHp || 0, "/", fight?.boss?.hp || 0), " HP left"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#130d08',
      border: '1px solid #3a2010',
      borderRadius: 8,
      padding: 10,
      marginBottom: 14,
      width: '100%',
      maxWidth: 420
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.62rem',
      color: col.dim,
      marginBottom: 6
    }
  }, "YOUR ARMOUR WAS:"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 5,
      justifyContent: 'center'
    }
  }, collected.map(t => /*#__PURE__*/React.createElement("div", {
    key: t.uid,
    style: {
      background: '#1a1208',
      border: '1px solid #3a2010',
      borderRadius: 4,
      padding: '3px 8px',
      fontSize: '0.72rem'
    }
  }, t.e, " ", /*#__PURE__*/React.createElement("b", null, t.name), /*#__PURE__*/React.createElement("span", {
    style: {
      color: col.green,
      marginLeft: 3
    }
  }, "🛡", t.arm), /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#e07030',
      marginLeft: 3
    }
  }, "⚔️", t.atk))))), /*#__PURE__*/React.createElement("button", {
    onClick: restart,
    style: {
      background: '#2a1808',
      border: '1px solid #6a4020',
      color: col.accent,
      borderRadius: 6,
      cursor: 'pointer',
      fontFamily: 'inherit',
      fontSize: '0.95rem',
      padding: '10px 28px',
      letterSpacing: 1
    }
  }, "🔄 Try Again")));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));