import { Roll } from "./dice";
import { Parse } from "./parse";
// TODO: Only import the necessary bar chart bits
import { Chart } from "chart.js/auto";

const INPUT = document.querySelector<HTMLInputElement>("#input");
const ADD_BUTTON = document.querySelector<HTMLButtonElement>("#add-button");
const OVERLAY_BUTTON = document.querySelector<HTMLButtonElement>("#overlay-button");
const OVERLAY = document.querySelector<HTMLButtonElement>("#overlay");
const LIST = document.querySelector<HTMLUListElement>("#list");

if (INPUT == null
    || ADD_BUTTON == null
    || OVERLAY_BUTTON == null
    || OVERLAY == null
    || LIST == null) {
    throw new Error("fix ya ids");
}

interface ListItem {
    roll: Roll,
    rollButton: HTMLButtonElement,       // roll-${roll_id}
    display: HTMLParagraphElement,       // display-${roll_id}
    showStatsButton: HTMLButtonElement,  // show-stats-${roll_id}
    deleteButton: HTMLButtonElement,     // delete-${roll_id}
    statsDiv: HTMLDivElement,            // stats-div-${roll_id}
    stats: HTMLParagraphElement,         // stats-${roll_id}
    percentiles: HTMLParagraphElement,   // percentiles-${roll_id}
    chart: HTMLCanvasElement,            // chart-${roll_id}
}

var ROLLS = new Map<number, ListItem>();
var roll_id = 0;

function isUnique(r: Roll) {
    for (let s of ROLLS.values()) {
        if (s.roll.eq(r)) { return false; }
    }
    return true;
}

function rollDie(this: GlobalEventHandlers, ev: MouseEvent) {
    let button = ev.currentTarget as HTMLButtonElement;
    let m = button.id.match("roll-(?<id>[0-9]*)");
    if (m?.groups?.id == null) { throw new Error("fix ya ids"); }
    let n = +m.groups.id;
    let elem = document.getElementById(`display-${n}`);
    if (elem == null) { throw new Error("fix ya ids"); }
    elem.innerHTML = ROLLS.get(n)?.roll.roll().toString() || "";
}

function deleteRoll(this: GlobalEventHandlers, ev: MouseEvent) {
    let button = ev.currentTarget as HTMLButtonElement;
    let m = button.id.match("delete-(?<id>[0-9]*)");
    if (m?.groups?.id == null) { throw new Error("fix ya ids"); }
    let n = +m.groups.id;
    ROLLS.delete(n);
    document.getElementById(`li-${n}`)?.remove();
}

function populateStats(id: number) {
    let item = ROLLS.get(id);
    
    let m = 0;
    let data: [number, number][] = [];
    let S = item.roll.sample_space();
    for (let [_,p] of S) {
        if (p > m) { m = p; }
    }
    if (m > 0.1) { m = 0.1; }
    let k = S.min_value;
    while (S.cdf(k) < m/20) { k++; }
    while (S.cdf(k-1) < 1 - m/20) {
        data.push([k, S.pmf(k)]);
        k++;
    }
    // TODO https://stackoverflow.com/questions/30256695/chart-js-drawing-an-arbitrary-vertical-line
    const pmf_chart = new Chart(
      item.chart,
      {
        type: 'bar',
        data: {
          labels: data.map(e => e[0]),
          datasets: [
            {
              label: 'Probability',
              data: data.map(e => e[1])
            }
          ]
        },
        options: {
            maintainAspectRatio: false
        }
      }
    );
    let mean = item.roll.mean().toFixed(2);
    let stdev = item.roll.stdev().toFixed(2);
    item.stats.innerHTML = `&#956;: ${mean}<br>&#963;: ${stdev}`;

    let buckets = [10, 25, 50, 75, 90];
    for (let t of buckets) {
        let x = item.roll.inverse_cdf(t/100);
        item.percentiles.innerHTML += `${t}%: ${x}<br>`;
    }
}

function showStats(this: GlobalEventHandlers, ev: MouseEvent) {
    let button = ev.currentTarget as HTMLButtonElement;
    let m = button.id.match("show-stats-(?<id>[0-9]*)");
    let n = +m.groups.id;
    let elem = ROLLS.get(n).statsDiv;
    if (elem.style.display === "block") {
      elem.style.display = "none";
    } else {
      elem.style.display = "block";
    }
    populateStats(n);
}

function checkKey(e: KeyboardEvent) {
    if (e.key === "Enter") {
        addRoll();
    }
}

function addRoll() {
    let str = INPUT.value;
    INPUT.style.backgroundColor = "white";
    if (str) {
        let R = new Parse(str).parse();
        if (R instanceof Roll) {
            let li = document.createElement("li");
            li.id = `li-${roll_id}`
            li.innerHTML = `
                <div class="list-item-div">
                    <div class="row">
                        <div class="quarter-column">
                            <div>${R}</div>
                        </div>
                        <div class="quarter-column">
                            <button class="roll-button" id="roll-${roll_id}">Roll</button>
                            <p class="roll-display" id="display-${roll_id}"></p>
                        </div>
                        <div class="quarter-column">
                            <button class="show-stats" id="show-stats-${roll_id}">Show Stats</button>
                        </div>
                        <div class="quarter-column">
                            <button class="delete" id="delete-${roll_id}">Delete</button>
                        </div>
                    </div>
                    <div class="content" id="stats-div-${roll_id}">
                        <div style="float: left; width: 84%;">
                            <canvas id="chart-${roll_id}"></canvas>
                        </div>
                        <div style="float: left; width: 8%;">
                            <p id="stats-${roll_id}"></p>
                        </div>
                        <div style="float: left; width: 8%;">
                            <p id="percentiles-${roll_id}"></p>
                        </div>
                    </div>
                </div>
            `;
            LIST?.append(li);
            let item = {
                roll: R,
                rollButton: document.getElementById(`roll-${roll_id}`) as HTMLButtonElement,
                display: document.getElementById(`display-${roll_id}`) as HTMLParagraphElement,
                showStatsButton: document.getElementById(`show-stats-${roll_id}`) as HTMLButtonElement,
                deleteButton: document.getElementById(`delete-${roll_id}`) as HTMLButtonElement,
                statsDiv: document.getElementById(`stats-div-${roll_id}`) as HTMLDivElement,
                stats: document.getElementById(`stats-${roll_id}`) as HTMLParagraphElement,
                percentiles: document.getElementById(`percentiles-${roll_id}`) as HTMLParagraphElement,
                chart: document.getElementById(`chart-${roll_id}`) as HTMLCanvasElement,
            };
            Object.entries(item).forEach(([k,v]) => { 
                if (v === undefined) {
                    throw new Error(`fix ya ids: ${k}`)
                }
            });
            item.rollButton.onclick = rollDie;
            item.deleteButton.onclick = deleteRoll;
            item.showStatsButton.onclick = showStats;
            ROLLS.set(roll_id, item);
            roll_id++;
            INPUT.value = "";
        }
        else if (R instanceof Error) {
            console.log(R);
            INPUT.style.backgroundColor = "red";
        }
    }
}

function showOverlay () {
    if (OVERLAY.style.display === "block") {
        OVERLAY.style.display = "none";
    } else {
        OVERLAY.style.display = "block";
    }
}

document.addEventListener("keydown", (e) => {
    if (document.activeElement !== INPUT && e.key == "/") {
        e.preventDefault();
        INPUT.focus();
    }
});

INPUT.onkeydown = checkKey;
ADD_BUTTON.onclick = addRoll;
OVERLAY_BUTTON.onclick = showOverlay;