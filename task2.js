
/* Assignment 6 - Task 2 */
/* Requires task1.js loaded first */

let selectedGuest = null;
let animationBusy = false;
let modalBusy = false;
let modalOrigin = null;

const originalOrder = {};
const sortedState = {};

rooms.forEach(room => {
    originalOrder[room.id] = room.guests.map(g => g.name);
    sortedState[room.id] = false;
});

function restoreGuestOpacity() {
    $(".guest-card").stop(true, false).fadeTo(300, 1);
}

function spotlight(found) {
    const selected = found.filter(".guest-card")
        .add(found.filter(".room").find(".guest-card"));

    $(".guest-card").stop(true, false).fadeTo(300, 0.2);

    selected.stop(true, false).fadeTo(300, 1);
}

function addSortButtons() {
    $(".room").each(function() {
        const room = $(this);

        if (!room.children(".sort-button").length) {
            room.children("h3").first().after(
                $("<button type='button'>")
                    .addClass("sort-button")
                    .text("Sort by time")
            );
        }
    });
}

// Replace Task 1 handlers on this page
$("#caseButtons").off("click");
$("#clearBtn").off("click");

$("#caseButtons").on("click", "button", function() {
    if (animationBusy || modalBusy) return;

    const number = Number($(this).attr("data-case"));

    solveCase(number);
    addSortButtons();

    if (number === 18 || number === 19) {
        restoreGuestOpacity();
        return;
    }

    const found = $(".guest-card.highlight, .room.highlight");
    spotlight(found);
});

$("#clearBtn").on("click", function() {
    if (animationBusy || modalBusy) return;

    $(".guest-card, .room").removeClass("highlight");
    restoreGuestOpacity();

    $("#caseResult").text("Selection cleared.");
});

function guestDataFromCard(card) {
    const name = card.attr("data-name");

    for (const room of rooms) {
        const guest = room.guests.find(g => g.name === name);

        if (guest) return guest;
    }

    return null;
}

// OPEN GUEST CARD

function openGuestModal(card) {
    if (animationBusy || modalBusy) return;

    selectedGuest = card;

    const guest = guestDataFromCard(card);
    if (!guest) return;

    modalBusy = true;

    modalOrigin = card.find(".avatar-ring").offset()
        || card.offset();

    const avatar = card.find(".avatar-ring");
    const width = avatar.outerWidth() || 60;
    const height = avatar.outerHeight() || 60;

    const overlay = $("#guestOverlay");
    const modal = $("#guestModal");

    $("#guestDetails").empty().append(
        $("<h2>").text(guest.name),
        $("<p>").text("Came at " + guest.time),
        $("<p>").text("Clothing color: " + guest.color),
        $("<p>").text(
            guest.aitu
                ? "AITU student"
                : "Not an AITU student"
        ),
        $("<p>").text(
            guest.things.length
                ? "Has " + guest.things.join(", ")
                : "Came with nothing"
        )
    );

    $("#moveButtons").empty();

    const currentRoom = card.closest(".room").attr("id");

    $(".room").each(function() {
        const room = $(this);
        const id = room.attr("id");

        if (id !== currentRoom) {
            $("#moveButtons").append(
                $("<button type='button'>")
                    .attr("data-room", id)
                    .text(
                        "Move to " +
                        room.children("h3").text()
                    )
            );
        }
    });

    overlay.css("display", "block");

    const endWidth = Math.min(
        440,
        $(window).width() - 40
    );

    const endHeight = Math.min(
        modal.outerHeight() || 280,
        $(window).height() - 40
    );

    const endLeft = (
        $(window).width() - endWidth
    ) / 2;

    const endTop = Math.max(
        15,
        ($(window).height() - endHeight) / 2
    );

    modal.stop(true, false).css({
        position: "fixed",
        left: modalOrigin.left - $(window).scrollLeft(),
        top: modalOrigin.top - $(window).scrollTop(),
        width: width,
        height: height,
        opacity: 0.2,
        overflow: "hidden",
        margin: 0
    }).animate({
        left: endLeft,
        top: endTop,
        width: endWidth,
        height: endHeight,
        opacity: 1
    }, 350, function() {
        modal.css({
            height: "auto",
            overflow: "auto",
            maxHeight: "90vh"
        });

        modalBusy = false;
        modal.trigger("focus");
    });
}

// CLOSE GUEST CARD

function closeGuestModal(done) {
    const overlay = $("#guestOverlay");

    if (!overlay.is(":visible")) {
        if (done) done();
        return;
    }

    if (modalBusy) return;

    modalBusy = true;

    const modal = $("#guestModal");

    const origin = selectedGuest &&
        $.contains(document, selectedGuest[0])
        ? selectedGuest.find(".avatar-ring").offset()
        : modalOrigin;

    const left = origin
        ? origin.left - $(window).scrollLeft()
        : 0;

    const top = origin
        ? origin.top - $(window).scrollTop()
        : 0;

    modal.stop(true, false)
        .css({
            height: modal.outerHeight(),
            overflow: "hidden"
        })
        .animate({
            left: left,
            top: top,
            width: 60,
            height: 60,
            opacity: 0
        }, 250, function() {
            overlay.hide();
            modalBusy = false;

            if (done) done();
        });
}

