"use strict";

// ---- Data: single source of truth ----
const members = [
    { id: 1, name: "Abebe", team: "Dev A1" },
    { id: 2, name: "Hana", team: "Dev A2" },
    { id: 3, name: "Dawit", team: "Dev A3" }
];
let nextId = 4;
let searchText = "";

// ---- Select the elements ----
const memberForm = document.getElementById("memberForm");
const memberName = document.getElementById("memberName");
const memberTeam = document.getElementById("memberTeam");
const nameCounter = document.getElementById("nameCounter");
const livePreview = document.getElementById("livePreview");
const message = document.getElementById("message");
const searchInput = document.getElementById("searchInput");
const memberCount = document.getElementById("memberCount");
const membersList = document.getElementById("membersList");
const emptyState = document.getElementById("emptyState");
const clearAllButton = document.getElementById("clearAllButton");

// ---- Helpers and rendering ----
function showMessage(text, type) {
    message.textContent = text;
    message.className = type; // "success" or "error"
}

function getVisibleMembers() {
    return members.filter(function (member) {
        return member.name.toLowerCase().includes(searchText.toLowerCase());
    });
}

function displayMembers() {
    const visibleMembers = getVisibleMembers();
    membersList.replaceChildren();

    visibleMembers.forEach(function (member) {
        const item = document.createElement("li");
        const details = document.createElement("span");
        const removeButton = document.createElement("button");

        item.dataset.id = member.id;
        details.textContent = `${member.name} — ${member.team}`;
        removeButton.textContent = "Remove";
        removeButton.type = "button";
        removeButton.className = "remove-button";
        removeButton.setAttribute("aria-label", `Remove ${member.name}`);

        item.append(details, removeButton);
        membersList.appendChild(item);
    });

    memberCount.textContent = `Total Members: ${members.length}`;
    if (visibleMembers.length !== members.length) {
        memberCount.textContent += ` (showing ${visibleMembers.length})`;
    }

    emptyState.hidden = visibleMembers.length > 0;
    emptyState.textContent = members.length === 0
        ? "No members yet. Add the first member above."
        : "No members match your search.";
    clearAllButton.disabled = members.length === 0;
}

displayMembers();

// ---- Live preview and counter helpers ----
function resetFormHelpers() {
    nameCounter.textContent = `0 / ${memberName.maxLength}`;
    livePreview.textContent = "";
}

function updateLivePreview() {
    nameCounter.textContent = `${memberName.value.length} / ${memberName.maxLength}`;
    const name = memberName.value.trim();
    const team = memberTeam.value.trim();
    livePreview.textContent = (name || team)
        ? `Preview: ${name || "..."} — ${team || "..."}`
        : "";
}

// ---- Event: submit (add a member) ----
memberForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = memberName.value.trim();
    const team = memberTeam.value.trim();

    if (!name || !team) {
        showMessage("Please enter both a name and a team.", "error");
        return;
    }
    if (name.length < 2) {
        showMessage("The name must be at least 2 characters.", "error");
        return;
    }

    const isDuplicate = members.some(function (member) {
        return member.name.toLowerCase() === name.toLowerCase() &&
            member.team.toLowerCase() === team.toLowerCase();
    });
    if (isDuplicate) {
        showMessage(`${name} is already in ${team}.`, "error");
        return;
    }

    members.push({ id: nextId++, name: name, team: team });
    displayMembers();
    memberForm.reset();
    resetFormHelpers();
    memberName.focus();
    showMessage(`${name} was added to ${team}.`, "success");
});

// ---- Event: input (live preview and counter) ----
memberName.addEventListener("input", updateLivePreview);
memberTeam.addEventListener("input", updateLivePreview);

// ---- Event: click on the list (delegation, remove a member) ----
membersList.addEventListener("click", function (event) {
    const removeButton = event.target.closest(".remove-button");
    if (!removeButton) {
        return;
    }

    const id = Number(removeButton.closest("li").dataset.id);
    const index = members.findIndex(function (member) {
        return member.id === id;
    });
    if (index === -1) {
        return;
    }

    const removed = members.splice(index, 1)[0];
    displayMembers();
    showMessage(`${removed.name} was removed.`, "success");
});

// ---- Event: input (search) ----
searchInput.addEventListener("input", function () {
    searchText = searchInput.value.trim();
    displayMembers();
});

// ---- Event: click (clear all) ----
clearAllButton.addEventListener("click", function () {
    if (members.length === 0) {
        return;
    }
    if (!confirm("Remove all members? This cannot be undone.")) {
        return;
    }
    members.length = 0;
    displayMembers();
    showMessage("All members were removed.", "success");
});