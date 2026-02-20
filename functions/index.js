const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
admin.initializeApp();

exports.startCycle = functions.database
    .ref("users/{uid}/cycleInProgress")
    .onWrite(async (change, context) => {
        const wasOff = !change.before.val();
        const isNowOn = change.after.val();

        if (!wasOff || !isNowOn) return null;

        const uid = context.params.uid;
        const db = admin.database();

        const userSnap = await db.ref("users/" + uid).get();
        const boxId = userSnap.val().boxId;

        for (let timeLeft = 25; timeLeft >= 0; timeLeft -= 5) {
            await new Promise((resolve) => setTimeout(resolve, 5000));

            const snapshot = await db.ref("users")
                .orderByChild("boxId").equalTo(boxId).get();
            const updates = {};
            snapshot.forEach((child) => {
                updates[child.key + "/timeLeftInCycle"] = timeLeft;
                if (timeLeft === 0) {
                    updates[child.key + "/cycleInProgress"] = false;
                }
            });
            await db.ref("users").update(updates);
        }

        return null;
    });