$("#partyHouse").on(
    "click",
    ".guest-card",
    function() {
        openGuestModal($(this));
    }
);

$("#guestOverlay").on("click", function(event) {
    if (event.target === this) {
        closeGuestModal();
    }
});

$(document).on("keydown", function(event) {
    if (event.key === "Escape") {
        closeGuestModal();
    }
});

// MOVE GUEST

$("#moveButtons").on("click", "button", function() {
    if (animationBusy || modalBusy || !selectedGuest) {
        return;
    }

    const targetId = $(this).attr("data-room");

    const sourceId = selectedGuest
        .closest(".room")
        .attr("id");

    if (sourceId === targetId) return;

    const source = rooms.find(r => r.id === sourceId);
    const target = rooms.find(r => r.id === targetId);

    const name = selectedGuest.attr("data-name");

    if (!source || !target) return;

    const index = source.guests.findIndex(
        g => g.name === name
    );

    if (index < 0) return;

    animationBusy = true;

    const guest = source.guests[index];
    const sourceCard = selectedGuest;

    closeGuestModal(function() {
        const start = sourceCard.offset();

        const destinationList = $(
            "#" + targetId + " .guest-list"
        );

        const flying = sourceCard.clone()
            .appendTo("body")
            .css({
                position: "absolute",
                top: start.top,
                left: start.left,
                width: sourceCard.outerWidth(),
                height: sourceCard.outerHeight(),
                zIndex: 2000,
                opacity: 1,
                margin: 0,
                pointerEvents: "none"
            });

        const sourcePlaceholder = $("<div>")
            .css({
                width: sourceCard.outerWidth(),
                height: sourceCard.outerHeight()
            })
            .insertBefore(sourceCard);

        sourceCard.remove();

        sourcePlaceholder.animate({
            width: 0,
            opacity: 0
        }, 500, function() {
            $(this).remove();
        });

        const newCard = createGuestCard(guest)
            .css({
                opacity: 0,
                width: 0,
                overflow: "hidden"
            });

        destinationList.append(newCard);

        const destination = newCard.offset();

        newCard.animate({
            width: 105
        }, 550);

        flying.stop(true, false).animate({
            top: destination.top,
            left: destination.left
        }, 650, function() {
            flying.remove();

            newCard.css({
                width: "",
                overflow: ""
            }).animate({
                opacity: 1
            }, 180, function() {
                source.guests.splice(index, 1);
                target.guests.push(guest);

                originalOrder[sourceId] =
                    originalOrder[sourceId].filter(
                        n => n !== name
                    );

                originalOrder[targetId].push(name);

                animationBusy = false;
                selectedGuest = null;

                $("#caseResult").text(
                    name + " moved to " + target.name
                );
            });
        });
    });
});

// SORT BY TIME

$("#partyHouse").on(
    "click",
    ".sort-button",
    function() {
        if (animationBusy || modalBusy) return;

        const room = $(this).closest(".room");
        const id = room.attr("id");

        const data = rooms.find(r => r.id === id);
        const list = room.find(".guest-list");
        const cards = list.children(".guest-card");

        if (!cards.length) return;

        animationBusy = true;

        const before = {};

        cards.each(function() {
            before[$(this).attr("data-name")] =
                $(this).offset();
        });

        sortedState[id] = !sortedState[id];

        if (sortedState[id]) {
            data.guests.sort(
                (a, b) => a.time.localeCompare(b.time)
            );
        } else {
            data.guests.sort(
                (a, b) =>
                    originalOrder[id].indexOf(a.name) -
                    originalOrder[id].indexOf(b.name)
            );
        }

        data.guests.forEach(guest => {
            const card = cards.filter(function() {
                return $(this).attr("data-name") ===
                    guest.name;
            });

            list.append(card);
        });

        const motions = [];

        list.children(".guest-card").each(function() {
            const card = $(this);
            const name = card.attr("data-name");

            const after = card.offset();
            const old = before[name];

            const dx = old.left - after.left;
            const dy = old.top - after.top;

            card.css({
                position: "relative",
                left: dx,
                top: dy
            });

            motions.push(card);
        });

        let remaining = motions.length;

        motions.forEach(card =>
            card.stop(true, false).animate({
                left: 0,
                top: 0
            }, 500, function() {
                card.css({
                    position: "",
                    left: "",
                    top: ""
                });

                remaining--;

                if (remaining === 0) {
                    animationBusy = false;
                }
            })
        );

        $("#caseResult").text(
            "Sorted " + data.name +
            (sortedState[id]
                ? " by arrival time."
                : " to picture order.")
        );
    }
);

addSortButtons();
