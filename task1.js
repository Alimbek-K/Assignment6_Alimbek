
const rooms = [
    {
        id: "balcony",
        name: "Balcony",
        floor: 2,
        guests: [
            { name: "Aigerim", color: "green", time: "20:45", aitu: false, things: ["cup", "crumbs"] },
            { name: "Aliya", color: "yellow", time: "21:15", aitu: false, things: ["phone", "cup"] },
            { name: "Madina", color: "green", time: "22:10", aitu: false, things: ["phone", "bag", "crumbs"] },
            { name: "Ivan", color: "black", time: "20:10", aitu: true, things: ["cup"] }
        ]
    },
    {
        id: "hall",
        name: "Hall",
        floor: 2,
        guests: [
            { name: "Arman", color: "yellow", time: "20:35", aitu: false, things: ["bag", "glasses"] },
            { name: "Sophia", color: "purple", time: "21:20", aitu: true, things: ["phone"] },
            { name: "Dias", color: "green", time: "19:45", aitu: true, things: [] },
            { name: "Bekzat", color: "purple", time: "20:55", aitu: false, things: ["bag", "cup", "crumbs"] },
            { name: "Aruzhan", color: "blue", time: "21:50", aitu: true, things: ["phone"] },
            { name: "Saule", color: "green", time: "21:25", aitu: false, things: ["glasses"] }
        ]
    },
    {
        id: "kitchen",
        name: "Kitchen",
        floor: 1,
        guests: [
            { name: "Nurlan", color: "red", time: "19:40", aitu: true, things: ["phone", "cup"] },
            { name: "Emma", color: "black", time: "20:15", aitu: false, things: ["bag"] },
            { name: "Timur", color: "green", time: "21:05", aitu: true, things: ["phone", "bag", "crumbs"] },
            { name: "Sergey", color: "yellow", time: "20:50", aitu: false, things: [] },
            { name: "Yerlan", color: "red", time: "21:40", aitu: true, things: ["glasses", "phone"] },
            { name: "Kamila", color: "green", time: "20:05", aitu: false, things: ["cup"] }
        ]
    },
    {
        id: "living",
        name: "Living Room",
        floor: 1,
        guests: [
            { name: "Daniel", color: "blue", time: "19:55", aitu: false, things: ["glasses"] },
            { name: "Zarina", color: "green", time: "21:10", aitu: false, things: ["bag", "phone", "crumbs"] },
            { name: "Natasha", color: "yellow", time: "20:30", aitu: true, things: [] },
            { name: "Askar", color: "black", time: "21:00", aitu: true, things: ["phone"] },
            { name: "Inkar", color: "purple", time: "20:20", aitu: false, things: ["bag"] }
        ]
    }
];

const cases = [
    "Who is in the hall?",
    "Who is dressed in yellow or purple?",
    "Which AITU students are upstairs?",
    "Who has glasses or a bag?",
    "Who came with nothing at all?",
    "Who has a phone but no bag?",
    "Who arrived between 20:30 and 21:00?",
    "Who arrived after 21:00 and is not an AITU student?",
    "Who stands right next to Askar?",
    "Who stands last in each room?",
    "Who stands third in each room?",
    "Who stands after Timur in his room?",
    "Who stands right before someone in black?",
    "In which room is Aruzhan?",
    "Which rooms have fewer than 6 guests?",
    "Which rooms have a cup but no glasses?",
    "Who came first to each room?",
    "Miras joins the party",
    "Natasha leaves the party",
    "Who took the cake?"
];

const icons = {
    phone: "📱",
    glasses: "👓",
    bag: "👜",
    cup: "☕",
    crumbs: "🍰"
};

function createGuestCard(guest) {
    const card = $("<article>")
        .addClass("guest-card")
        .addClass("color-" + guest.color)
        .toggleClass("aitu", guest.aitu)
        .attr("data-name", guest.name)
        .attr("data-time", guest.time)
        .attr("data-color", guest.color)
        .attr("data-things", guest.things.join(","));

    for (const thing of guest.things) {
        card.addClass("has-" + thing);
    }

    const avatar = $("<img>")
        .attr(
            "src",
            "https://api.dicebear.com/9.x/open-peeps/svg?seed=" +
            encodeURIComponent(guest.name)
        )
        .attr("alt", guest.name);

    card.append(
        $("<div>").addClass("avatar-ring").append(avatar),
        $("<strong>").text(guest.name),
        $("<small>").text(guest.time),
        $("<span>").addClass("things").text(
            guest.things.map(thing => icons[thing]).join(" ")
        )
    );

    if (guest.aitu) {
        card.append(
            $("<span>").addClass("aitu-badge").text("AITU")
        );
    }

    return card;
}

function renderHouse() {
    const house = $("#partyHouse");
    house.empty();

    for (const floor of [2, 1]) {
        const floorDiv = $("<div>")
            .addClass("floor")
            .attr("data-floor", floor);

        for (const room of rooms) {
            if (room.floor !== floor) {
                continue;
            }

            const roomDiv = $("<section>")
                .addClass("room")
                .attr("id", room.id)
                .attr("data-floor", room.floor);

            roomDiv.append(
                $("<h3>").text(room.name)
            );

            const guestList = $("<div>").addClass("guest-list");

            for (const guest of room.guests) {
                guestList.append(createGuestCard(guest));
            }

            roomDiv.append(guestList);
            floorDiv.append(roomDiv);
        }

        house.append(floorDiv);
    }
}

