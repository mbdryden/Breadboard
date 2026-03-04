const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
admin.initializeApp();

exports.startCycle = functions.database
    .ref("boxes/{boxId}/cycleInProgress")
    .onWrite(async (change, context) => {
        const wasOff = !change.before.val();
        const isNowOn = change.after.val();
        if (!wasOff || !isNowOn) return null;

        const boxId = context.params.boxId;
        const db = admin.database();

        for (let timeLeft = 25; timeLeft >= 0; timeLeft -= 5) {
            await new Promise((resolve) => setTimeout(resolve, 5000));
            const updates = {
                timeLeftInCycle: timeLeft
            };
            if (timeLeft === 0) {
                updates.cycleInProgress = false;
            }
            await db.ref("boxes/" + boxId).update(updates);
        }

        return null;
    });