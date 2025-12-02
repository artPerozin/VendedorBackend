import dotenv from "dotenv";
dotenv.config();
import cron from "node-cron";
import { runProspection } from "./startProspectCampaign";

function isWithinSchedule(): boolean {
    const schedule = process.env.PROSPECT_SCHEDULE ?? "";
    if (!schedule) return true;

    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();

    const ranges = schedule.split(",");
    
    for (const range of ranges) {
        const [start, end] = range.split("-");
        if (!start || !end) continue;

        const [sh, sm] = start.split(":").map(Number);
        const [eh, em] = end.split(":").map(Number);

        const startMinutes = sh * 60 + sm;
        const endMinutes = eh * 60 + em;

        if (minutes >= startMinutes && minutes <= endMinutes) {
            return true;
        }
    }

    return false;
}

cron.schedule("* * * * *", async () => {
    if (!isWithinSchedule()) {
        return;
    }

    try {
        await runProspection();
    } catch (err) {
        console.error("🔥 Erro na rotina:", err);
    }
});