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

    listItem: HTMLElement,         // .list-item
    rollButton: HTMLElement,       // .roll-button
    display: HTMLElement,          // .roll-display
    deleteButton: HTMLElement,     // .delete
    labelInput: HTMLElement,       // .add-label
    showStatsButton: HTMLElement,  // .show-stats
    statsDiv: HTMLElement,         // .content
    stats: HTMLElement,            // .stats
    percentiles: HTMLElement,      // .percentiles
    chart: HTMLElement,            // .chart

    stats_populated: boolean,
}

var ROLLS = new Map<number, ListItem>();
var roll_id = 0;

function idFromElement(e: Element) {
    let m = e.id.match(/[A-Za-z]*(?<id>[0-9]*)/);
    return +m.groups.id;
}

function rollDie(this: GlobalEventHandlers, ev: MouseEvent) {
    let button = ev.currentTarget as Element;
    let item = ROLLS.get(idFromElement(button));
    let display = item.display as HTMLParagraphElement;
    display.style.animation = 'none';
    display.offsetHeight; /* trigger reflow */
    display.style.animation = null; 
    item.display.innerHTML = item.roll.roll().toString() || "";
}

function deleteRoll(this: GlobalEventHandlers, ev: MouseEvent) {
    let button = ev.currentTarget as Element;
    let n = idFromElement(button);
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
    // TODO https://www.chartjs.org/docs/latest/samples/other-charts/combo-bar-line.html
    const pmf_chart = new Chart(
      item.chart,
      {
        type: 'bar',
        data: {
          labels: data.map(e => e[0]),
          datasets: [
            {
              label: 'Probability',
              data: data.map(e => e[1]),
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
    let ksn = item.roll.ks_normality().toFixed(2);
    item.stats.innerHTML += `<tr><td>&#956;</td><td>${mean}</td></tr>`
    item.stats.innerHTML += `<tr><td>&#963;</td><td>${stdev}</td></tr>`;
    item.stats.innerHTML += `<tr><td>KSN</td><td>${ksn}</td></tr>`;

    let buckets = [10, 25, 50, 75, 90];
    for (let t of buckets) {
        let x = item.roll.inverse_cdf(t/100);
        item.percentiles.innerHTML += `<tr><td>${t}%</td><td>${x}</td></tr>`;
    }
}

function showStats(this: GlobalEventHandlers, ev: MouseEvent) {
    let button = ev.currentTarget as Element;
    let n = idFromElement(button);
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
        let labels: Map<string, Roll> = null;
        if (str.match(/.*{.*}.*/)) {
            labels = new Map<string, Roll>();
            ROLLS.forEach((obj) => {
                let label = (obj.labelInput as HTMLInputElement).value;
                if (label) {
                    labels.set(label, obj.roll);
                }
            })
        }
        let R = new Parse(str, labels).parse();
        if (R instanceof Roll) {
            let template = document.getElementById('roll-item') as HTMLTemplateElement;
            let item = template.content.cloneNode(true) as Element;
            item.querySelector('.button-text').innerHTML = R.toString();

            let obj = {
                roll: R,
                listItem: item.querySelector('.list-item') as HTMLElement,
                rollButton: item.querySelector('.roll-button') as HTMLElement,
                display: item.querySelector('.roll-display') as HTMLElement,
                deleteButton: item.querySelector('.delete') as HTMLElement,
                labelInput: item.querySelector('.add-label') as HTMLElement,
                showStatsButton: item.querySelector('.show-stats') as HTMLElement,
                statsDiv: item.querySelector('.content') as HTMLElement,
                stats: item.querySelector('.stats') as HTMLElement,
                percentiles: item.querySelector('.percentiles') as HTMLElement,
                chart: item.querySelector('.chart') as HTMLElement,
                stats_populated: false,
            };
            Object.entries(obj).forEach(([k,v]) => {
                if (v === null) {
                    throw new Error(`Cannot find element: ${k}`)
                }
                if (v instanceof Element) {
                    v.id = k + roll_id;
                }
            });
            obj.rollButton.addEventListener('click', rollDie);
            obj.deleteButton.addEventListener('click', deleteRoll);
            obj.showStatsButton.addEventListener('click', showStats);
            ROLLS.set(roll_id, obj);
            roll_id++;
            INPUT.value = "";
            INPUT.placeholder = "";
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

let PLACEHOLDERS = [
    'e.g. "2d6 - d4 + 2"',
    'e.g. "max(d20, d20, d20)"',
    'e.g. "min(d10, d12)"',
    'e.g. "d100 + d11"',
    'e.g. "2 + d9"',
    'e.g. "2(d6 + d8)"',
    'e.g. "2*d8"',
    'e.g. "100d20"',
    'e.g. "-d20"',
    'e.g. "d4 < d6"',
    'e.g. "3c"',
    'e.g. "g(0.15)"',
    'e.g. "pois(10)"',
]

INPUT.placeholder = PLACEHOLDERS[
    Math.floor(Math.random() * PLACEHOLDERS.length)
];

INPUT.onkeydown = checkKey;
ADD_BUTTON.onclick = addRoll;
OVERLAY_BUTTON.onclick = showOverlay;