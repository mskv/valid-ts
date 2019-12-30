# Client usage examples

Run `npm install` and `npm run start:dev`. Then experiment with the example endpoint:

```
❯ curl -H 'content-type: application/json' -X POST localhost:3000/reservation -d '{"kind": "RequestTicketReservation", "ticketId": "123"}'
```

Note that all the types of both successful and failed validations are deeply inferred.

Another use case for this library would be to validate/sanitize/cast external API responses to make sure they match our expectations. Instead of defining a type, we might as well define the validator and get the inferred type for free.
