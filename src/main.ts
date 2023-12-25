import { runRoomStrategy } from "./room";

module.exports.loop = function() {
    for (const room of Object.values(Game.rooms)) {
        runRoomStrategy(room);
    }
}