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

//================ Start Config =====================================================================================

//   Required hashtag depth
const hashtagsLevelRitm = 1;
const hashtagsLevelINC = 3;

//   The minimum number of hashtags for different tasks
const minHashtagCountRITM = 1;
const minHashtagCountINC = 3;

//    Different levels of hashtags
// you can add "maxElemINC" or "maxElemRITM" to decrease the minimum count
const Hashtags = [
    [
        { name: "#УП", title: "Выполнено удалённо  или может быть выполнено удаленно." },
        { name: "#локал", title: "Выполнено локально и не может быть выполнено по другому" },
    ],
    [
        { name: "#ПО", title: "Ошибки, вылеты, не правильная работа…" },
        { name: "#Железо", title: "Bsod, bad block, не включается…" },
        { name: "#Периферия", title: "Мыши, клавиатуры, гарнитуры, кабеля… " },
        { name: "#Сеть", title: "Нет сети, потеря пакетов, недоступность ресурсов" },
        { name: "#Печать", title: "Кончился картридж, дефекты печати" },
        { name: "#Маршрутизация", title: "Неверное назначение, нет возможности выполнить доступными средствами(локал\удаленка), требуется участие другой группы.", maxElemINC: 2 },
        { name: "#Неизвестно", title: "Причину установить не удалось​", maxElemINC: 1 },
    ],
    [
        { name: "#Установка", title: "Обращение выполнено через установку\переустановку ПО" },
        { name: "#Настройка", title: "Обращение выполнено настройкой\правкой" },
        { name: "#Консультация", title: "Оказана консультация по обращению" },
        { name: "#Проверка", title: "Обращение связано с проверкой или проблема не проявилась" },
        { name: "#Замена", title: "Инцидент устранён заменой модуля\оборудования" },
    ],
];

const Answers = [
    { name: "Доп РЗ", title: "#УП Создано Доп РЗ" },
];

//================ End Config =====================================================================================

const Ritm = {
    type: "Ritm",
    max: "maxElemRITM",
    closeComment_el: "ActivityPageV2DetailedResultMemoEdit-el",
    closeComment_virtual: "ActivityPageV2DetailedResultMemoEdit-virtual",
    battonslayout: "ActivityPageV2InformationClosedAndPausedGridLayoutGridLayout-item-ActivityPageV2DetailedResultContainer",
    hashtagsLevel: hashtagsLevelRitm,
    hashtagCont: minHashtagCountRITM,
    defHashtagCont: minHashtagCountRITM,
}

const Inc = {
    type: "Inc",
    max: "maxElemINC",
    closeComment_el: "ActivityPageV2DetailedResultIncidentMemoEdit-el",
    closeComment_virtual: "ActivityPageV2DetailedResultIncidentMemoEdit-virtual",
    battonslayout: "ActivityPageV2InformationClosedAndPausedIncidentGridLayoutGridLayout-item-ActivityPageV2DetailedResultIncidentContainer",
    hashtagsLevel: hashtagsLevelINC,
    hashtagCont: minHashtagCountINC,
    defHashtagCont: minHashtagCountINC,
}

let Task;

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
                tasktype();
                addButtons();
            }
        }
    }, 10)
}

function tasktype() {
    const task = document.getElementById("ActivityPageV2CaseLookupEdit-link-el");
    const taskText = task.textContent
    const incReg = /(INC)\d*/gm;
    const ritReg = /(RITM)\d*/gm;
    if (taskText.match(incReg))
        Task = Inc;
    if (taskText.match(ritReg))
        Task = Ritm;
    checkHashtag();
}

function valideteHashtag(hashtag) {
    for (let level = 0; level < Hashtags.length; level++)
        for (const hash of Hashtags[level])
            if (hashtag === hash.name) {
                checkMaxHashtags(hash[Task.max]);
                return level;
            }
    return -1;
}

function resetMaxHashtags() {
    Task.hashtagCont = Task.defHashtagCont;
}

function checkMaxHashtags(max) {
    if (max) {
        if (Task.hashtagCont > max)
            Task.hashtagCont = max;
    }
}

function getHashText() {
    const closeComment_virtual = document.getElementById(Task.closeComment_virtual);
    const text = closeComment_virtual.value;
    const reg = /(#\S+)\s+?/gm;
    return [text.match(reg), text, reg];
}

function hashSort() {
    const closeComment_virtual = document.getElementById(Task.closeComment_virtual);
    let text = closeComment_virtual.value;
    const reg = /(#\S+)\s+?/gm;
    const hashtagIt = text.match(reg);

    let hashArray = new Array(Hashtags.length + 1).fill(``);
    resetMaxHashtags();
    while (hashtagIt.length > 0) {
        const lvElem = valideteHashtag(hashtagIt[0].trim())
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
    checkHashtag();
}

function checkHashtag() {
    const closeComment_el = document.getElementById(Task.closeComment_el);
    const closeComment_virtual = document.getElementById(Task.closeComment_virtual);
    const text = closeComment_virtual.value;
    const reg = /(#\S+)\s+?/gm;
    const hashtagIt = text.match(reg);
    if (hashtagIt == null) {
        closeComment_el.style.backgroundColor = "#ff262638";
        return;
    }
    if (hashtagIt.length < Task.hashtagCont)
        closeComment_el.style.backgroundColor = "#ff262638";
    else {
        closeComment_el.style.backgroundColor = null;
    }
}

function genBatton(type, el) {
    return `<button class="${type}" title="${el.title}">${el.name}</button>`
}

function generateBattHash() {
    let battons = ``;
    for (let i = 0; i < Task.hashtagsLevel; i++) {
        let batton = ``;
        for (let el of Hashtags[i]) {
            batton += genBatton("Hashtag", el);
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
            ${generateBattAns()}
        </div>`;
}

function generateBattAns() {
    let battons = ``;
    for (const el of Answers) {
        battons += `<div class="grid-layout-row ts-box-sizing hashButtons" id="hashButtons">
            <div class="ts-box-sizing base-edit-with-right-icon base-edit-disabled date-edit datetime-datecontrol">
                ${genBatton("Answer", el)}
            </div>
        </div>`
    }
    return battons;
}

function addButtons() {
    if (document.getElementById("hashButtons") != null)
        return;
    const closeLayout = document.getElementById(Task.battonslayout);
    const parent = closeLayout.parentElement;
    parent.insertAdjacentHTML("beforebegin", generateBattHash());
    buttonHandler();
}

function buttonHandler() {
    document.getElementById("el1").onclick = (e) => {
        if (e.target.tagName == "BUTTON" && e.target.className == "Hashtag")
            addHashtag(e.target.textContent + " ");
        if (e.target.tagName == "BUTTON" && e.target.textContent == "Отсортировать #")
            hashSort();
        if (e.target.tagName == "BUTTON" && e.target.className == "Answer")
            setText(e.target.title);
    };
}

function addHashtag(hashtag) {
    const closeComment_el = document.getElementById(Task.closeComment_el);
    const closeComment_virtual = document.getElementById(Task.closeComment_virtual);
    closeComment_virtual.value = hashtag + closeComment_virtual.value;
    closeComment_el.value = hashtag + closeComment_el.value;
    hashSort();
    generateEvent();
    tasktype();
}

function setText(text) {
    const closeComment_el = document.getElementById(Task.closeComment_el);
    const closeComment_virtual = document.getElementById(Task.closeComment_virtual);
    closeComment_virtual.value = text;
    closeComment_el.value = text;
    generateEvent();
    tasktype();
}

function generateEvent() {
    document.getElementById(Task.closeComment_el).focus();
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