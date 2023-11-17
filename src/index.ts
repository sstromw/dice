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
    listItem: Element,         // .list-item
    rollButton: Element,       // .roll-button
    display: Element,          // .roll-display
    deleteButton: Element,     // .delete
    showStatsButton: Element,  // .show-stats
    statsDiv: Element,         // .content
    stats: Element,            // .stats
    percentiles: Element,      // .percentiles
    chart: Element,            // .chart
    stats_populated: boolean,
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
    let m = button.id.match(/rollButton(?<id>[0-9]*)/);
    let item = ROLLS.get(+m.groups.id);
    item.display.innerHTML = item.roll.roll().toString() || "";
}

function deleteRoll(this: GlobalEventHandlers, ev: MouseEvent) {
    let button = ev.currentTarget as HTMLButtonElement;
    let m = button.id.match(/deleteButton(?<id>[0-9]*)/);
    let n = +m.groups.id;
    ROLLS.get(n).listItem.remove();
    ROLLS.delete(n);
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
    if (!(item.chart instanceof HTMLCanvasElement)) {
        throw new Error("type error: chart");
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
    item.stats.innerHTML += `<tr><td>&#956;</td><td>${mean}</td></tr>`
    item.stats.innerHTML += `<tr><td>&#963;</td><td>${stdev}</td></tr>`;

    let buckets = [10, 25, 50, 75, 90];
    for (let t of buckets) {
        let x = item.roll.inverse_cdf(t/100);
        item.percentiles.innerHTML += `<tr><td>${t}%</td><td>${x}</td></tr>`;
    }
}

function showStats(this: GlobalEventHandlers, ev: MouseEvent) {
    let button = ev.currentTarget as HTMLButtonElement;
    let m = button.id.match(/showStatsButton(?<id>[0-9]+)/);
    let n = +m.groups.id;
    let item = ROLLS.get(n);
    let elem = item.statsDiv;
    if (!(elem instanceof HTMLDivElement)) {
        throw new TypeError("stats should be a div");
    }
    if (elem.style.display === "block") {
      elem.style.display = "none";
      button.innerHTML = "&#8595;";
    } else {
      elem.style.display = "block";
      button.innerHTML = "&#8593;";
    }
    if (!item.stats_populated) {
        populateStats(n);
        item.stats_populated = true;
    }
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
            let template = document.getElementById('roll-item') as HTMLTemplateElement;
            let item = template.content.cloneNode(true) as HTMLLIElement;
            item.querySelector('.button-text').innerHTML = R.toString();
            let itemElements = {
                roll: R,
                listItem: item,
                rollButton: item.querySelector('.roll-button'),
                display: item.querySelector('.roll-display'),
                deleteButton: item.querySelector('.delete'),
                showStatsButton: item.querySelector('.show-stats'),
                statsDiv: item.querySelector('.content'),
                stats: item.querySelector('.stats'),
                percentiles: item.querySelector('.percentiles'),
                chart: item.querySelector('.chart'),
                stats_populated: false,
            };
            Object.entries(itemElements).forEach(([k,v]) => {
                if (v === null) {
                    throw new Error(`Cannot find element: ${k}`)
                }
                if (v instanceof Element) {
                    v.id = k + roll_id;
                }
            });
            itemElements.rollButton.addEventListener('click', rollDie);
            itemElements.deleteButton.addEventListener('click', deleteRoll);
            itemElements.showStatsButton.addEventListener('click', showStats);
            ROLLS.set(roll_id, itemElements);
            roll_id++;
            INPUT.value = "";
            LIST?.append(item);
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