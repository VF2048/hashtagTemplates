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
        { name: "#SDA", title: "Для снятия статистики  установок ПО\ИС скриптами Дмитрия Свиридова" },
        { name: "#AC", title: "При использование Admin Cloud" },
        { name: "#РУК", title: "При установк​е ПО руками, нет автоматизации SCCM,AC,SDA" },
        { name: "#Беззаявки​​", title: "Используется при закрытии саморегов​" },
        { name: "#Car", title: "Используется,когда инженер для выполнения заявки едет на машине." },
        { name: "#Диагностика", title: "​Проверка ПК и периферийного оборудования на исправность и соответствие заявленной конфигурации" },
        // { name: "​#Профилактика", title: "Механическое удаление пыли и грязи с ПК и периферийного оборудования" },
        { name: "#Dly", title: "Обозначение того, что заявка попала к нам на группу с SLA более 75% либо уже сгоревшая." },
        { name: "#Itproblem", title: "Отмечаются проактивные работы по выгрузкам из SCCM и Zabbix СЛ ППКС, обычно присылается готовый шаблон в письме с списком активностей и хостов." },
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
    { name: "#РУК", title: "#РУК ПО «наименование ПО» установлено. Ярлык на рабочем столе либо в меню Пуск." },
    { name: "#AC", title: "#AC ПО «наименование ПО» установлено. ПО опубликовано на учетную запись пользователя, в дальнейшем, при смене компьютера в корпоративной сети ПО будет устанавливаться автоматически." },
];

//================ End Config =====================================================================================

const Ritm = {
    type: "Ritm",
    max: "maxElemRITM",
    closeComment_el: "ActivityPageV2DetailedResultMemoEdit-el",
    closeComment_virtual: "ActivityPageV2DetailedResultMemoEdit-virtual",
    buttonslayout: "ActivityPageV2InformationClosedAndPausedGridLayoutGridLayout-item-ActivityPageV2DetailedResultContainer",
    hashtagsLevel: hashtagsLevelRitm,
    hashtagCont: minHashtagCountRITM,
    defHashtagCont: minHashtagCountRITM,
}

const Inc = {
    type: "Inc",
    max: "maxElemINC",
    closeComment_el: "ActivityPageV2DetailedResultIncidentMemoEdit-el",
    closeComment_virtual: "ActivityPageV2DetailedResultIncidentMemoEdit-virtual",
    buttonslayout: "ActivityPageV2InformationClosedAndPausedIncidentGridLayoutGridLayout-item-ActivityPageV2DetailedResultIncidentContainer",
    hashtagsLevel: hashtagsLevelINC,
    hashtagCont: minHashtagCountINC,
    defHashtagCont: minHashtagCountINC,
}

let Task;
const commend = getCommentField();
const regHash = /(#\S+)\s+?/gm;

(function () {
    'use strict';

    main();
    inputRecheak();
})();

function main() {
    ifTask();
}

function ifTask() {
    const ifReady = setInterval(function () {
        const elem = document.getElementById("MainHeaderSchemaPageHeaderCaptionLabel");
        if (elem != null) {
            const regex = /(TASK)\d*/gm;
            if (elem.textContent.match(regex)) {
                clearInterval(ifReady);
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

function hashSort(hashtag = ``) {
    let text = commend.closeComment_virtual.value;
    const hashtagIt = text.match(regHash)+hashtag;

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
    const text = commend.closeComment_virtual.value;
    const hashtagIt = text.match(regHash);
    if (hashtagIt == null) {
        commend.closeComment_el.style.backgroundColor = "#ff262638";
        return;
    }
    if (hashtagIt.length < Task.hashtagCont)
        commend.closeComment_el.style.backgroundColor = "#ff262638";
    else {
        commend.closeComment_el.style.backgroundColor = null;
    }
}

function genButton(type, el) {
    return `<button class="${type}" title="${el.title}">${el.name}</button>`
}

function genRow(el) {
    return `<div class="grid-layout-row ts-box-sizing hashButtons" id="hashButtons">
            <div class="ts-box-sizing base-edit-with-right-icon base-edit-disabled date-edit datetime-datecontrol">
                ${el}
            </div>
        </div>`
}

function generateButtHash() {
    let buttons = ``;
    for (let i = 0; i < Task.hashtagsLevel; i++) {
        let batton = ``;
        for (let el of Hashtags[i]) {
            batton += genButton("Hashtag", el);
        }
        buttons += genRow(batton);
    }
    return `
        <div  id="el1">
            ${buttons}
            ${genRow(`<button class="Sort">Отсортировать #</button>`)}
            ${generateButtAns()}
        </div>`;
}

function generateButtAns() {
    let buttons = ``;
    for (const el of Answers) {
        buttons += genButton("Answer", el);
    }
    return genRow(buttons);
}

function addButtons() {
    if (document.getElementById("hashButtons") != null)
        return;
    const closeLayout = document.getElementById(Task.buttonslayout);
    const parent = closeLayout.parentElement;
    parent.insertAdjacentHTML("beforebegin", generateButtHash());
    buttonHandler();
}

function buttonHandler() {
    document.getElementById("el1").onclick = (e) => {
        if (e.target.tagName == "BUTTON") {
            if (e.target.className == "Hashtag")
                addHashtag(e.target.textContent + " ");
            if (e.target.className == "Sort")
                hashSort();
            if (e.target.className == "Answer")
                setText(e.target.title);
        }
    };
}

function addHashtag(hashtag) {
    hashSort(hashtag+` `);
    generateEvent();
    tasktype();
}

function setText(text) {
    commend.closeComment_virtual.value = text;
    commend.closeComment_el.value = text;
    generateEvent();
    tasktype();
}

function getCommentField() {
    const closeComment_el = document.getElementById(Task.closeComment_el);
    const closeComment_virtual = document.getElementById(Task.closeComment_virtual);
    return { closeComment_el, closeComment_virtual };
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