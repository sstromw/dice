import { Roll } from "./dice";
import { Parse } from "./parse"

const INPUT = document.querySelector<HTMLInputElement>("#input");
const BUTTON = document.querySelector<HTMLButtonElement>("#button");
const LIST = document.querySelector<HTMLUListElement>("#list");

if (INPUT == null || BUTTON == null || LIST == null) {
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

function addRoll() {
    let str = document.querySelector<HTMLInputElement>('#input')?.value;
    if (str) {
        let R = new Parse(str).parse() as Roll;
        if (R && isUnique(R)) {
            let li = document.createElement("li");
            li.id = `li-${roll_id}`
            li.innerHTML = `
                <div class="list-item-div">
                    <div class="column">
                        <div>${R}</div>
                        <button id="roll-${roll_id}">Roll</button>
                        <p id="display-${roll_id}"></p>
                    </div>
                    <div class="column">
                        <button class="delete" id="delete-${roll_id}">Delete</button>
                    </div>
                </div>
            `;
            LIST?.append(li);
            let rollButton = document.getElementById(`roll-${roll_id}`) as HTMLButtonElement;
            let deleteButton = document.getElementById(`delete-${roll_id}`) as HTMLButtonElement;
            if (rollButton == null || deleteButton == null) {
                throw new Error("fix ya ids");
            }
            rollButton.onclick = rollDie;
            deleteButton.onclick = deleteRoll;
            rolls.set(roll_id, R);
            roll_id++;
        }
    }
}

BUTTON.onclick = addRoll;