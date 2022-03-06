"use strict";
document.addEventListener("DOMContentLoaded", () => {
const btn = document.querySelector('#togBtn');
if (btn) {

    btn.addEventListener('click', () => {
        const ifEnabled = document.querySelector('#togBtn').checked;
        chrome.management.setEnabled(
 "mddmekafepnknkghbbogmhaiknlabdgc",ifEnabled );
})
}
})