function renderCaseButtons() {
    const container = $("#caseButtons");
    container.empty();

    cases.forEach(function(title, index) {
        const button = $("<button>")
            .attr("type", "button")
            .attr("data-case", index + 1)
            .attr("title", title)
            .text("Case " + (index + 1));

        container.append(button);
    });
}

function clearSelection() {
    $(".guest-card").stop(true, true)
        .removeClass("highlight")
        .css("marginTop", "0px");

    $(".room").removeClass("highlight");

    $("#caseResult").text("Selection cleared.");
}

function showResult(number, found) {
    const names = found.map(function() {
        if ($(this).hasClass("room")) {
            return $(this).find("h3").first().text();
        }

        return $(this).attr("data-name");
    }).get();

    found.addClass("highlight");

    found.filter(".guest-card").each(function() {
        const card = $(this);

        card.stop(true, true)
            .animate({ marginTop: "-12px" }, 150)
            .animate({ marginTop: "0px" }, 150);
    });

    $("#caseResult").text(
        "Case " + number +
        " | Found: " + found.length +
        " | " + (names.join(", ") || "Nobody")
    );
}

function solveCase(number) {
    renderHouse();

    if (number === 18) {
        const miras = {
            name: "Miras",
            color: "blue",
            time: "21:20",
            aitu: true,
            things: ["phone"]
        };

        const card = createGuestCard(miras).hide();

        card.insertAfter(
            $('.guest-card[data-name="Askar"]')
        );

        card.fadeIn(500, function() {
            $(this).addClass("highlight");
        });

        $("#caseResult").text(
            "Case 18 | Miras joined the Living Room between Askar and Inkar."
        );

        return;
    }

    if (number === 19) {
        const natasha = $('.guest-card[data-name="Natasha"]');

        natasha.fadeOut(500, function() {
            $(this).remove();
        });

        $("#caseResult").text(
            "Case 19 | Natasha left the party."
        );

        return;
    }

    let found = $();

    switch (number) {
        case 1:
            found = $("#hall .guest-card");
            break;

        case 2:
            found = $(".guest-card.color-yellow, .guest-card.color-purple");
            break;

        case 3:
            found = $('.room[data-floor="2"] .guest-card.aitu');
            break;

        case 4:
            found = $(".guest-card.has-glasses, .guest-card.has-bag");
            break;

        case 5:
            found = $(".guest-card").not(
                ".has-phone, .has-glasses, .has-bag, .has-cup, .has-crumbs"
            );
            break;

        case 6:
            found = $(".guest-card.has-phone:not(.has-bag)");
            break;

        case 7:
            found = $(".guest-card").filter(function() {
                const time = $(this).attr("data-time");

                return time >= "20:30" && time <= "21:00";
            });
            break;

        case 8:
            found = $(".guest-card:not(.aitu)").filter(function() {
                return $(this).attr("data-time") > "21:00";
            });
            break;

        case 9:
            found = $('.guest-card[data-name="Askar"]')
                .prev()
                .add($('.guest-card[data-name="Askar"]').next());
            break;

        case 10:
            found = $(".guest-list .guest-card:last-child");
            break;

        case 11:
            found = $(".guest-list .guest-card:nth-child(3)");
            break;

        case 12:
            found = $('.guest-card[data-name="Timur"]').nextAll();
            break;

        case 13:
            found = $(".guest-card.color-black").prev();
            break;

        case 14:
            found = $('.guest-card[data-name="Aruzhan"]')
                .closest(".room");
            break;

        case 15:
            found = $(".room").filter(function() {
                return $(this).find(".guest-card").length < 6;
            });
            break;

        case 16:
            found = $(".room:has(.has-cup)")
                .not(":has(.has-glasses)");
            break;

        case 17:
            found = $(".guest-list .guest-card").filter(function() {
                const current = $(this);
                const list = current.closest(".guest-list");

                const earliest = list.find(".guest-card")
                    .map(function() {
                        return $(this).attr("data-time");
                    })
                    .get()
                    .sort()[0];

                return current.attr("data-time") === earliest;
            });
            break;

        case 20:
            found = $('.room[data-floor="1"] .guest-card.has-crumbs')
                .not(".has-cup")
                .filter(function() {
                    const time = $(this).attr("data-time");

                    const nextToStudent =
                        $(this).prev().hasClass("aitu") ||
                        $(this).next().hasClass("aitu");

                    return time > "21:00" &&
                           time < "21:30" &&
                           nextToStudent;
                });
            break;

        default:
            $("#caseResult").text("Invalid case number.");
            return;
    }

    showResult(number, found);
}

$("#caseButtons").on("click", "button", function() {
    const number = Number($(this).attr("data-case"));
    solveCase(number);
});

$("#clearBtn").on("click", function() {
    renderHouse();
    clearSelection();
});

renderHouse();
renderCaseButtons();
