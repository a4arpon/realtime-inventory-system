import { apiHandler, response } from "#app/utils/http"

async function myReservations(req) {
  return response({
    message: "hello world"
  })
}

async function purchaseReservedDrop(req) {
  return response({
    message: ""
  })
}

export const publicReservationsController = {
  myReservations: apiHandler(myReservations),
  purchaseReservedDrop: apiHandler(purchaseReservedDrop)
}
