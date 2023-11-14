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

var rolls = new Map<number, Roll>();
var roll_id = 0;

function isUnique(r: Roll) {
    for (let s of rolls.values()) {
        if (s.eq(r)) { return false; }
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
    elem.innerHTML = rolls.get(n)?.roll().toString() || "";
}

function deleteRoll(this: GlobalEventHandlers, ev: MouseEvent) {
    let button = ev.currentTarget as HTMLButtonElement;
    let m = button.id.match("delete-(?<id>[0-9]*)");
    if (m?.groups?.id == null) { throw new Error("fix ya ids"); }
    let n = +m.groups.id;
    rolls.delete(n);
    document.getElementById(`li-${n}`)?.remove();
}

function populateStats(id: number) {
    let R = rolls.get(id);
    let canvas = document.getElementById(`chart-${id}`) as HTMLCanvasElement;
    if (R == null || canvas == null) {
        throw new Error("fix ya ids");
    }
    
    let m = 0;
    let data: [number, number][] = [];
    let S = R.sample_space();
    for (let [_,p] of S) {
        if (p > m) { m = p; }
    }
    let k = S.min_value;
    while (S.cdf(k-1) <= m/50) { k++; }
    while (S.cdf(k-1) <= 1 - m/50) {
        data.push([k, S.pmf(k)]);
        k++;
    }
    // TODO https://stackoverflow.com/questions/30256695/chart-js-drawing-an-arbitrary-vertical-line
    const pmf_chart = new Chart(
      canvas,
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
}

function showStats(this: GlobalEventHandlers, ev: MouseEvent) {
    let button = ev.currentTarget as HTMLButtonElement;
    let m = button.id.match("show-stats-(?<id>[0-9]*)");
    if (m?.groups?.id == null) { throw new Error("fix ya ids"); }
    let n = +m.groups.id;
    let elem = document.getElementById(`stats-${n}`) as HTMLDivElement;
    if (elem == null) { throw new Error("fix ya ids"); }
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
                    <div class="content" id="stats-${roll_id}">
                        <canvas id="chart-${roll_id}"></canvas>
                    </div>
                </div>
            `;
            // TODO add a space in "stats" to display quartiles or deciles
            LIST?.append(li);
            let rollButton = document.getElementById(`roll-${roll_id}`) as HTMLButtonElement;
            let deleteButton = document.getElementById(`delete-${roll_id}`) as HTMLButtonElement;
            let statsButton = document.getElementById(`show-stats-${roll_id}`) as HTMLButtonElement;
            if (rollButton == null || deleteButton == null) {
                throw new Error("fix ya ids");
            }
            rollButton.onclick = rollDie;
            deleteButton.onclick = deleteRoll;
            statsButton.onclick = showStats;
            rolls.set(roll_id, R);
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