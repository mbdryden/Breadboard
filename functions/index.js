const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
admin.initializeApp();

exports.startCycle = functions.database
    .ref("boxes/{boxId}/startCycle")
    .onWrite(async (change, context) => {
        const isNowOn = change.after.val();
        if (!isNowOn) return null;

        const boxId = context.params.boxId;
        const db = admin.database();

        const snap = await db.ref("boxes/" + boxId + "/timeLeftInCycle").get();
        const totalSeconds = snap.val();

        await db.ref("boxes/" + boxId).update({ cycleInProgress: true, startCycle: null });

        for (let timeLeft = totalSeconds; timeLeft >= 0; timeLeft -= 5) {
            await new Promise((resolve) => setTimeout(resolve, 5000));

            const cycleSnap = await db.ref("boxes/" + boxId + "/cycleInProgress").get();
            if (!cycleSnap.val()) return null;

            const updates = { timeLeftInCycle: timeLeft };
            if (timeLeft === 0) updates.cycleInProgress = false;

            await db.ref("boxes/" + boxId).update(updates);
        }
        return null;
    });