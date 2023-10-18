import { Roll } from "./dice";
import { Parse } from "./parse"

const INPUT = document.querySelector<HTMLInputElement>("#input");
const BUTTON = document.querySelector<HTMLButtonElement>("#button");
const LIST = document.querySelector<HTMLUListElement>("#list");

if (INPUT == null || BUTTON == null || LIST == null) {
    throw new Error("fix ya ids");
}

var rolls = Array<Roll>();
var roll_id = 0;

function isUnique(r: Roll) {
    rolls.forEach((s) => {
        // TODO this is bad, actually
        // Mult(2, Const(2)) and Const(22) produce the same string
        if (s.toString() == r.toString()) return false;
    });
    return true
}

function rollDie(this: GlobalEventHandlers, ev: MouseEvent) {
    let button = ev.currentTarget as HTMLButtonElement;
    let m = button.id.match("roll-(?<id>[0-9]*)");
    // Don't know why this has to be this way
    let n = +(m?.groups?.id || "0");
    let r = rolls[n];
    let elem = document.getElementById(`display-${n}`);
    if (elem == null) { throw new Error("fix ya ids"); }
    elem.innerHTML = r.roll().toString();
}

function addRoll() {
    let str = document.querySelector<HTMLInputElement>('#input')?.value;
    if (str) {
        let R = new Parse(str).parse() as Roll;
        if (R && isUnique(R)) {
            let li = document.createElement("li");
            li.innerHTML = `
                <div class="list-item-div" id="li-${roll_id}">
                    <div>${R}</div>
                    <button id="roll-${roll_id}">Roll</button>
                    <p id="display-${roll_id}"></p>
                </div>
            `;
            LIST?.append(li);
            let button = document.getElementById(`roll-${roll_id}`) as HTMLButtonElement;
            if (button == null) { throw new Error("fix ya ids"); }
            button.onclick = rollDie;
            rolls.push(R);
            roll_id++;
        }
    }
}

BUTTON.onclick = addRoll;