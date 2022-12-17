// ==UserScript==
// @name         AddHashtag
// @namespace    http://Vfokin.net/
// @version      0.1
// @description  try to take over the world!
// @author       Vfokin
// @match        https://creatio.nornik.ru/0/Nui/ViewModule.aspx*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nornik.ru
// @grant        none
// ==/UserScript==

const Ritm = {
    Type: "Ritm",
    Max: "maxElemRITM",
    closeComment_el: "ActivityPageV2DetailedResultMemoEdit-el",
    closeComment_virtual: "ActivityPageV2DetailedResultMemoEdit-virtual",
    battonslayout: "ActivityPageV2InformationClosedAndPausedGridLayoutGridLayout-item-ActivityPageV2DetailedResultContainer",
    HashtagsLevel: 1,
    HashtagCont: 1,
}

const Inc = {
    Type: "Inc",
    Max: "maxElemINC",
    closeComment_el: "ActivityPageV2DetailedResultIncidentMemoEdit-el",
    closeComment_virtual: "ActivityPageV2DetailedResultIncidentMemoEdit-virtual",
    battonslayout: "ActivityPageV2InformationClosedAndPausedIncidentGridLayoutGridLayout-item-ActivityPageV2DetailedResultIncidentContainer",
    HashtagsLevel: 3,
    HashtagCont: 3,
    HashtagContMove: 2,
}

let Task;

const Hashtags = [//different levels of hashtags
    [
        { name: "#УП", maxElemRITM: 1, maxElemINC: 3 },
        { name: "#локал", maxElemRITM: 1, maxElemINC: 3 }
    ],
    [
        { name: "#ПО", maxElemRITM: 1, maxElemINC: 3 },
        { name: "#Железо", maxElemRITM: 1, maxElemINC: 3 },
        { name: "#Периферия", maxElemRITM: 1, maxElemINC: 3 },
        { name: "#Сеть", maxElemRITM: 1, maxElemINC: 3 },
        { name: "#Печать", maxElemRITM: 1, maxElemINC: 3 },
        { name: "#Маршрутизация", maxElemRITM: 1, maxElemINC: 2 },
        { name: "#Неизвестно", maxElemRITM: 1, maxElemINC: 1 }
    ],
    [
        { name: "#Установка", maxElemRITM: 1, maxElemINC: 3 },
        { name: "#Настройка", maxElemRITM: 1, maxElemINC: 3 },
        { name: "#Консультация", maxElemRITM: 1, maxElemINC: 3 },
        { name: "#Проверка", maxElemRITM: 1, maxElemINC: 3 },
        { name: "#Замена", maxElemRITM: 1, maxElemINC: 3 }
    ],
];

(function () {
    'use strict';

    main();
    inputRecheak();
})();

function main() {
    ifTask();
}

function ifTask() {
    const IfReady = setInterval(function () {
        const elem = document.getElementById("MainHeaderSchemaPageHeaderCaptionLabel");
        if (elem != null) {
            const regex = /(TASK)\d*/gm;
            if (elem.textContent.match(regex)) {
                clearInterval(IfReady);
                taskType();
                addButtons();
            }
        }
    }, 10)
}

function taskType() {
    const task = document.getElementById("ActivityPageV2CaseLookupEdit-link-el");
    const taskText = task.textContent
    const incReg = /(INC)\d*/gm;
    const ritReg = /(RITM)\d*/gm;
    if (taskText.match(incReg))
        Task = Inc;
    if (taskText.match(ritReg))
        Task = Ritm;
    CheckHashtag();
}

function ValideteHashtag(hashtag) {
    for (let level = 0; level < Hashtags.length; level++)
        for (const hash of Hashtags[level])
            if (hashtag === hash.name)
                return level;
    return -1;
}

