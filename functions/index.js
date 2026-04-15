const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");

admin.initializeApp();

// Trigger when startCycle is turned on
exports.onCycleStart = functions.database
  .ref("boxes/{boxId}/startCycle")
  .onWrite(async (change, context) => {
    const isNowOn = change.after.val();

    // Only run when startCycle becomes true
    if (!isNowOn) return null;

    const boxId = context.params.boxId;
    const db = admin.database();

    try {
      // ✅ DO NOT touch cycleEndTime here
      // Let frontend fully control timing

      await db.ref("boxes/" + boxId).update({
        cycleInProgress: true,
        startCycle: null // reset trigger
      });

      console.log(`Cycle started for box ${boxId}`);

    } catch (err) {
      console.error("Error starting cycle:", err);
    }

    return null;
  });