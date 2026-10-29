/* AFJ events — add one block per event, in any order.
   Past events move to "Past events" automatically the day after they happen.

   {
     title: "Event name",
     date: "2026-11-14",            // YYYY-MM-DD
     start: "18:30", end: "20:30",  // 24-hour times (optional)
     place: "Palestine House",      // venue (optional)
     city: "London",                // (optional)
     about: "One or two sentences about the event.",
     speakers: ["Name (role)", …],  // (optional)
     topics: ["…", "…"],            // bullet points (optional)
     image: "assets/img/events/poster.jpeg", // poster (optional)
     link: "https://…",             // sign-up / tickets / Instagram post (optional)
     linkText: "Register"           // button text (optional, default "More info")
   },
*/
window.AFJ_EVENTS = [

  {
    title: "Guidance to Islamic Activism",
    date: "2026-11-14",
    start: "17:00",
    place: "Palestine House, 113 High Holborn",
    city: "London WC1V 6JQ",
    about: "Discussion, Q&A and workshop, hosted by ABSoc for Justice with Palestine House. Everyone welcome. Tickets £6.",
    speakers: ["Zayn Ahmed, political activist", "Ammar Kazmi, legal expert", "Aymun Moosavi, political activist", "Batool Subeiti, political analyst", "and more"],
    topics: ["What is Islamic activism?", "How can Muslims engage in lawfare against Zionists?", "Who should Muslims vote for?", "How should Muslims combat Islamophobia?", "Street activism, direct action and more"],
    image: "assets/img/events/guidance-to-islamic-activism.jpeg",
    link: "https://instagram.com/absocforjustice",
    linkText: "Register (£6) — link in bio"
  },

];