function GetHashText() {

    const closeComment_virtual = document.getElementById(Task.closeComment_virtual);
    const text = closeComment_virtual.value;
    const reg = /(#\S+)\s+?/gm;
    return [text.match(reg), text, reg];
}

function HashSort() {
    const closeComment_virtual = document.getElementById(Task.closeComment_virtual);
    let text = closeComment_virtual.value;
    const reg = /(#\S+)\s+?/gm;
    const hashtagIt = text.match(reg);

    let hashArray = new Array(Hashtags.length + 1).fill(``);
    while (hashtagIt.length > 0) {
        const lvElem = ValideteHashtag(hashtagIt[0].trim())
        if (lvElem >= 0)
            hashArray[lvElem] += hashtagIt[0];
        else
            hashArray[hashArray.length - 1] += hashtagIt[0];
        text = text.replace(hashtagIt[0], ``);
        hashtagIt.shift();
    }
    let com = ``;
    for (const el of hashArray)
        com += el;
    com += text;
    setText(com);
}

function CheckHashtag() {
    const closeComment_el = document.getElementById(Task.closeComment_el);
    const closeComment_virtual = document.getElementById(Task.closeComment_virtual);
    const text = closeComment_virtual.value;
    const reg = /(#\S+)\s+?/gm;
    const hashtagIt = text.match(reg);

    if (hashtagIt == null) {
        closeComment_el.style.backgroundColor = "#ff262638";
        return;
    }

    let hashCount;
    if (hashtagIt.find(e => e == "#Маршрутизация ")) {
        hashCount = Task.HashtagContMove;
    }
    else {
        hashCount = Task.HashtagCont;
    }
    if (hashtagIt.length < hashCount)
        closeComment_el.style.backgroundColor = "#ff262638";
    else {
        closeComment_el.style.backgroundColor = null;
    }
}

// function checkMaxHashtags(max) {
//     if (Task.HashtagCont > max)
//         Task.HashtagCont = max;
//         console.log(Task.HashtagCont);
// }

function generateBattons() {
    let battons = ``;
    for (let i = 0; i < Task.HashtagsLevel; i++) {
        let batton = ``;
        for (let el of Hashtags[i]) {
            batton += `<button class="Hashtag">${el.name}</button>`;
        }
        battons += `<div class="grid-layout-row ts-box-sizing hashButtons" id="hashButtons">
                <div class="ts-box-sizing base-edit-with-right-icon base-edit-disabled date-edit datetime-datecontrol">
                    ${batton}
                </div>
            </div>`
    }
    return `
        <div  id="el1">
            ${battons}
            <div class="grid-layout-row ts-box-sizing hashButtons" id="hashButtons">
                <div class="ts-box-sizing base-edit-with-right-icon base-edit-disabled date-edit datetime-datecontrol">
                    <button>Отсортировать #</button>
                </div>
            </div>
        </div>`;
}

function addButtons() {
    if (document.getElementById("hashButtons") != null)
        return;
    const closeLayout = document.getElementById(Task.battonslayout);
    const parent = closeLayout.parentElement;
    parent.insertAdjacentHTML("beforebegin", generateBattons())
    buttonHandler();
}

function buttonHandler() {
    document.getElementById("el1").onclick = (e) => {
        if (e.target.tagName == "BUTTON" && e.target.className == "Hashtag")
            addHashtag(e.target.textContent + " ");
        if (e.target.tagName == "BUTTON" && e.target.textContent == "Отсортировать #")
            HashSort();
    };
}

function addHashtag(hashtag) {
    const closeComment_el = document.getElementById(Task.closeComment_el);
    const closeComment_virtual = document.getElementById(Task.closeComment_virtual);
    closeComment_virtual.value = hashtag + closeComment_virtual.value;
    closeComment_el.value = hashtag + closeComment_el.value;
    HashSort();
    events();
    taskType();
}

function setText(text) {
    const closeComment_el = document.getElementById(Task.closeComment_el);
    const closeComment_virtual = document.getElementById(Task.closeComment_virtual);
    closeComment_virtual.value = text;
    closeComment_el.value = text;
    events();
    taskType();
}

function events(){
    let ev = new Event("focus",{
        bubbles:true,
        cancelable:true,
    });
    const closeComment_el = document.getElementById(Task.closeComment_el);
    closeComment_el.dispatchEvent(ev);
    document.getElementById(Task.closeComment_el).focus();
    // let eve = new InputEvent(`input`,true,``);
    // closeComment_el.dispatchEvent(eve);
}

function inputRecheak() {
    const body = document.getElementsByTagName("body");
    body[0].addEventListener("mousedown", () => {
        main();
    })
    body[0].addEventListener("keydown", () => {
        main();
    })
}