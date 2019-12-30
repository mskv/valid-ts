import express from "express";

import { and, eq, err, isOk, number, ok, or, shape, string } from "../../../src";

const app = express();

const numberToInt = and(number, (num) => ok(Math.round(num)));

const stringToInt = and(string, (str) => {
  const parsed = parseInt(str, 10);

  return Number.isNaN(parsed)
    ? err({ kind: "StringToIntCastError" as const })
    : ok(parsed);
});

const reservationCommandValidator = or(
  shape({
    kind: eq("RequestTicketReservation" as const),
    ticketId: or(numberToInt, stringToInt),
  }),
  shape({
    kind: eq("RevokeTicketReservation" as const),
    reservationId: string,
  }),
  shape({
    kind: eq("ArchiveTicketReservation" as const),
    reservationId: string,
  }),
);

app.post(
  "/reservation",
  express.json(),
  (req, res) => {
    const validation = reservationCommandValidator(req.body);

    if (isOk(validation)) {
      // tslint:disable-next-line:no-console
      console.log("Processing correctly typed and cast command", validation.value);

      return res.send("ok");
    } else {
      return res.status(400).json(validation.value);
    }
  },
);

// tslint:disable-next-line:no-console
app.listen(3000, () => { console.log("ValidTs server example listening on 3000"); });
